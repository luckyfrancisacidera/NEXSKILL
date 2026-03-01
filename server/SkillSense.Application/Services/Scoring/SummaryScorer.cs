using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Contracts.Scoring.Response;
using SkillSense.Application.Interfaces.Scoring;

namespace SkillSense.Application.Services.Scoring;

public sealed class SummaryScorer(ISimilarityEngine similarityEngine) : ISummaryScorer
{
    public Task<SimilarityResult> ScoreAsync(ResumeParseResult resume, JobDescriptionInput input, CancellationToken ct)
    {
        var summarySource = string.Join(' ', resume.Summary.Where(x => !string.IsNullOrWhiteSpace(x)));
        var summaryTarget = string.Join(' ', new[] { input.Title, input.Text }.Where(x => !string.IsNullOrWhiteSpace(x)));
        return similarityEngine.CompareAsync(summarySource, summaryTarget, ct);
    }
}
