using SkillSense.Application.Common.Jobs;
using SkillSense.Application.Common.Recruiter;
using SkillSense.Application.Common.Scoring;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;
using Microsoft.Extensions.Logging;
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
    ILogger<ResumeProcessingService> logger) : IResumeProcessingService
{
    /// <summary>
    /// Processes the next pending submissions up to the requested batch size.
    /// </summary>
    public async Task<int> ProcessPendingBatchAsync(int batchSize, CancellationToken ct = default)
    {
        if (batchSize <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(batchSize), "Batch size must be greater than zero.");
        }

        var pendingBatch = await resumeSubmissionRepository.GetPendingBatchAsync(batchSize, ct);
        var processedCount = 0;
        foreach (var submission in pendingBatch)
        {
            ct.ThrowIfCancellationRequested();
            await ProcessSubmissionAsync(submission, ct);
            processedCount++;
        }

        return processedCount;
    }

    // Processes submission.
    private async Task ProcessSubmissionAsync(ResumeSubmissionEntity submission, CancellationToken ct)
    {
        var totalTimer = global::System.Diagnostics.Stopwatch.StartNew();
        var stage = "claim";
        processingMonitor.RecordSubmissionStage(submission.Id, stage);
        logger.LogInformation(
            "Resume submission {SubmissionId} entering pipeline. JobId={JobId} BlobKey={BlobObjectKey} FileName={FileName}",
            submission.Id,
            submission.JobId,
            submission.BlobObjectKey,
            submission.FileName);
        submission.Status = ResumeSubmissionStatus.Processing;
        submission.UpdatedAtUtc = DateTime.UtcNow;

        var claimTimer = global::System.Diagnostics.Stopwatch.StartNew();
        await resumeSubmissionRepository.SaveChangesAsync(ct);
        claimTimer.Stop();

        try
        {
            stage = "load_job";
            processingMonitor.RecordSubmissionStage(submission.Id, stage);
            var jobTimer = global::System.Diagnostics.Stopwatch.StartNew();
            var job = await jobRepository.GetByIdAsync(submission.JobId, ct)
                ?? throw new InvalidOperationException($"Job '{submission.JobId}' not found.");
            var normalizedJob = await GetNormalizedJobDescriptionAsync(job, submission.AppliedJobPosition, ct);
            jobTimer.Stop();
            logger.LogInformation("Resume submission {SubmissionId} loaded job context in {ElapsedMs} ms.", submission.Id, jobTimer.ElapsedMilliseconds);

            stage = "parse";
            processingMonitor.RecordSubmissionStage(submission.Id, stage);
            var parseTimer = global::System.Diagnostics.Stopwatch.StartNew();
            await using var fileStream = await objectStorageService.DownloadAsync(submission.BlobObjectKey, ct);
            var parserVersion = Environment.GetEnvironmentVariable("DEFAULT_PARSER_VERSION");
            var parsedEnvelope = await parserClient.ParseAsync(fileStream, submission.FileName, submission.ContentType, parserVersion, ct);
            var parsed = parsedEnvelope.ParsedResume;
            submission.ParsedResumeJson = JsonSerializer.Serialize(parsed);
            parseTimer.Stop();
            logger.LogInformation(
                "Resume submission {SubmissionId} parsed successfully in {ElapsedMs} ms. ParserVersion={ParserVersion}",
                submission.Id,
                parseTimer.ElapsedMilliseconds,
                parsedEnvelope.ParserVersion);

            stage = "score";
            processingMonitor.RecordSubmissionStage(submission.Id, stage);
            var scoreTimer = global::System.Diagnostics.Stopwatch.StartNew();
            var result = await scoringOrchestrator.BuildAsync(submission.Id, parsed, normalizedJob, ct);
            scoreTimer.Stop();
            logger.LogInformation(
                "Resume submission {SubmissionId} scored successfully in {ElapsedMs} ms. FinalScore={FinalScore}",
                submission.Id,
                scoreTimer.ElapsedMilliseconds,
                result.Score.FinalScore);

            stage = "persist";
            processingMonitor.RecordSubmissionStage(submission.Id, stage);
            var persistTimer = global::System.Diagnostics.Stopwatch.StartNew();
            if (result.Embeddings.Count > 0)
            {
                await resumeEmbeddingRepository.AddRangeAsync(result.Embeddings, saveChanges: false, ct);
            }

            await SaveScoreAsync(submission, normalizedJob.Description, result.Score, ct);

            submission.Status = ApplicantRecommendationPolicy.ResolveInitialStage(
                ResumeSubmissionStatus.Completed,
                result.Score.FinalScore);
            submission.UpdatedAtUtc = DateTime.UtcNow;
            await resumeSubmissionRepository.SaveChangesAsync(ct);
            persistTimer.Stop();
            totalTimer.Stop();
            processingMonitor.RecordSubmissionSucceeded(submission.Id);

            logger.LogInformation(
                "Resume submission {SubmissionId} processed in {TotalMs} ms (claim={ClaimMs} ms, job={JobMs} ms, parse={ParseMs} ms, score={ScoreMs} ms, persist={PersistMs} ms).",
                submission.Id,
                totalTimer.ElapsedMilliseconds,
                claimTimer.ElapsedMilliseconds,
                jobTimer.ElapsedMilliseconds,
                parseTimer.ElapsedMilliseconds,
                scoreTimer.ElapsedMilliseconds,
                persistTimer.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            submission.Status = ResumeSubmissionStatus.Failed;
            submission.UpdatedAtUtc = DateTime.UtcNow;
            await resumeSubmissionRepository.SaveChangesAsync(ct);
            totalTimer.Stop();
            processingMonitor.RecordSubmissionFailed(submission.Id, stage, ex);
            logger.LogError(
                ex,
                "Resume submission {SubmissionId} failed at stage {Stage} after {ElapsedMs} ms. JobId={JobId} BlobKey={BlobObjectKey}",
                submission.Id,
                stage,
                totalTimer.ElapsedMilliseconds,
                submission.JobId,
                submission.BlobObjectKey);
            throw;
        }
    }

    // Saves score.
    private async Task SaveScoreAsync(ResumeSubmissionEntity submission, string jobDescriptionText, FinalMatchScore score, CancellationToken ct)
        => await resumeScoreRepository.AddAsync(ResumeScoreEntityFactory.Create(submission, jobDescriptionText, score), saveChanges: false, ct);

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
