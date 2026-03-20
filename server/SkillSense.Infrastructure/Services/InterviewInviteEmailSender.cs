using System.Text;
using SkillSense.Application.Contracts.Email;
using SkillSense.Application.Interfaces;

namespace SkillSense.Infrastructure.Services;

public sealed class InterviewInviteEmailSender(IEmailService emailService) : IInterviewInviteEmailSender
{
    public Task SendCalendarInviteAsync(
        string toEmail,
        string subject,
        string body,
        string attachmentFileName,
        string calendarContent,
        CancellationToken ct = default)
        => emailService.SendEmailAsync(new EmailMessage
        {
            ToEmail = toEmail,
            Subject = subject,
            Html = BuildInviteHtml(body),
            Attachments =
            {
                new EmailAttachment
                {
                    FileName = attachmentFileName,
                    ContentType = "text/calendar; charset=utf-8",
                    Content = Encoding.UTF8.GetBytes(calendarContent),
                }
            }
        }, ct);

    private static string BuildInviteHtml(string body)
    {
        var lines = body
            .Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(line => $"<p>{System.Net.WebUtility.HtmlEncode(line)}</p>");

        return string.Join(string.Empty, lines);
    }
}
