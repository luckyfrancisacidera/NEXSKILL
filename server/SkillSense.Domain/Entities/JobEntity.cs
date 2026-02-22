namespace SkillSense.Domain.Entities;

public sealed class JobEntity
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DescriptionEmbeddingJson { get; set; } = string.Empty;
    public JobStatus Status { get; set; } = JobStatus.Pending;
    public DateTime CreatedAtUtc { get; set; }
}

public enum JobStatus
{
    Pending = 0,
    Open = 1,
    Closed = 2,
}
