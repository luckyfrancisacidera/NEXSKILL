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
            var parsed = parsedEnvelope.ParsedResume; submission.ParsedResumeJson = JsonSerializer.Serialize(parsed);

            var request = BuildNormalizedJobDescription(job, submission.AppliedJobPosition);
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

    private static NormalizedJobDescription BuildNormalizedJobDescription(JobEntity job, string appliedJobPosition)
    {
        var requiredSkills = JsonSerializer.Deserialize<List<string>>(job.RequiredSkillsJson) ?? [];
        var preferredSkills = JsonSerializer.Deserialize<List<string>>(job.PreferredSkillsJson) ?? [];

        var responsibilities = (job.ResponsibilitiesText ?? string.Empty)
            .Split(['\n', ';', '.'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToList();

        return new NormalizedJobDescription
        {
            JobId = job.Id.ToString(),
            Title = string.IsNullOrWhiteSpace(appliedJobPosition) ? job.Title : appliedJobPosition,
            Description = job.Description,
            Responsibilities = responsibilities,
            RequiredSkills = requiredSkills,
            PreferredSkills = preferredSkills,
            MinimumYearsExperience = job.MinYears ?? 0,
            MinimumEducationLevel = job.Education ?? string.Empty,
            EducationRequirements = string.IsNullOrWhiteSpace(job.Education) ? [] : [job.Education],
            Metadata = new Dictionary<string, string> { ["experience_level"] = job.ExperienceLevel ?? string.Empty }
        };
    }

    private async Task SaveScoreAsync(ResumeSubmissionEntity submission, string jobDescriptionText, FinalMatchScore score, CancellationToken ct)
    {
        var entity = new ResumeScoreEntity
        {
            Id = Guid.NewGuid(),
            ResumeSubmissionId = submission.Id,
            JobId = submission.JobId,
            JobDescriptionText = jobDescriptionText,
            SkillsScore = score.SectionScores.GetValueOrDefault("skills", 0f),
            ExperienceScore = score.SectionScores.GetValueOrDefault("work_experience", 0f),
            EducationScore = score.SectionScores.GetValueOrDefault("education", 0f),
            SummaryScore = score.SectionScores.GetValueOrDefault("description", 0f),
            FinalWeightedScore = score.FinalScore,
            ScoreBreakdownJson = JsonSerializer.Serialize(score),
            CreatedAtUtc = DateTime.UtcNow
        };

        await resumeScoreRepository.AddAsync(entity, ct);
    }
}
