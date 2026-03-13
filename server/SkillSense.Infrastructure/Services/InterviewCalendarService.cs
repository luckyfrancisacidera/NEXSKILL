using System.Text;
using SkillSense.Application.Interfaces;
using SkillSense.Domain.Entities;

namespace SkillSense.Infrastructure.Services;

public sealed class InterviewCalendarService : IInterviewCalendarService
{
    private static readonly TimeSpan DefaultDuration = TimeSpan.FromHours(1);

    public string BuildCalendarContent(InterviewEntity interview, TimeSpan? duration = null)
    {
        ArgumentNullException.ThrowIfNull(interview);
        ArgumentNullException.ThrowIfNull(interview.Job);
        ArgumentNullException.ThrowIfNull(interview.Recruiter);
        ArgumentNullException.ThrowIfNull(interview.JobSeeker);

        var effectiveDuration = duration ?? DefaultDuration;
        var startUtc = EnsureUtc(interview.ScheduledDateTimeUtc);
        var endUtc = startUtc.Add(effectiveDuration);
        var candidateName = ResolveDisplayName(interview.JobSeeker, "Candidate");
        var recruiterName = ResolveDisplayName(interview.Recruiter, "Recruiter");
        var interviewType = interview.InterviewType.ToString();
        var title = $"Interview with {candidateName}";
        var location = string.IsNullOrWhiteSpace(interview.LocationOrMeetingLink)
            ? string.Empty
            : Escape(interview.LocationOrMeetingLink.Trim());
        var description = BuildDescription(interview);
        var uid = $"interview-{interview.Id}@skillsense";
        var timestamp = FormatUtc(DateTime.UtcNow);

        var builder = new StringBuilder();
        builder.AppendLine("BEGIN:VCALENDAR");
        builder.AppendLine("VERSION:2.0");
        builder.AppendLine("PRODID:-//SkillSense//Interview Calendar//EN");
        builder.AppendLine("CALSCALE:GREGORIAN");
        builder.AppendLine("METHOD:PUBLISH");
        builder.AppendLine("BEGIN:VEVENT");
        builder.AppendLine($"UID:{uid}");
        builder.AppendLine($"DTSTAMP:{timestamp}");
        builder.AppendLine($"DTSTART:{FormatUtc(startUtc)}");
        builder.AppendLine($"DTEND:{FormatUtc(endUtc)}");
        builder.AppendLine($"SUMMARY:{Escape(title)}");

        if (!string.IsNullOrWhiteSpace(location))
        {
            builder.AppendLine($"LOCATION:{location}");
        }

        if (LooksLikeUrl(interview.LocationOrMeetingLink))
        {
            builder.AppendLine($"URL:{Escape(interview.LocationOrMeetingLink.Trim())}");
        }

        if (!string.IsNullOrWhiteSpace(description))
        {
            builder.AppendLine($"DESCRIPTION:{description}");
        }

        if (!string.IsNullOrWhiteSpace(interview.Recruiter.Email))
        {
            builder.AppendLine($"ORGANIZER:MAILTO:{EscapeEmail(interview.Recruiter.Email)}");
            builder.AppendLine($"ATTENDEE:MAILTO:{EscapeEmail(interview.Recruiter.Email)}");
        }

        if (!string.IsNullOrWhiteSpace(interview.JobSeeker.Email))
        {
            builder.AppendLine($"ATTENDEE:MAILTO:{EscapeEmail(interview.JobSeeker.Email)}");
        }

        builder.AppendLine("END:VEVENT");
        builder.AppendLine("END:VCALENDAR");

        return builder.ToString();
    }

    private static string BuildDescription(InterviewEntity interview)
    {
        var parts = new List<string>();
        var candidateName = ResolveDisplayName(interview.JobSeeker, "Candidate");
        var recruiterName = ResolveDisplayName(interview.Recruiter, "Recruiter");
        var interviewType = interview.InterviewType.ToString();

        parts.Add($"Interview title: Interview with {candidateName}");
        parts.Add($"Candidate name: {candidateName}");
        parts.Add($"Job title: {interview.Job.Title}");
        parts.Add($"Interview date (UTC): {EnsureUtc(interview.ScheduledDateTimeUtc):yyyy-MM-dd}");
        parts.Add($"Interview time (UTC): {EnsureUtc(interview.ScheduledDateTimeUtc):HH:mm}");
        parts.Add($"Interview type: {interviewType}");

        if (!string.IsNullOrWhiteSpace(interview.Message))
        {
            parts.Add($"Message: {interview.Message.Trim()}");
        }

        parts.Add($"Recruiter: {recruiterName}");

        if (!string.IsNullOrWhiteSpace(interview.Recruiter.Email))
        {
            parts.Add($"Recruiter email: {interview.Recruiter.Email.Trim()}");
        }

        if (!string.IsNullOrWhiteSpace(interview.JobSeeker.Email))
        {
            parts.Add($"Jobseeker email: {interview.JobSeeker.Email.Trim()}");
        }

        if (!string.IsNullOrWhiteSpace(interview.LocationOrMeetingLink))
        {
            parts.Add($"{(interview.InterviewType == InterviewType.Virtual ? "Meeting link" : "Location / Address")}: {interview.LocationOrMeetingLink.Trim()}");
        }

        return Escape(string.Join("\\n", parts));
    }


    private static bool LooksLikeUrl(string? value)
        => Uri.TryCreate(value?.Trim(), UriKind.Absolute, out var uri)
           && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);

    private static DateTime EnsureUtc(DateTime value)
        => value.Kind == DateTimeKind.Utc ? value : DateTime.SpecifyKind(value, DateTimeKind.Utc);

    private static string FormatUtc(DateTime value)
        => value.ToUniversalTime().ToString("yyyyMMdd'T'HHmmss'Z'");

    private static string Escape(string value)
        => value
            .Replace("\\", "\\\\", StringComparison.Ordinal)
            .Replace(";", "\\;", StringComparison.Ordinal)
            .Replace(",", "\\,", StringComparison.Ordinal)
            .Replace("\r\n", "\\n", StringComparison.Ordinal)
            .Replace("\n", "\\n", StringComparison.Ordinal)
            .Replace("\r", "\\n", StringComparison.Ordinal);

    private static string EscapeEmail(string value)
        => value.Trim().Replace("\r", string.Empty, StringComparison.Ordinal).Replace("\n", string.Empty, StringComparison.Ordinal);

    private static string ResolveDisplayName(AppUser user, string fallback)
        => string.IsNullOrWhiteSpace(user.UserName) ? user.Email ?? fallback : user.UserName;
}
