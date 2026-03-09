using System.Text.Json;
using SkillSense.Application.Contracts.Response;
using SkillSense.Domain.Entities;

namespace SkillSense.Application.Common.Scoring;

internal static class ResumeScoreEntityFactory
{
    public static ResumeScoreEntity Create(ResumeSubmissionEntity submission, string jobDescriptionText, FinalMatchScore score)
        => new()
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
}
