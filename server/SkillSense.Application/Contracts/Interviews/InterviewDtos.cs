using System.Text.Json.Serialization;
using SkillSense.Domain.Entities;
using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Contracts.Interviews;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum InterviewTypeDto
{
    Virtual = 0,
    Onsite = 1,
}

public sealed class InterviewDto
{
    public Guid Id { get; init; }
    public Guid JobId { get; init; }
    public Guid RecruiterId { get; init; }
    public Guid JobSeekerId { get; init; }
    public DateTime ScheduledDateTimeUtc { get; init; }
    public InterviewTypeDto InterviewType { get; init; }
    public string LocationOrMeetingLink { get; init; } = string.Empty;
    public string? Message { get; init; }
    public InterviewStatus Status { get; init; }
    public string? CancelReason { get; init; }
    public bool IsArchived { get; init; }
    public DateTime? ArchivedAtUtc { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public string? RecruiterName { get; init; }
    public string? RecruiterEmail { get; init; }
    public string? CompanyName { get; init; }
    public string? JobTitle { get; init; }
    public string? JobSeekerName { get; init; }
    public string? WarningMessage { get; set; }
}

public sealed class ArchivedInterviewsQuery
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Search { get; init; }
    public string? Status { get; init; }
}

public sealed class CandidateInterviewSummaryDto
{
    public Guid Id { get; init; }
    public DateTime ScheduledDateTimeUtc { get; init; }
    public InterviewStatus Status { get; init; }
}

public sealed class ScheduleInterviewRequest
{
    public Guid JobId { get; init; }
    public Guid RecruiterId { get; init; }
    public Guid JobSeekerId { get; init; }
    public DateTime ScheduledDateTimeUtc { get; init; }
    public InterviewTypeDto InterviewType { get; init; }
    public string LocationOrMeetingLink { get; init; } = string.Empty;
    public string? Message { get; init; }
}

public sealed class RescheduleInterviewRequest
{
    public DateTime ScheduledDateTimeUtc { get; init; }
    public InterviewTypeDto InterviewType { get; init; }
    public string LocationOrMeetingLink { get; init; } = string.Empty;
    public string? Message { get; init; }
}

public sealed class RequestInterviewRescheduleRequest
{
    public string Message { get; init; } = string.Empty;
}

public sealed class CancelInterviewRequest
{
    public string? Reason { get; init; }
}

public sealed class ShortlistedCandidateOptionDto
{
    public Guid JobSeekerUserId { get; init; }
    public Guid ResumeSubmissionId { get; init; }
    public string CandidateName { get; init; } = string.Empty;
    public string CandidateEmail { get; init; } = string.Empty;
}
