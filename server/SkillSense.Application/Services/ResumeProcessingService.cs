using System.Text.Json;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services;

public sealed class ResumeProcessingService(
    IObjectStorageService objectStorageService,
    IResumeSubmissionRepository resumeSubmissionRepository,
    IJobRepository jobRepository,
    IResumeParserClient parserClient,
    IResumeScoreRepository resumeScoreRepository,
    IResumeEmbeddingRepository resumeEmbeddingRepository,
    IResumeScoringOrchestrator scoringOrchestrator) : IResumeProcessingService
{
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
            submission.ParsedResumeJson = JsonSerializer.Serialize(parsed);

            var request = BuildJobDescriptionInput(job, submission.AppliedJobPosition);
            var result = await scoringOrchestrator.BuildAsync(submission.Id, parsed, request, ct);

            await resumeEmbeddingRepository.AddRangeAsync(result.Embeddings, ct);
            await SaveScoreAsync(submission, request.Text, result.Score, ct);

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

    private static JobDescriptionInput BuildJobDescriptionInput(JobEntity job, string appliedJobPosition)
    {
        var requiredSkills = JsonSerializer.Deserialize<List<string>>(job.RequiredSkillsJson) ?? new();
        var preferredSkills = JsonSerializer.Deserialize<List<string>>(job.PreferredSkillsJson) ?? new();

        return new JobDescriptionInput
        {
            Text = job.Description,
            Title = string.IsNullOrWhiteSpace(appliedJobPosition) ? job.Title : appliedJobPosition,
            Responsibilities = job.ResponsibilitiesText,
            RequiredSkills = requiredSkills,
            PreferredSkills = preferredSkills,
            ExperienceLevel = job.ExperienceLevel,
            MinYears = job.MinYears,
            Education = job.Education,
            MinEducation = job.Education
        };
    }

    private async Task SaveScoreAsync(ResumeSubmissionEntity submission, string jobDescriptionText, AtsScoreResponse score, CancellationToken ct)
    {
        var entity = new ResumeScoreEntity
        {
            Id = Guid.NewGuid(),
            ResumeSubmissionId = submission.Id,
            JobId = submission.JobId,
            JobDescriptionText = jobDescriptionText,
            SkillsScore = score.SkillsScore,
            ExperienceScore = score.ExperienceScore,
            EducationScore = score.EducationScore,
            SummaryScore = score.SummaryScore,
            FinalWeightedScore = score.FinalScore,
            ScoreBreakdownJson = JsonSerializer.Serialize(score.Breakdown),
            CreatedAtUtc = DateTime.UtcNow
        };

        await resumeScoreRepository.AddAsync(entity, ct);
    }
}
