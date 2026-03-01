using SkillSense.Application.Contracts.Scoring.Response;

namespace SkillSense.Application.Interfaces.Scoring
{
    public interface IScoreAggregator
    {
        ScoreAggregationResult Aggregate(ScoreAggregationInput input);
    }

}

