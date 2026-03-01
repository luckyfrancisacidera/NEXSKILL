namespace SkillSense.Application.Contracts.Scoring.Response
{
    public readonly record struct SkillsMatchResult(float Score, float RequiredCoverage, IReadOnlyList<string> MatchedRequiredSkills, float BoostApplied);
}
