namespace SkillSense.Domain.Entities;

public sealed class ResumeSubmissionEntity
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public string BlobObjectKey { get; set; } = string.Empty;
    public Guid JobId { get; set; }
    public string AppliedJobPosition { get; set; } = string.Empty;
    public ResumeSubmissionStatus Status { get; set; }
    public string ParsedResumeJson { get; set; } = "{}";
    public string ResumeEmbeddingJson { get; set; } = "[]";
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}

public enum ResumeSubmissionStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3,
}
