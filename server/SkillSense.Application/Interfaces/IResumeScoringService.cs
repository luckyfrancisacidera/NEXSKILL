using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces;

/// <summary>
/// Re-scores parsed resumes against normalized job descriptions.
/// </summary>
public interface IResumeScoringService
{
    /// <summary>
    /// Computes and persists a fresh match score for an existing resume submission.
    /// </summary>
    Task<FinalMatchScore> ScoreResumeAsync(ResumeScoreRequest request, CancellationToken ct = default);
}
