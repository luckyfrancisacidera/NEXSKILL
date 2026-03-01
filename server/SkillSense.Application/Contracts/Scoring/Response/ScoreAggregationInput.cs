namespace SkillSense.Application.Contracts.Scoring.Response
{
    public sealed class ScoreAggregationInput
    {
        public float WorkExperienceScore { get; init; }
        public float SkillsScore { get; init; }
        public float EducationScore { get; init; }
        public float SummaryScore { get; init; }
        public float BonusPoints { get; init; }
    }
}
