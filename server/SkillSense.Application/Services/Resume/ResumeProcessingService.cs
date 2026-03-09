using SkillSense.Application.Common.Jobs;
using SkillSense.Application.Common.Scoring;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;

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
    IResumeScoringOrchestrator scoringOrchestrator) : IResumeProcessingService
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

        var processedCount = 0;
        for (var i = 0; i < batchSize; i++)
        {
            ct.ThrowIfCancellationRequested();
            var submission = await resumeSubmissionRepository.GetNextPendingAsync(ct);
            if (submission is null) break;

            await ProcessSubmissionAsync(submission, ct);
            processedCount++;
        }

        return processedCount;
    }

    private async Task ProcessSubmissionAsync(ResumeSubmissionEntity submission, CancellationToken ct)
    {
        submission.Status = ResumeSubmissionStatus.Processing;
        submission.UpdatedAtUtc = DateTime.UtcNow;
        await resumeSubmissionRepository.SaveChangesAsync(ct);

        try
        {
            var job = await jobRepository.GetByIdAsync(submission.JobId, ct)
                ?? throw new InvalidOperationException($"Job '{submission.JobId}' not found.");

            await using var fileStream = await objectStorageService.DownloadAsync(submission.BlobObjectKey, ct);
            var parserVersion = Environment.GetEnvironmentVariable("DEFAULT_PARSER_VERSION");
            var parsedEnvelope = await parserClient.ParseAsync(fileStream, submission.FileName, submission.ContentType, parserVersion, ct);
            var parsed = parsedEnvelope.ParsedResume;
            submission.ParsedResumeJson = global::System.Text.Json.JsonSerializer.Serialize(parsed);

            var request = NormalizedJobDescriptionFactory.Create(job, submission.AppliedJobPosition);
            var result = await scoringOrchestrator.BuildAsync(submission.Id, parsed, request, ct);

            await resumeEmbeddingRepository.AddRangeAsync(result.Embeddings, ct);
            await SaveScoreAsync(submission, request.Description, result.Score, ct);

            submission.Status = ResumeSubmissionStatus.Completed;
            submission.UpdatedAtUtc = DateTime.UtcNow;
            await resumeSubmissionRepository.SaveChangesAsync(ct);
        }
        catch
        {
            submission.Status = ResumeSubmissionStatus.Failed;
            submission.UpdatedAtUtc = DateTime.UtcNow;
            await resumeSubmissionRepository.SaveChangesAsync(ct);
            throw;
        }
    }

    private async Task SaveScoreAsync(ResumeSubmissionEntity submission, string jobDescriptionText, FinalMatchScore score, CancellationToken ct)
        => await resumeScoreRepository.AddAsync(ResumeScoreEntityFactory.Create(submission, jobDescriptionText, score), ct);
}

