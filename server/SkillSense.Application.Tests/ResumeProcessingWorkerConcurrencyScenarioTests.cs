using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Options;
using SkillSense.Domain.Entities;
using SkillSense.Infrastructure.BackgroundJobs;
using SkillSense.Infrastructure.Options;
using SkillSense.Persistence.Interfaces;
using System.Text.RegularExpressions;
using System.Text.Json;

namespace SkillSense.Application.Tests;

public sealed partial class ResumeProcessingWorkerConcurrencyScenarioTests
{
    [Fact]
    public async Task Worker_WithPendingBatch_ProcessesResumesConcurrently_WithParseAndScoreOverlap()
    {
        const int seededPendingCount = 8;

        var store = new ScenarioStore();
        store.SeedPendingSubmissions(seededPendingCount);

        Assert.Equal(seededPendingCount, store.CountByStatus(ResumeSubmissionStatus.Pending));

        var logCollector = new InMemoryLogCollector();
        var services = new ServiceCollection();
        services.AddSingleton(store);
        services.AddSingleton(logCollector);
        services.AddLogging(builder =>
        {
            builder.SetMinimumLevel(LogLevel.Information);
            builder.AddProvider(logCollector);
        });
        services.AddSingleton<IResumeProcessingMonitor, ResumeProcessingMonitor>();
        services.AddSingleton<IResumeProcessingTelemetry, ResumeProcessingTelemetry>();
        services.AddScoped<IResumeSubmissionRepository, ScenarioResumeSubmissionRepository>();
        services.AddScoped<IResumeProcessingService, ScenarioResumeProcessingService>();

        await using var provider = services.BuildServiceProvider();

        var worker = new ResumeProcessingWorker(
            provider.GetRequiredService<IServiceScopeFactory>(),
            Microsoft.Extensions.Options.Options.Create(new ResumeProcessingWorkerOptions
            {
                BatchSize = seededPendingCount,
                MaxParallelResumes = 5,
                IdleTimeout = TimeSpan.FromSeconds(5),
                InitialBackoff = TimeSpan.FromMilliseconds(200),
                MaxBackoff = TimeSpan.FromSeconds(2),
            }),
            Microsoft.Extensions.Options.Options.Create(new ResumeProcessingOptions
            {
                MaxRetryAttempts = 5,
                BaseRetryDelay = TimeSpan.FromMilliseconds(200),
                MaxRetryDelay = TimeSpan.FromSeconds(5),
            }),
            provider.GetRequiredService<IResumeProcessingMonitor>(),
            provider.GetRequiredService<IResumeProcessingTelemetry>(),
            provider.GetRequiredService<ILogger<ResumeProcessingWorker>>());

        using var runCts = new CancellationTokenSource(TimeSpan.FromSeconds(20));
        await worker.StartAsync(runCts.Token);

        await WaitUntilAsync(
            () => store.CountByStatus(ResumeSubmissionStatus.Completed) == seededPendingCount,
            TimeSpan.FromSeconds(15),
            runCts.Token);

        runCts.Cancel();
        await worker.StopAsync(CancellationToken.None);

        var parseWindows = store.GetStepWindows("parse");
        var scoreWindows = store.GetStepWindows("score");
        var pipelineWindows = store.GetPipelineWindows();

        Assert.Equal(seededPendingCount, parseWindows.Count);
        Assert.Equal(seededPendingCount, scoreWindows.Count);
        Assert.Equal(seededPendingCount, pipelineWindows.Count);

        Assert.True(HasOverlap(parseWindows), "Expected parse overlap but none was detected.");
        Assert.True(HasOverlap(scoreWindows), "Expected score overlap but none was detected.");
        Assert.True(HasOverlap(pipelineWindows), "Expected pipeline overlap but none was detected.");

        var wallStart = pipelineWindows.Min(x => x.StartUtc);
        var wallEnd = pipelineWindows.Max(x => x.EndUtc);
        var wallSeconds = (wallEnd - wallStart).TotalSeconds;
        var totalProcessingSeconds = pipelineWindows.Sum(x => (x.EndUtc - x.StartUtc).TotalSeconds);
        var concurrencyRatio = totalProcessingSeconds / wallSeconds;
        var throughput = seededPendingCount / wallSeconds;

        var parseOverlapExample = FindFirstOverlap(parseWindows);
        var scoreOverlapExample = FindFirstOverlap(scoreWindows);

        Assert.True(concurrencyRatio > 1.2,
            $"Expected concurrency ratio > 1.2, got {concurrencyRatio:0.000}. wallSeconds={wallSeconds:0.000}, totalSeconds={totalProcessingSeconds:0.000}");
        Assert.True(throughput > 0.63,
            $"Expected throughput improvement over 0.63 rps baseline, got {throughput:0.000} rps.");

        var stepLogs = logCollector.Entries.Where(e => e.Message.Contains("resume_id=", StringComparison.Ordinal)).ToList();
        Assert.NotEmpty(stepLogs);

        var stepRegex = StepLogRegex();

        var matchedLogCount = stepLogs.Count(entry => stepRegex.IsMatch(entry.Message));
        Assert.True(matchedLogCount >= seededPendingCount * 3,
            $"Expected at least {seededPendingCount * 3} structured step logs, got {matchedLogCount}.");

        var sampleStepLogs = stepLogs
            .Select(x => x.Message)
            .Take(15)
            .ToList();

        var report = new
        {
            SeededPending = seededPendingCount,
            Processed = pipelineWindows.Count,
            ExecutionMode = parseOverlapExample is not null || scoreOverlapExample is not null ? "PARALLEL" : "SEQUENTIAL",
            WallSeconds = Math.Round(wallSeconds, 3),
            TotalProcessingSeconds = Math.Round(totalProcessingSeconds, 3),
            ConcurrencyRatio = Math.Round(concurrencyRatio, 3),
            ThroughputRps = Math.Round(throughput, 3),
            StructuredStepLogCount = matchedLogCount,
            SampleStepLogs = sampleStepLogs,
            ParseOverlapExample = parseOverlapExample,
            ScoreOverlapExample = scoreOverlapExample,
        };

        var reportJson = JsonSerializer.Serialize(report, new JsonSerializerOptions { WriteIndented = true });
        var reportPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../..", "resume-concurrency-scenario-output.json"));
        await File.WriteAllTextAsync(reportPath, reportJson, CancellationToken.None);
    }

