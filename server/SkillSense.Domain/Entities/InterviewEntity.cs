using System.Text.Json.Serialization;

namespace SkillSense.Domain.Entities;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum InterviewStatus
{
    Pending = 0,
    Accepted = 1,
    Declined = 2,
    RescheduleRequested = 3,
    Rescheduled = 4,
    Cancelled = 5,
    Completed = 6,
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum InterviewType
{
    Virtual = 0,
    Onsite = 1,
}

public sealed class InterviewEntity
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public Guid JobId { get; set; }
    public Guid RecruiterId { get; set; }
    public Guid JobSeekerId { get; set; }
    public DateTime ScheduledDateTimeUtc { get; set; }
    // InterviewType is stored explicitly so scheduling, validation, and calendar invites
    // all use the same source of truth instead of inferring from free-form location text.
    public InterviewType InterviewType { get; set; } = InterviewType.Virtual;
    public string LocationOrMeetingLink { get; set; } = string.Empty;
    public string? Message { get; set; }
    public InterviewStatus Status { get; set; } = InterviewStatus.Pending;
    public string? CancelReason { get; set; }
    public DateTime? CancelledAtUtc { get; set; }
    public bool IsArchived { get; set; }
    public DateTime? ArchivedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public JobEntity Job { get; set; } = null!;
    public AppUser Recruiter { get; set; } = null!;
    public AppUser JobSeeker { get; set; } = null!;

    public ICollection<InterviewRescheduleRequestEntity> RescheduleRequests { get; set; } = [];
}
