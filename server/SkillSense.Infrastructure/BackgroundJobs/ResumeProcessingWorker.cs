using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Options;
using SkillSense.Infrastructure.Options;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Infrastructure.BackgroundJobs;

public sealed class ResumeProcessingWorker(
    IServiceScopeFactory scopeFactory,
    IOptions<ResumeProcessingWorkerOptions> workerOptions,
    IOptions<ResumeProcessingOptions> processingOptions,
    IResumeProcessingMonitor processingMonitor,
    IResumeProcessingTelemetry processingTelemetry,
    ILogger<ResumeProcessingWorker> logger) : BackgroundService
{
    private const int BaselineParallelism = 3;
    private const int MinParallelism = 1;
    private const int HardMaxParallelism = 20;
    private const int RollingWindowSize = 4;

    private readonly ResumeProcessingWorkerOptions _options = workerOptions.Value;
    private readonly ResumeProcessingOptions _processingOptions = processingOptions.Value;
    private readonly string _workerInstanceId = Guid.NewGuid().ToString("N");
    private readonly int _configuredParallelismCeiling = Math.Clamp(workerOptions.Value.MaxParallelResumes, MinParallelism, HardMaxParallelism);
    private readonly TimeSpan _autoTuneWindow = workerOptions.Value.AutoTuneWindow;

    private int _currentMaxParallelism = Math.Clamp(BaselineParallelism, MinParallelism, Math.Clamp(workerOptions.Value.MaxParallelResumes, MinParallelism, HardMaxParallelism));
    private ResumeProcessingTelemetrySnapshot _lastTelemetrySnapshot = processingTelemetry.GetSnapshot();
    private DateTimeOffset _lastAutoTuneAtUtc = DateTimeOffset.UtcNow;
    private readonly Queue<WindowMetrics> _rollingWindows = new();
    private SmoothedMetrics? _previousSmoothed;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _options.Validate();
        if (logger.IsEnabled(LogLevel.Information))
        {
            logger.LogInformation(
                "ResumeProcessingWorker started. WorkerInstanceId={WorkerInstanceId} BatchSize={BatchSize}, BaselineParallelism={BaselineParallelism}, ConfiguredParallelismCeiling={ConfiguredParallelismCeiling}, InitialBackoff={InitialBackoff}, MaxBackoff={MaxBackoff}, AutoTuneWindow={AutoTuneWindow}",
                _workerInstanceId,
                _options.BatchSize,
                _currentMaxParallelism,
                _configuredParallelismCeiling,
                _options.InitialBackoff,
                _options.MaxBackoff,
                _autoTuneWindow);
        }
        processingMonitor.RecordWorkerStarted();

        var currentBackoff = _options.InitialBackoff;

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                processingMonitor.RecordWorkerHeartbeat();
                logger.LogDebug("Polling for pending resume submissions.");

                var processedCount = await ProcessClaimedBatchWithConcurrencyAsync(stoppingToken);

                if (processedCount > 0)
                {
                    logger.LogInformation("Processed {ProcessedCount} resume submission(s).", processedCount);
                    processingMonitor.RecordWorkerHeartbeat();
                    currentBackoff = _options.InitialBackoff;
                    EvaluateAndTuneConcurrency(DateTimeOffset.UtcNow);
                    continue;
                }

                if (logger.IsEnabled(LogLevel.Debug))
                {
                    logger.LogDebug("No pending resume submissions found. Sleeping for {Delay}.", currentBackoff);
                }
                await Task.Delay(currentBackoff, stoppingToken);
                currentBackoff = DoubleBackoff(currentBackoff, _options.MaxBackoff);
                EvaluateAndTuneConcurrency(DateTimeOffset.UtcNow);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                if (logger.IsEnabled(LogLevel.Information))
                {
                    logger.LogInformation("ResumeProcessingWorker stop requested.");
                }
                break;
            }
            catch (Exception ex)
            {
                processingMonitor.RecordWorkerFailure(ex);
                logger.LogError(ex, "Error while processing resume queue. Retrying after {Delay}.", currentBackoff);

                try
                {
                    await Task.Delay(currentBackoff, stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }

                currentBackoff = DoubleBackoff(currentBackoff, _options.MaxBackoff);
            }
        }

        logger.LogInformation("ResumeProcessingWorker stopped.");
    }

    private static TimeSpan DoubleBackoff(TimeSpan value, TimeSpan max)
    {
        var doubledTicks = value.Ticks > long.MaxValue / 2 ? long.MaxValue : value.Ticks * 2;
        var doubled = TimeSpan.FromTicks(doubledTicks);
        return doubled <= max ? doubled : max;
    }

    private async Task<int> ProcessClaimedBatchWithConcurrencyAsync(CancellationToken stoppingToken)
    {
        Guid[] submissionIds;
        using (var claimScope = scopeFactory.CreateScope())
        {
            var submissionRepository = claimScope.ServiceProvider.GetRequiredService<IResumeSubmissionRepository>();
            var claimedBatch = await submissionRepository.ClaimProcessableBatchAsync(
                _options.BatchSize,
                DateTime.UtcNow,
                _processingOptions.MaxRetryAttempts,
                stoppingToken);

            submissionIds = [.. claimedBatch.Select(x => x.Id)];
        }

        if (submissionIds.Length == 0)
        {
            return 0;
        }

        var maxConcurrency = Math.Min(_currentMaxParallelism, submissionIds.Length);
        if (logger.IsEnabled(LogLevel.Information))
        {
            logger.LogInformation(
                "WorkerInstanceId={WorkerInstanceId} claimed {ClaimedCount} submission(s). Processing with max concurrency {MaxConcurrency}.",
                _workerInstanceId,
                submissionIds.Length,
                maxConcurrency);
        }

        using var gate = new SemaphoreSlim(maxConcurrency, maxConcurrency);
        var tasks = submissionIds.Select(id => ProcessSubmissionInIsolatedScopeAsync(id, gate, stoppingToken));
        var outcomes = await Task.WhenAll(tasks);
        return outcomes.Count(x => x);
    }

    private void EvaluateAndTuneConcurrency(DateTimeOffset nowUtc)
    {
        if (nowUtc - _lastAutoTuneAtUtc < _autoTuneWindow)
        {
            return;
        }

        var currentSnapshot = processingTelemetry.GetSnapshot();
        var windowSeconds = Math.Max(0.001d, (nowUtc - _lastAutoTuneAtUtc).TotalSeconds);
        var deltaSucceeded = currentSnapshot.SucceededCount - _lastTelemetrySnapshot.SucceededCount;
        var deltaFailed = currentSnapshot.FailedCount - _lastTelemetrySnapshot.FailedCount;
        var deltaTimeouts = currentSnapshot.TimeoutCount - _lastTelemetrySnapshot.TimeoutCount;
        var deltaParseTotalMs = currentSnapshot.ParseDurationTotalMs - _lastTelemetrySnapshot.ParseDurationTotalMs;
        var deltaScoreTotalMs = currentSnapshot.ScoreDurationTotalMs - _lastTelemetrySnapshot.ScoreDurationTotalMs;
        var deltaParseSamples = currentSnapshot.ParseSampleCount - _lastTelemetrySnapshot.ParseSampleCount;
        var deltaScoreSamples = currentSnapshot.ScoreSampleCount - _lastTelemetrySnapshot.ScoreSampleCount;

        var completedCount = Math.Max(0, deltaSucceeded + deltaFailed);
        var throughput = completedCount / windowSeconds;
        var parseAvgMs = deltaParseSamples > 0 ? deltaParseTotalMs / (double)deltaParseSamples : 0d;
        var scoreAvgMs = deltaScoreSamples > 0 ? deltaScoreTotalMs / (double)deltaScoreSamples : 0d;
        var errorRate = completedCount > 0 ? deltaFailed / (double)completedCount : 0d;
        var timeoutRate = completedCount > 0 ? Math.Max(0, deltaTimeouts) / (double)completedCount : 0d;

        _rollingWindows.Enqueue(new WindowMetrics(throughput, parseAvgMs, scoreAvgMs, errorRate, timeoutRate));
        while (_rollingWindows.Count > RollingWindowSize)
        {
            _rollingWindows.Dequeue();
        }

        if (_rollingWindows.Count >= 3)
        {
            var smoothed = Smooth(_rollingWindows);
            if (_previousSmoothed is not null)
            {
                var previous = _previousSmoothed.Value;
                var shouldScaleDown =
                    (previous.ParseAvgMs > 0 && smoothed.ParseAvgMs > previous.ParseAvgMs * 1.2)
                    || (previous.ScoreAvgMs > 0 && smoothed.ScoreAvgMs > previous.ScoreAvgMs * 1.2)
                    || (previous.ErrorRate > 0 && smoothed.ErrorRate > previous.ErrorRate * 1.5)
                    || (previous.TimeoutRate > 0 && smoothed.TimeoutRate > previous.TimeoutRate * 1.5)
                    || smoothed.ErrorRate >= 0.1
                    || smoothed.TimeoutRate >= 0.05;

                var shouldScaleUp =
                    smoothed.ThroughputRps > previous.ThroughputRps * 1.03
                    && (previous.ParseAvgMs <= 0 || smoothed.ParseAvgMs <= previous.ParseAvgMs * 1.1)
                    && (previous.ScoreAvgMs <= 0 || smoothed.ScoreAvgMs <= previous.ScoreAvgMs * 1.1)
                    && smoothed.ErrorRate < 0.05
                    && smoothed.TimeoutRate < 0.02
                    && IsConsistentTrendIncreasing();

                var oldParallelism = _currentMaxParallelism;
                if (shouldScaleDown)
                {
                    _currentMaxParallelism = Math.Max(MinParallelism, _currentMaxParallelism - 2);
                }
                else if (shouldScaleUp)
                {
                    _currentMaxParallelism = Math.Min(_configuredParallelismCeiling, _currentMaxParallelism + 1);
                }

                if (_currentMaxParallelism != oldParallelism && logger.IsEnabled(LogLevel.Information))
                {
                    logger.LogInformation(
                        "[AutoTune] Parallel={OldParallelism} -> {NewParallelism} | Throughput={Throughput:0.00}/s | ParseAvg={ParseAvg:0}ms | ScoreAvg={ScoreAvg:0}ms | ErrorRate={ErrorRate:P1} | TimeoutRate={TimeoutRate:P1}",
                        oldParallelism,
                        _currentMaxParallelism,
                        smoothed.ThroughputRps,
                        smoothed.ParseAvgMs,
                        smoothed.ScoreAvgMs,
                        smoothed.ErrorRate,
                        smoothed.TimeoutRate);
                }
            }

            _previousSmoothed = smoothed;
        }

        _lastTelemetrySnapshot = currentSnapshot;
        _lastAutoTuneAtUtc = nowUtc;
    }

    private bool IsConsistentTrendIncreasing()
    {
        if (_rollingWindows.Count < 3)
        {
            return false;
        }

        var last3 = _rollingWindows.Skip(Math.Max(0, _rollingWindows.Count - 3)).ToArray();
        return last3[2].ThroughputRps >= last3[1].ThroughputRps
            && last3[1].ThroughputRps >= last3[0].ThroughputRps;
    }

    private static SmoothedMetrics Smooth(IEnumerable<WindowMetrics> windows)
    {
        var items = windows.ToArray();
        return new SmoothedMetrics(
            items.Average(x => x.ThroughputRps),
            items.Average(x => x.ParseAvgMs),
            items.Average(x => x.ScoreAvgMs),
            items.Average(x => x.ErrorRate),
            items.Average(x => x.TimeoutRate));
    }

    private readonly record struct WindowMetrics(
        double ThroughputRps,
        double ParseAvgMs,
        double ScoreAvgMs,
        double ErrorRate,
        double TimeoutRate);

    private readonly record struct SmoothedMetrics(
        double ThroughputRps,
        double ParseAvgMs,
        double ScoreAvgMs,
        double ErrorRate,
        double TimeoutRate);

    private async Task<bool> ProcessSubmissionInIsolatedScopeAsync(Guid submissionId, SemaphoreSlim gate, CancellationToken stoppingToken)
    {
        await gate.WaitAsync(stoppingToken);
        try
        {
            using var submissionScope = scopeFactory.CreateScope();
            var processingService = submissionScope.ServiceProvider.GetRequiredService<IResumeProcessingService>();
            return await processingService.ProcessClaimedSubmissionAsync(submissionId, stoppingToken);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            processingMonitor.RecordWorkerFailure(ex);
            logger.LogError(ex, "WorkerInstanceId={WorkerInstanceId} failed to process claimed resume submission {SubmissionId}.", _workerInstanceId, submissionId);
            return false;
        }
        finally
        {
            gate.Release();
        }
    }
}
