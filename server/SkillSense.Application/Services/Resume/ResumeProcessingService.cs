using SkillSense.Application.Common.Jobs;
using SkillSense.Application.Common.Recruiter;
using SkillSense.Application.Common.Scoring;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Exceptions;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Options;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace SkillSense.Application.Services.Resume;

/// <summary>
/// Processes queued resume submissions, parses uploaded files, builds embeddings, and stores scoring results.
/// </summary>
public sealed class ResumeProcessingService(
    IObjectStorageService objectStorageService,
    IResumeSubmissionRepository resumeSubmissionRepository,
    IJobRepository jobRepository,
    IResumeParserClient parserClient,
    IResumeScoreRepository resumeScoreRepository,
    IResumeEmbeddingRepository resumeEmbeddingRepository,
    IResumeScoringOrchestrator scoringOrchestrator,
    IAppCacheService cacheService,
    IResumeProcessingMonitor processingMonitor,
    IOptions<ResumeProcessingOptions> processingOptions,
    ILogger<ResumeProcessingService> logger,
    IResumeProcessingTelemetry? processingTelemetry = null) : IResumeProcessingService
{
    private const int SlowLaneRetryThreshold = 4;
    private static readonly TimeSpan PostThreeFailuresDelay = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan MinimumRetryDelay = TimeSpan.FromSeconds(1);

    private readonly ResumeProcessingOptions _processingOptions = processingOptions.Value;

    /// <summary>
    /// Processes the next pending submissions up to the requested batch size.
    /// </summary>
    public async Task<int> ProcessPendingBatchAsync(int batchSize, CancellationToken ct = default)
    {
        if (batchSize <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(batchSize), "Batch size must be greater than zero.");
        }

        _processingOptions.Validate();

        var pendingBatch = await resumeSubmissionRepository.ClaimProcessableBatchAsync(
            batchSize,
            DateTime.UtcNow,
            _processingOptions.MaxRetryAttempts,
            ct);
        var processedCount = 0;
        foreach (var submission in pendingBatch)
        {
            ct.ThrowIfCancellationRequested();
            await ProcessSubmissionAsync(submission, ct);
            processedCount++;
        }

        return processedCount;
    }

    public async Task<bool> ProcessClaimedSubmissionAsync(Guid submissionId, CancellationToken ct = default)
    {
        var submission = await resumeSubmissionRepository.GetByIdAsync(submissionId, ct);
        if (submission is null)
        {
            logger.LogWarning("Claimed resume submission {SubmissionId} was not found before processing.", submissionId);
            return false;
        }

        await ProcessSubmissionAsync(submission, ct);
        return true;
    }

    // Processes submission.
    private async Task ProcessSubmissionAsync(ResumeSubmissionEntity submission, CancellationToken ct)
    {
        if (IsAlreadyCompletedSubmission(submission.Status))
        {
            logger.LogInformation(
                "Skipping already-processed resume submission {SubmissionId}. CurrentStatus={Status}",
                submission.Id,
                submission.Status);
            processingMonitor.RecordSubmissionSucceeded(submission.Id);
            return;
        }

        var startedAtUtc = DateTimeOffset.UtcNow;
        var pipelineThreadId = Environment.CurrentManagedThreadId;
        var pipelineTaskId = Task.CurrentId;
        var totalTimer = global::System.Diagnostics.Stopwatch.StartNew();
        long parseElapsedMs = 0;
        long scoreElapsedMs = 0;
        var stage = "claim";
        processingMonitor.RecordSubmissionStage(submission.Id, stage);
        if (logger.IsEnabled(LogLevel.Information))
        {
            logger.LogInformation(
                "Resume submission {SubmissionId} entering pipeline at {StartedAtUtc}. JobId={JobId} BlobKey={BlobObjectKey} FileName={FileName} ThreadId={ThreadId} TaskId={TaskId}",
                submission.Id,
                startedAtUtc,
                submission.JobId,
                submission.BlobObjectKey,
                submission.FileName,
                pipelineThreadId,
                pipelineTaskId);
        }
        submission.Status = ResumeSubmissionStatus.Processing;
        submission.UpdatedAtUtc = DateTime.UtcNow;

        var claimTimer = global::System.Diagnostics.Stopwatch.StartNew();
        await resumeSubmissionRepository.SaveChangesAsync(ct);
        claimTimer.Stop();

        try
        {
            stage = "load_job";
            processingMonitor.RecordSubmissionStage(submission.Id, stage);
            var jobStartedAtUtc = DateTimeOffset.UtcNow;
            var jobTimer = global::System.Diagnostics.Stopwatch.StartNew();
            var job = await jobRepository.GetByIdAsync(submission.JobId, ct)
                ?? throw new InvalidOperationException($"Job '{submission.JobId}' not found.");
            var normalizedJob = await GetNormalizedJobDescriptionAsync(job, submission.AppliedJobPosition, ct);
            jobTimer.Stop();
            if (logger.IsEnabled(LogLevel.Information))
            {
                logger.LogInformation("Resume submission {SubmissionId} loaded job context in {ElapsedMs} ms.", submission.Id, jobTimer.ElapsedMilliseconds);
            }

            stage = "parse";
            processingMonitor.RecordSubmissionStage(submission.Id, stage);
            var parseStartedAtUtc = DateTimeOffset.UtcNow;
            var parseTimer = global::System.Diagnostics.Stopwatch.StartNew();
            ParsedResume parsed;
            string? parsedVersionForLog = null;
            if (TryDeserializeParsedResume(submission.ParsedResumeJson, out var existingParsedResume))
            {
                parsed = existingParsedResume;
                logger.LogInformation(
                    "Resume submission {SubmissionId} reusing existing parsed payload for idempotent retry.",
                    submission.Id);
            }
            else
            {
                await using var fileStream = await objectStorageService.DownloadAsync(submission.BlobObjectKey, ct);
                var parserVersion = Environment.GetEnvironmentVariable("DEFAULT_PARSER_VERSION");
                var parsedEnvelope = await parserClient.ParseAsync(fileStream, submission.FileName, submission.ContentType, parserVersion, ct);
                parsed = parsedEnvelope.ParsedResume;
                parsedVersionForLog = parsedEnvelope.ParserVersion;
                submission.ParsedResumeJson = JsonSerializer.Serialize(parsed);
            }

            parseTimer.Stop();
            parseElapsedMs = parseTimer.ElapsedMilliseconds;
            if (logger.IsEnabled(LogLevel.Information))
            {
                logger.LogInformation(
                    "Resume submission {SubmissionId} parsed successfully in {ElapsedMs} ms. StartedAtUtc={StepStartedAtUtc} EndedAtUtc={StepEndedAtUtc} ParserVersion={ParserVersion} ThreadId={ThreadId} TaskId={TaskId}",
                    submission.Id,
                    parseTimer.ElapsedMilliseconds,
                    parseStartedAtUtc,
                    DateTimeOffset.UtcNow,
                        parsedVersionForLog,
                    Environment.CurrentManagedThreadId,
                    Task.CurrentId);
            }

            stage = "score";
            processingMonitor.RecordSubmissionStage(submission.Id, stage);
            var scoreStartedAtUtc = DateTimeOffset.UtcNow;
            var scoreTimer = global::System.Diagnostics.Stopwatch.StartNew();
            var (embeddings, score) = await scoringOrchestrator.BuildAsync(submission.Id, parsed, normalizedJob, ct);
            scoreTimer.Stop();
            scoreElapsedMs = scoreTimer.ElapsedMilliseconds;
            if (logger.IsEnabled(LogLevel.Information))
            {
                logger.LogInformation(
                    "Resume submission {SubmissionId} scored successfully in {ElapsedMs} ms. StartedAtUtc={StepStartedAtUtc} EndedAtUtc={StepEndedAtUtc} FinalScore={FinalScore} ThreadId={ThreadId} TaskId={TaskId}",
                    submission.Id,
                    scoreTimer.ElapsedMilliseconds,
                    scoreStartedAtUtc,
                    DateTimeOffset.UtcNow,
                    score.FinalScore,
                    Environment.CurrentManagedThreadId,
                    Task.CurrentId);
            }

            stage = "persist";
            processingMonitor.RecordSubmissionStage(submission.Id, stage);
            var persistStartedAtUtc = DateTimeOffset.UtcNow;
            var persistTimer = global::System.Diagnostics.Stopwatch.StartNew();
            await resumeEmbeddingRepository.DeleteBySubmissionIdAsync(submission.Id, saveChanges: false, ct);
            await resumeScoreRepository.DeleteBySubmissionIdAsync(submission.Id, saveChanges: false, ct);

            if (embeddings.Count > 0)
            {
                await resumeEmbeddingRepository.AddRangeAsync(embeddings, saveChanges: false, ct);
            }

            await SaveScoreAsync(submission, normalizedJob.Description, score, ct);

            submission.RetryCount = 0;
            submission.NextRetryAtUtc = null;
            submission.Status = ApplicantRecommendationPolicy.ResolveInitialStage(
                ResumeSubmissionStatus.Completed,
                score.FinalScore);
            submission.UpdatedAtUtc = DateTime.UtcNow;
            await resumeSubmissionRepository.SaveChangesAsync(ct);
            persistTimer.Stop();
            totalTimer.Stop();
            processingMonitor.RecordSubmissionSucceeded(submission.Id);
            processingTelemetry?.RecordSubmissionSucceeded(parseElapsedMs, scoreElapsedMs);

            if (logger.IsEnabled(LogLevel.Information))
            {
                logger.LogInformation(
                    "Resume submission {SubmissionId} completed at {EndedAtUtc} in {TotalMs} ms (claim={ClaimMs} ms, job={JobMs} ms, parse={ParseMs} ms, score={ScoreMs} ms, persist={PersistMs} ms). JobStartedAtUtc={JobStartedAtUtc} ParseStartedAtUtc={ParseStartedAtUtc} ScoreStartedAtUtc={ScoreStartedAtUtc} PersistStartedAtUtc={PersistStartedAtUtc} ThreadId={ThreadId} TaskId={TaskId}.",
                    submission.Id,
                    DateTimeOffset.UtcNow,
                    totalTimer.ElapsedMilliseconds,
                    claimTimer.ElapsedMilliseconds,
                    jobTimer.ElapsedMilliseconds,
                    parseTimer.ElapsedMilliseconds,
                    scoreTimer.ElapsedMilliseconds,
                    persistTimer.ElapsedMilliseconds,
                    jobStartedAtUtc,
                    parseStartedAtUtc,
                    scoreStartedAtUtc,
                    persistStartedAtUtc,
                    Environment.CurrentManagedThreadId,
                    Task.CurrentId);
            }
        }
        catch (ResumeParserRateLimitException ex)
        {
            await ScheduleRetryAsync(submission, stage, ex, ct);
            totalTimer.Stop();
            processingTelemetry?.RecordSubmissionFailed(parseElapsedMs, scoreElapsedMs, isTimeout: false);
            logger.LogWarning(
                ex,
                "Resume submission {SubmissionId} was rate limited at stage {Stage}. RetryCount={RetryCount} NextRetryAtUtc={NextRetryAtUtc}",
                submission.Id,
                stage,
                submission.RetryCount,
                submission.NextRetryAtUtc);
        }
        catch (Exception ex)
        {
            submission.Status = ResumeSubmissionStatus.Failed;
            submission.RetryCount = _processingOptions.MaxRetryAttempts;
            submission.NextRetryAtUtc = null;
            submission.UpdatedAtUtc = DateTime.UtcNow;
            await resumeSubmissionRepository.SaveChangesAsync(ct);
            totalTimer.Stop();
            processingMonitor.RecordSubmissionFailed(submission.Id, stage, ex);
            processingTelemetry?.RecordSubmissionFailed(
                parseElapsedMs,
                scoreElapsedMs,
                ex is TimeoutException or TaskCanceledException);
            logger.LogError(
                ex,
                "Resume submission {SubmissionId} failed at stage {Stage} after {ElapsedMs} ms. JobId={JobId} BlobKey={BlobObjectKey}",
                submission.Id,
                stage,
                totalTimer.ElapsedMilliseconds,
                submission.JobId,
                submission.BlobObjectKey);
        }
    }

    private async Task ScheduleRetryAsync(
        ResumeSubmissionEntity submission,
        string stage,
        ResumeParserRateLimitException exception,
        CancellationToken ct)
    {
        var retryCount = submission.RetryCount + 1;
        var isExhausted = retryCount >= _processingOptions.MaxRetryAttempts;
        var now = DateTime.UtcNow;
        TimeSpan? retryDelay = isExhausted ? null : GetRetryDelay(retryCount, exception.RetryAfter);

        submission.RetryCount = retryCount;
        submission.Status = ResumeSubmissionStatus.Failed;
        submission.NextRetryAtUtc = retryDelay is null ? null : now.Add(retryDelay.Value);
        submission.UpdatedAtUtc = now;

        await resumeSubmissionRepository.SaveChangesAsync(ct);

        if (isExhausted)
        {
            processingMonitor.RecordSubmissionFailed(submission.Id, stage, exception);
            return;
        }

        processingMonitor.RecordSubmissionRetryScheduled(submission.Id, stage, exception);
        logger.LogWarning(
            "Scheduled resume submission retry. SubmissionId={SubmissionId} Stage={Stage} RetryCount={RetryCount} RetryAfterHeaderSeconds={RetryAfterHeaderSeconds} NextRetryAtUtc={NextRetryAtUtc}",
            submission.Id,
            stage,
            retryCount,
            exception.RetryAfter?.TotalSeconds,
            submission.NextRetryAtUtc);
    }

    private TimeSpan GetRetryDelay(int retryCount, TimeSpan? retryAfter)
    {
        var exponentialFactor = Math.Pow(2, Math.Max(0, retryCount - 1));
        var delayTicks = (long)Math.Min(
            _processingOptions.MaxRetryDelay.Ticks,
            _processingOptions.BaseRetryDelay.Ticks * exponentialFactor);
        var exponentialDelay = TimeSpan.FromTicks(delayTicks);

        // Jitter avoids synchronized retries across many submissions.
        var jitterFactor = 0.15d + (Random.Shared.NextDouble() * 0.35d);
        var jitterDelayTicks = (long)Math.Min(
            _processingOptions.MaxRetryDelay.Ticks,
            exponentialDelay.Ticks + (exponentialDelay.Ticks * jitterFactor));

        var delay = TimeSpan.FromTicks(jitterDelayTicks);

        if (retryCount >= SlowLaneRetryThreshold)
        {
            delay = delay < PostThreeFailuresDelay ? PostThreeFailuresDelay : delay;
        }

        if (retryAfter.HasValue)
        {
            delay = delay < retryAfter.Value ? retryAfter.Value : delay;
        }

        return delay < MinimumRetryDelay ? MinimumRetryDelay : delay;
    }

    private static bool IsAlreadyCompletedSubmission(ResumeSubmissionStatus status)
        => status is ResumeSubmissionStatus.Completed
            or ResumeSubmissionStatus.Recommended
            or ResumeSubmissionStatus.Shortlisted
            or ResumeSubmissionStatus.Interview
            or ResumeSubmissionStatus.Offer
            or ResumeSubmissionStatus.Hired
            or ResumeSubmissionStatus.Rejected;

    private static bool TryDeserializeParsedResume(string? payload, out ParsedResume parsedResume)
    {
        parsedResume = new ParsedResume();
        if (string.IsNullOrWhiteSpace(payload) || payload == "{}")
        {
            return false;
        }

        try
        {
            var deserialized = JsonSerializer.Deserialize<ParsedResume>(payload);
            if (deserialized is null)
            {
                return false;
            }

            parsedResume = deserialized;
            return true;
        }
        catch (JsonException)
        {
            return false;
        }
    }

    // Saves score.
    private Task SaveScoreAsync(ResumeSubmissionEntity submission, string jobDescriptionText, FinalMatchScore score, CancellationToken ct)
        => resumeScoreRepository.AddAsync(ResumeScoreEntityFactory.Create(submission, jobDescriptionText, score), saveChanges: false, ct);

    // Loads normalized job description.
    private Task<NormalizedJobDescription> GetNormalizedJobDescriptionAsync(JobEntity job, string appliedJobPosition, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        var cacheKey = BuildNormalizedJobCacheKey(job, appliedJobPosition);
        return cacheService.GetOrCreateAsync(
            cacheKey,
            TimeSpan.FromMinutes(10),
            () => Task.FromResult(NormalizedJobDescriptionFactory.Create(job, appliedJobPosition)));
    }

    // Builds normalized job cache key.
    private static string BuildNormalizedJobCacheKey(JobEntity job, string appliedJobPosition)
    {
        var payload = string.Join(
            "\n",
            job.Id,
            appliedJobPosition ?? string.Empty,
            job.Title,
            job.Description,
            job.ResponsibilitiesText,
            job.RequiredSkillsJson,
            job.PreferredSkillsJson,
            job.MinYears?.ToString() ?? string.Empty,
            job.Education ?? string.Empty,
            job.ExperienceLevel ?? string.Empty);

        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(payload)));
        return $"resume:normalized-job:{job.Id}:{hash}";
    }
}
