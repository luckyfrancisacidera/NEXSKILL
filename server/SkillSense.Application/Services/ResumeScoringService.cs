using System.Text.Json;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services;

public sealed class ResumeScoringService(
    IResumeSubmissionRepository resumeSubmissionRepository,
    IResumeScoreRepository resumeScoreRepository,
    IResumeScoringOrchestrator scoringOrchestrator) : IResumeScoringService
{
    public async Task<FinalMatchScore> ScoreResumeAsync(ResumeScoreRequest request, CancellationToken ct = default)
    {
        var submission = await resumeSubmissionRepository.GetByIdAsync(request.SubmissionId, ct)
            ?? throw new InvalidOperationException("Submission not found.");

        var parsed = JsonSerializer.Deserialize<ParsedResume>(submission.ParsedResumeJson)
            ?? throw new InvalidOperationException("Parsed resume payload is not available.");

        var result = await scoringOrchestrator.BuildAsync(submission.Id, parsed, request.JobDescription, ct);
        await SaveScoreAsync(submission, request.JobDescription.Description, result.Score, ct);
        return result.Score;
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