    private static async Task WaitUntilAsync(Func<bool> condition, TimeSpan timeout, CancellationToken ct)
    {
        var started = DateTime.UtcNow;
        while (!condition())
        {
            if (DateTime.UtcNow - started > timeout)
            {
                throw new TimeoutException("Timed out waiting for worker scenario to complete.");
            }

            ct.ThrowIfCancellationRequested();
            await Task.Delay(50, ct);
        }
    }

    private static bool HasOverlap(IReadOnlyList<WindowRecord> windows)
    {
        for (var i = 0; i < windows.Count; i++)
        {
            for (var j = i + 1; j < windows.Count; j++)
            {
                var a = windows[i];
                var b = windows[j];
                if (a.SubmissionId == b.SubmissionId)
                {
                    continue;
                }

                var latestStart = a.StartUtc > b.StartUtc ? a.StartUtc : b.StartUtc;
                var earliestEnd = a.EndUtc < b.EndUtc ? a.EndUtc : b.EndUtc;
                if (latestStart < earliestEnd)
                {
                    return true;
                }
            }
        }

        return false;
    }

    private static object? FindFirstOverlap(IReadOnlyList<WindowRecord> windows)
    {
        for (var i = 0; i < windows.Count; i++)
        {
            for (var j = i + 1; j < windows.Count; j++)
            {
                var a = windows[i];
                var b = windows[j];
                if (a.SubmissionId == b.SubmissionId)
                {
                    continue;
                }

                var latestStart = a.StartUtc > b.StartUtc ? a.StartUtc : b.StartUtc;
                var earliestEnd = a.EndUtc < b.EndUtc ? a.EndUtc : b.EndUtc;
                if (latestStart < earliestEnd)
                {
                    return new
                    {
                        ASubmissionId = a.SubmissionId,
                        AStartUtc = a.StartUtc,
                        AEndUtc = a.EndUtc,
                        BSubmissionId = b.SubmissionId,
                        BStartUtc = b.StartUtc,
                        BEndUtc = b.EndUtc,
                        OverlapMs = Math.Round((earliestEnd - latestStart).TotalMilliseconds, 3),
                    };
                }
            }
        }

        return null;
    }

