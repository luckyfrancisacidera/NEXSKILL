using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Contracts.Scoring.Response;

namespace SkillSense.Application.Interfaces.Scoring
{
    public interface ISummaryScorer
    {
        Task<SimilarityResult> ScoreAsync(ResumeParseResult resume, JobDescriptionInput input, CancellationToken ct);
    }
}