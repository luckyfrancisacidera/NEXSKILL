namespace SkillSense.Domain.Entities;

public sealed class CandidateExplanationEntity
{
    public Guid Id { get; set; }
    public Guid ResumeSubmissionId { get; set; }
    public Guid JobId { get; set; }
    public Guid? ApplicantUserId { get; set; }
    public string Provider { get; set; } = "groq";
    public string Model { get; set; } = string.Empty;
    public string ExplanationText { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string StrengthsJson { get; set; } = "[]";
    public string GapsJson { get; set; } = "[]";
    public string? RawProviderResponse { get; set; }
    public string StructuredDataJson { get; set; } = "{}";
    public ExplanationStatus Status { get; set; } = ExplanationStatus.Pending;
    public DateTime? GeneratedAtUtc { get; set; }
    public string? FailureReason { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}

public enum ExplanationStatus
{
    Pending = 0,
    Succeeded = 1,
    Failed = 2,
}
