namespace SkillSense.Domain.Entities;

public sealed class ResumeScoreEntity
{
    public Guid Id { get; set; }
    public Guid ResumeSubmissionId { get; set; }
    public Guid JobId { get; set; }
    public string JobDescriptionText { get; set; } = string.Empty;
    public float SkillsScore { get; set; }
    public float ExperienceScore { get; set; }
    public float EducationScore { get; set; }
    public float SummaryScore { get; set; }
    public float FinalWeightedScore { get; set; }
    public string ScoreBreakdownJson { get; set; } = "{}";
    public DateTime CreatedAtUtc { get; set; }
}
