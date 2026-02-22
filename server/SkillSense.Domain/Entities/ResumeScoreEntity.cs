namespace SkillSense.Domain.Entities;

public sealed class ResumeScoreEntity
{
    public Guid Id { get; set; }
    public Guid ResumeSubmissionId { get; set; }
    public Guid JobId { get; set; }
    public float OverallSimilarity { get; set; }
    public float? JobTargetSimilarity { get; set; }
    public float? AppliedJobPositionSimilarity { get; set; }
    public string SectionSimilaritiesJson { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}