    [GeneratedRegex(
        "resume_id=(?<id>[0-9a-f\\-]{36}) step=(?<step>\\w+) start=(?<start>[^ ]+) end=(?<end>[^ ]+)",
        RegexOptions.CultureInvariant)]
    private static partial Regex StepLogRegex();

    private sealed class ScenarioResumeProcessingService(
        ScenarioStore store,
        IResumeSubmissionRepository repository,
        ILogger<ScenarioResumeProcessingService> logger) : IResumeProcessingService
    {
        public Task<int> ProcessPendingBatchAsync(int batchSize, CancellationToken ct = default)
            => throw new NotSupportedException("Scenario uses claimed-submission path via worker orchestration.");

        public async Task<bool> ProcessClaimedSubmissionAsync(Guid submissionId, CancellationToken ct = default)
        {
            var submission = await repository.GetByIdAsync(submissionId, ct);
            if (submission is null)
            {
                return false;
            }

            var pipelineStart = DateTimeOffset.UtcNow;

            await RunStepAsync(submissionId, "parse", 320, ct);
            await RunStepAsync(submissionId, "score", 360, ct);
            await RunStepAsync(submissionId, "persist", 80, ct);

            submission.Status = ResumeSubmissionStatus.Completed;
            submission.UpdatedAtUtc = DateTime.UtcNow;
            await repository.SaveChangesAsync(ct);

            var pipelineEnd = DateTimeOffset.UtcNow;
            store.RecordPipelineWindow(submissionId, pipelineStart, pipelineEnd);
            return true;
        }

        private async Task RunStepAsync(Guid submissionId, string step, int delayMs, CancellationToken ct)
        {
            var start = DateTimeOffset.UtcNow;
            await Task.Delay(delayMs, ct);
            var end = DateTimeOffset.UtcNow;

            store.RecordStepWindow(submissionId, step, start, end);
            if (logger.IsEnabled(LogLevel.Information))
            {
                logger.LogInformation(
                    "resume_id={ResumeId} step={Step} start={StepStart:o} end={StepEnd:o} thread_id={ThreadId} task_id={TaskId}",
                    submissionId,
                    step,
                    start,
                    end,
                    Environment.CurrentManagedThreadId,
                    Task.CurrentId);
            }
        }
    }

    private sealed class ScenarioResumeSubmissionRepository(ScenarioStore store) : IResumeSubmissionRepository
    {
        public Task AddAsync(ResumeSubmissionEntity submission, CancellationToken ct = default)
        {
            store.AddSubmission(submission);
            return Task.CompletedTask;
        }

        public Task<ResumeSubmissionEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)
            => Task.FromResult(store.GetById(id));

        public Task<ResumeSubmissionEntity?> GetNextPendingAsync(CancellationToken ct = default)
            => Task.FromResult(store.GetNextPending());

        public Task<List<ResumeSubmissionEntity>> ClaimProcessableBatchAsync(int batchSize, DateTime utcNow, int maxRetryAttempts, CancellationToken ct = default)
            => Task.FromResult(store.ClaimProcessableBatch(batchSize, utcNow, maxRetryAttempts));

        public Task<bool> ExistsActiveApplicationAsync(Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default)
            => Task.FromResult(false);

        public Task<ResumeSubmissionEntity?> GetActiveApplicationAsync(Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default)
            => Task.FromResult<ResumeSubmissionEntity?>(null);

