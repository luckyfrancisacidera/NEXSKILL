namespace SkillSense.Application.Services.Scoring;

public sealed class AtsScoringOptions
{
    public const string SectionName = "AtsScoring";

    public float SemanticAlpha { get; set; } = 0.75f;
    public int AdaptiveLexicalMinTokenCount { get; set; } = 8;
    public float AdaptiveSparseSemanticAlpha { get; set; } = 0.9f;

    public float WorkExperienceWeight { get; set; } = 0.40f;
    public float SkillsWeight { get; set; } = 0.30f;
    public float EducationWeight { get; set; } = 0.10f;
    public float SummaryWeight { get; set; } = 0.05f;

    public float ExperienceYearsSplit { get; set; } = 0.60f;
    public float ExperienceContentSplit { get; set; } = 0.40f;

    public float RequiredSkillBoostMax { get; set; } = 0.15f;

    public float BonusProjectsPoints { get; set; } = 3f;
    public float BonusCertificationsPoints { get; set; } = 2f;
    public float BonusAchievementsPoints { get; set; } = 2f;
    public float BonusMaxPoints { get; set; } = 10f;

    public float NeutralYearsScoreWhenMissingRequirement { get; set; } = 1f;
}
