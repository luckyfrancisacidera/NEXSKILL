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
    public async Task<AtsScoreResponse> ScoreResumeAsync(ResumeScoreRequest request, CancellationToken ct = default)
    {
        var submission = await resumeSubmissionRepository.GetByIdAsync(request.SubmissionId, ct)
            ?? throw new InvalidOperationException("Submission not found.");

        var parsed = JsonSerializer.Deserialize<ResumeParseResult>(submission.ParsedResumeJson)
            ?? throw new InvalidOperationException("Parsed resume payload is not available.");

        var result = await scoringOrchestrator.BuildAsync(submission.Id, parsed, request.JobDescription, ct);
        await SaveScoreAsync(submission, request.JobDescription.Text, result.Score, ct);
        return result.Score;
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
