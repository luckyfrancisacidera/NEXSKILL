namespace SkillSense.Application.Interfaces;

public interface IInterviewInviteEmailSender
{
    Task SendCalendarInviteAsync(
        string toEmail,
        string subject,
        string body,
        string attachmentFileName,
        string calendarContent,
        CancellationToken ct = default);
}
