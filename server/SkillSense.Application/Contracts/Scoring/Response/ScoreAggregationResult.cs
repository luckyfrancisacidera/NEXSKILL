namespace SkillSense.Application.Contracts.Scoring.Response
{
    public readonly record struct ScoreAggregationResult(float BasePoints, float BonusPoints, float FinalScore);
}
