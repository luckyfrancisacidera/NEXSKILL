using System.Text.Json;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services;

public sealed class ResumeQueueService(
    IObjectStorageService objectStorageService,
    IResumeSubmissionRepository resumeSubmissionRepository,
    IJobRepository jobRepository,
    IResumeParserClient parserClient,
    IResumeScoreRepository resumeScoreRepository,
    ITextEmbeddingService embeddingService) : IResumeQueueService
{
    private readonly EmbeddingScoringService _scoringService = new(embeddingService);

    public async Task<ResumeUploadResponse> EnqueueUploadAsync(Stream fileStream, string fileName, string contentType, Guid jobId, string appliedJobPosition, CancellationToken ct = default)
    {
        var blobKey = await objectStorageService.UploadAsync(fileStream, fileName, contentType, ct);

        var submission = new ResumeSubmissionEntity
        {
            Id = Guid.NewGuid(),
            FileName = fileName,
            ContentType = contentType,
            BlobObjectKey = blobKey,
            JobId = jobId,
            AppliedJobPosition = appliedJobPosition,
            Status = ResumeSubmissionStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        await resumeSubmissionRepository.AddAsync(submission, ct);

        return new ResumeUploadResponse { SubmissionId = submission.Id, Status = submission.Status.ToString() };
    }

    public async Task ProcessPendingAsync(CancellationToken ct = default)
    {
        var submission = await resumeSubmissionRepository.GetNextPendingAsync(ct);
        if (submission is null)
        {
            return;
        }

        submission.Status = ResumeSubmissionStatus.Processing;
        submission.UpdatedAtUtc = DateTime.UtcNow;
        await resumeSubmissionRepository.SaveChangesAsync(ct);

        try
        {
            var job = await jobRepository.GetByIdAsync(submission.JobId, ct)
                ?? throw new InvalidOperationException($"Job '{submission.JobId}' not found.");

            await using var fileStream = await objectStorageService.DownloadAsync(submission.BlobObjectKey, ct);
            var parsed = await parserClient.ParseAsync(fileStream, submission.FileName, submission.ContentType, ct);
            var scored = await _scoringService.BuildScoreAsync(job.Description, parsed, submission.AppliedJobPosition, ct);

            submission.ParsedResumeJson = JsonSerializer.Serialize(parsed);
            submission.ResumeEmbeddingJson = JsonSerializer.Serialize(scored.ResumeEmbedding);
            submission.Status = ResumeSubmissionStatus.Completed;
            submission.UpdatedAtUtc = DateTime.UtcNow;

            var score = new ResumeScoreEntity
            {
                Id = Guid.NewGuid(),
                ResumeSubmissionId = submission.Id,
                JobId = job.Id,
                OverallSimilarity = scored.OverallSimilarity,
                JobTargetSimilarity = scored.JobTargetSimilarity,
                AppliedJobPositionSimilarity = scored.AppliedJobPositionSimilarity,
                SectionSimilaritiesJson = JsonSerializer.Serialize(scored.SectionSimilarities),
                CreatedAtUtc = DateTime.UtcNow
            };

            await resumeScoreRepository.AddAsync(score, ct);
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
}
