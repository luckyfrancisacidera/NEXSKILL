using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Contracts.Scoring.Response;
using SkillSense.Application.Interfaces.Scoring;

namespace SkillSense.Application.Services.Scoring;

public sealed class EducationEvaluator : IEducationEvaluator
{
    private static readonly Dictionary<string, int> _rank = new(StringComparer.OrdinalIgnoreCase)
    {
        ["high school"] = 1,
        ["associate"] = 2,
        ["bachelor"] = 3,
        ["master"] = 4,
        ["phd"] = 5,
        ["doctorate"] = 5
    };

    public EducationResult Evaluate(JobDescriptionInput input, ResumeParseResult resume)
    {
        var required = (input.MinEducation ?? input.Education ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(required))
        {
            return new EducationResult(0.7f, true);
        }

        var resumeText = string.Join(' ', resume.Education.Select(x => string.Join(' ', new[] { x.Degree, x.Institution, x.EmbeddingText })));
        if (string.IsNullOrWhiteSpace(resumeText))
        {
            return new EducationResult(0.2f, false);
        }

        var requiredRank = ResolveRank(required);
        var resumeRank = ResolveRank(resumeText);

        if (resumeRank >= requiredRank)
        {
            return new EducationResult(1f, true);
        }

        if (resumeText.Contains(required, StringComparison.OrdinalIgnoreCase))
        {
            return new EducationResult(0.8f, true);
        }

        return new EducationResult(0.35f, false);
    }

    private static int ResolveRank(string text)
    {
        var found = _rank.Where(x => text.Contains(x.Key, StringComparison.OrdinalIgnoreCase)).Select(x => x.Value);
        return found.Any() ? found.Max() : 0;
    }
}
