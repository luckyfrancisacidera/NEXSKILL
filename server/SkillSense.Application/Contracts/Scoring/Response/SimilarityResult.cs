namespace SkillSense.Application.Contracts.Scoring.Response
{
    public readonly record struct SimilarityResult(float Semantic, float Lexical, float Combined, float AlphaUsed);
}
