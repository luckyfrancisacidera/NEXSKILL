using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces;

public interface IResumeScoringService
{
    Task<AtsScoreResponse> ScoreResumeAsync(ResumeScoreRequest request, CancellationToken ct = default);
}
