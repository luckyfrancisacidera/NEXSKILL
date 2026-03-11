using SkillSense.Domain.Entities;

namespace SkillSense.Application.Contracts.Interviews;

public sealed class InterviewDto
{
    public Guid Id { get; init; }
    public Guid JobId { get; init; }
    public Guid RecruiterId { get; init; }
    public Guid JobSeekerId { get; init; }
    public DateTime ScheduledDateTimeUtc { get; init; }
    public string LocationOrMeetingLink { get; init; } = string.Empty;
    public string? Message { get; init; }
    public InterviewStatus Status { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public string? RecruiterName { get; init; }
    public string? RecruiterEmail { get; init; }
    public string? CompanyName { get; init; }
}

public sealed class ScheduleInterviewRequest
{
    public Guid JobId { get; init; }
    public Guid RecruiterId { get; init; }
    public Guid JobSeekerId { get; init; }
    public DateTime ScheduledDateTimeUtc { get; init; }
    public string LocationOrMeetingLink { get; init; } = string.Empty;
    public string? Message { get; init; }
}

public sealed class RescheduleInterviewRequest
{
    public DateTime ScheduledDateTimeUtc { get; init; }
    public string? Message { get; init; }
}

public sealed class RequestInterviewRescheduleRequest
{
    public string Message { get; init; } = string.Empty;
    public string? AttachmentFileName { get; init; }
}
