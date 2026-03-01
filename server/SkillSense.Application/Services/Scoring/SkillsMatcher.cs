using Microsoft.Extensions.Options;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Contracts.Scoring.Response;
using SkillSense.Application.Interfaces.Scoring;

namespace SkillSense.Application.Services.Scoring;

public sealed class SkillsMatcher(IOptions<AtsScoringOptions> options) : ISkillsMatcher
{
    public SkillsMatchResult Evaluate(JobDescriptionInput input, ResumeParseResult resume)
    {
        var required = input.RequiredSkills
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(Normalize)
            .Distinct()
            .ToList();

        var available = new HashSet<string>(resume.Skills
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(Normalize));

        var matched = required.Where(available.Contains).ToList();
        var coverage = required.Count == 0 ? 0f : (float)matched.Count / required.Count;

        var preferred = input.PreferredSkills
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(Normalize)
            .Distinct()
            .ToList();

        var preferredMatch = preferred.Count == 0
            ? 0f
            : (float)preferred.Count(available.Contains) / preferred.Count;

        var baseScore = required.Count == 0
            ? Math.Clamp(preferredMatch, 0f, 1f)
            : Math.Clamp((coverage * 0.85f) + (preferredMatch * 0.15f), 0f, 1f);

        var boost = coverage >= 1f ? options.Value.RequiredSkillBoostMax : 0f;
        var score = Math.Clamp(baseScore + boost, 0f, 1f);

        return new SkillsMatchResult(score, coverage, matched, boost);
    }

    private static string Normalize(string text) => text.Trim().ToLowerInvariant();
}
