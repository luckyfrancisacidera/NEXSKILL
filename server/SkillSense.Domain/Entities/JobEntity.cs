namespace SkillSense.Domain.Entities;

public sealed class JobEntity
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DescriptionEmbeddingJson { get; set; } = string.Empty;

    public string ResponsibilitiesText { get; set; } = string.Empty;
    public string RequiredSkillsJson { get; set; } = "[]";
    public string PreferredSkillsJson { get; set; } = "[]";
    public string? ExperienceLevel { get; set; }
    public int? MinYears { get; set; }
    public string? Education { get; set; }

    public string JobDescriptionStructuredJson { get; set; } = "{}";

    public JobStatus Status { get; set; } = JobStatus.Open;
    public DateTime CreatedAtUtc { get; set; }
}

public enum JobStatus
{
    Pending = 0,
    Open = 1,
    Closed = 2,
}
