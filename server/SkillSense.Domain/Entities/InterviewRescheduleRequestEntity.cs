namespace SkillSense.Domain.Entities;

public sealed class InterviewRescheduleRequestEntity
{
    public Guid Id { get; set; }
    public Guid InterviewId { get; set; }
    public Guid JobSeekerId { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public InterviewEntity Interview { get; set; } = null!;
    public AppUser JobSeeker { get; set; } = null!;
}

