using Microsoft.Extensions.Options;
using SkillSense.Application.Contracts.Scoring.Response;
using SkillSense.Application.Interfaces.Scoring;

namespace SkillSense.Application.Services.Scoring;

public sealed class ScoreAggregator(IOptions<AtsScoringOptions> options) : IScoreAggregator
{
    public ScoreAggregationResult Aggregate(ScoreAggregationInput input)
    {
        var basePoints =
            (Math.Clamp(input.WorkExperienceScore, 0f, 1f) * options.Value.WorkExperienceWeight * 100f) +
            (Math.Clamp(input.SkillsScore, 0f, 1f) * options.Value.SkillsWeight * 100f) +
            (Math.Clamp(input.EducationScore, 0f, 1f) * options.Value.EducationWeight * 100f) +
            (Math.Clamp(input.SummaryScore, 0f, 1f) * options.Value.SummaryWeight * 100f);

        var bonus = Math.Clamp(input.BonusPoints, 0f, options.Value.BonusMaxPoints);
        var final = Math.Clamp(basePoints + bonus, 0f, 100f);

        return new ScoreAggregationResult(basePoints, bonus, final);
    }
}
