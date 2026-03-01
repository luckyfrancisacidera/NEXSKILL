using SkillSense.Application.Contracts.Scoring.Response;

namespace SkillSense.Application.Interfaces.Scoring
{
    public interface ISimilarityEngine
    {
        Task<SimilarityResult> CompareAsync(string sourceText, string targetText, CancellationToken ct);
    }
}
