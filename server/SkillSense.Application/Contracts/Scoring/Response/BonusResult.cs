namespace SkillSense.Application.Contracts.Scoring.Response
{
    public readonly record struct BonusResult(float BonusPoints, IReadOnlyList<string> Reasons);
}