        public Task SaveChangesAsync(CancellationToken ct = default)
            => Task.CompletedTask;
    }

    private sealed class ScenarioStore
    {
        private readonly System.Threading.Lock _sync = new();
        private readonly List<ResumeSubmissionEntity> _submissions = [];
        private readonly List<WindowRecord> _stepWindows = [];
        private readonly List<WindowRecord> _pipelineWindows = [];

        public void SeedPendingSubmissions(int count)
        {
            var now = DateTime.UtcNow.AddMinutes(-1);
            lock (_sync)
            {
                for (var i = 0; i < count; i++)
                {
                    _submissions.Add(new ResumeSubmissionEntity
                    {
                        Id = Guid.NewGuid(),
                        CompanyId = Guid.NewGuid(),
                        JobId = Guid.NewGuid(),
                        FileName = $"candidate-{i + 1}.pdf",
                        ContentType = "application/pdf",
                        BlobObjectKey = $"resume/candidate-{i + 1}.pdf",
                        AppliedJobPosition = "Backend Engineer",
                        Status = ResumeSubmissionStatus.Pending,
                        CreatedAtUtc = now.AddMilliseconds(i),
                        UpdatedAtUtc = now.AddMilliseconds(i),
                    });
                }
            }
        }

        public void AddSubmission(ResumeSubmissionEntity submission)
        {
            lock (_sync)
            {
                _submissions.Add(submission);
            }
        }

        public ResumeSubmissionEntity? GetById(Guid id)
        {
            lock (_sync)
            {
                return _submissions.FirstOrDefault(x => x.Id == id);
            }
        }

        public ResumeSubmissionEntity? GetNextPending()
        {
            lock (_sync)
            {
                return _submissions
                    .OrderBy(x => x.CreatedAtUtc)
                    .FirstOrDefault(x => x.Status == ResumeSubmissionStatus.Pending);
            }
        }

        public List<ResumeSubmissionEntity> ClaimProcessableBatch(int batchSize, DateTime utcNow, int maxRetryAttempts)
        {
            lock (_sync)
            {
                var claimable = _submissions
                    .Where(x => x.Status == ResumeSubmissionStatus.Pending
                        || (x.Status == ResumeSubmissionStatus.Failed
                            && x.RetryCount < maxRetryAttempts
                            && x.NextRetryAtUtc.HasValue
                            && x.NextRetryAtUtc <= utcNow))
                    .OrderBy(x => x.CreatedAtUtc)
                    .Take(batchSize)
                    .ToList();

                foreach (var submission in claimable)
                {
                    submission.Status = ResumeSubmissionStatus.Processing;
                    submission.UpdatedAtUtc = utcNow;
                    submission.NextRetryAtUtc = null;
                }

                return claimable;
            }
        }

        public int CountByStatus(ResumeSubmissionStatus status)
        {
            lock (_sync)
            {
                return _submissions.Count(x => x.Status == status);
            }
        }

        public void RecordStepWindow(Guid submissionId, string step, DateTimeOffset startUtc, DateTimeOffset endUtc)
        {
            lock (_sync)
            {
                _stepWindows.Add(new WindowRecord(submissionId, step, startUtc, endUtc));
            }
        }

        public void RecordPipelineWindow(Guid submissionId, DateTimeOffset startUtc, DateTimeOffset endUtc)
        {
            lock (_sync)
            {
                _pipelineWindows.Add(new WindowRecord(submissionId, "pipeline", startUtc, endUtc));
            }
        }

        public IReadOnlyList<WindowRecord> GetStepWindows(string step)
        {
            lock (_sync)
            {
                return [.. _stepWindows.Where(x => x.Step.Equals(step, StringComparison.OrdinalIgnoreCase))];
            }
        }

        public IReadOnlyList<WindowRecord> GetPipelineWindows()
        {
            lock (_sync)
            {
                return [.. _pipelineWindows];
            }
        }
    }

    private sealed class InMemoryLogCollector : ILoggerProvider
    {
        private readonly System.Threading.Lock _sync = new();
        private readonly List<LogEntry> _entries = [];

        public IReadOnlyList<LogEntry> Entries
        {
            get
            {
                lock (_sync)
                {
                    return [.. _entries];
                }
            }
        }

        public ILogger CreateLogger(string categoryName) => new InMemoryLogger(this, categoryName);

        public void Dispose()
        {
        }

        private void Add(LogEntry entry)
        {
            lock (_sync)
            {
                _entries.Add(entry);
            }
        }

        private sealed class InMemoryLogger(InMemoryLogCollector owner, string categoryName) : ILogger
        {
            public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

            public bool IsEnabled(LogLevel logLevel) => true;

            public void Log<TState>(
                LogLevel logLevel,
                EventId eventId,
                TState state,
                Exception? exception,
                Func<TState, Exception?, string> formatter)
            {
                owner.Add(new LogEntry(DateTimeOffset.UtcNow, categoryName, logLevel, formatter(state, exception)));
            }
        }
    }

    private sealed record LogEntry(DateTimeOffset TimestampUtc, string Category, LogLevel Level, string Message);
}

public sealed record WindowRecord(Guid SubmissionId, string Step, DateTimeOffset StartUtc, DateTimeOffset EndUtc);