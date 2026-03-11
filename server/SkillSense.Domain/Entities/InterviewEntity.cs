namespace SkillSense.Domain.Entities;

public enum InterviewStatus
{
    Pending = 0,
    Accepted = 1,
    Declined = 2,
    RescheduleRequested = 3,
    Rescheduled = 4,
}

public sealed class InterviewEntity
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public Guid JobId { get; set; }
    public Guid RecruiterId { get; set; }
    public Guid JobSeekerId { get; set; }
    public DateTime ScheduledDateTimeUtc { get; set; }
    public string LocationOrMeetingLink { get; set; } = string.Empty;
    public string? Message { get; set; }
    public InterviewStatus Status { get; set; } = InterviewStatus.Pending;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public JobEntity Job { get; set; } = null!;
    public AppUser Recruiter { get; set; } = null!;
    public AppUser JobSeeker { get; set; } = null!;

    public ICollection<InterviewRescheduleRequestEntity> RescheduleRequests { get; set; } = [];
}

