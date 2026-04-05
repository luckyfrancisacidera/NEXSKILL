namespace SkillSense.Application.Contracts.Interviews;

/* =========================================
   RECRUITER INTERVIEW REQUESTS
========================================= */

public sealed record RecruiterScheduleInterviewRequest(
    Guid JobId,
    Guid JobSeekerId,
    DateTime ScheduledDateTimeUtc,
    InterviewTypeDto InterviewType,
    string LocationOrMeetingLink,
    string? Message);

public sealed record RecruiterRescheduleInterviewRequest(
    DateTime ScheduledDateTimeUtc,
    InterviewTypeDto InterviewType,
    string LocationOrMeetingLink,
    string? Message);

public sealed record RecruiterCancelInterviewRequest(string? Reason);
