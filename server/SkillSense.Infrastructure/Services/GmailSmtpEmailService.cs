using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SkillSense.Application.Contracts.Email;
using SkillSense.Application.Interfaces;
using SkillSense.Infrastructure.Options;

namespace SkillSense.Infrastructure.Services;

public sealed class GmailSmtpEmailService(
    IOptions<GmailSmtpOptions> settings,
    ILogger<GmailSmtpEmailService> logger) : IEmailService
{
    private readonly GmailSmtpOptions _settings = settings.Value;

    public async Task SendEmailAsync(EmailMessage message, CancellationToken ct = default)
    {
        if (!HasRequiredSettings(_settings))
        {
            logger.LogError("Gmail SMTP is not fully configured. Email delivery to {Email} was skipped.", message.ToEmail);
            throw new InvalidOperationException("Gmail SMTP is not fully configured.");
        }

        using var mailMessage = BuildMailMessage(message, _settings);
        using var smtpClient = new SmtpClient(_settings.Host.Trim(), _settings.Port)
        {
            DeliveryMethod = SmtpDeliveryMethod.Network,
            EnableSsl = _settings.EnableSsl,
            Credentials = new NetworkCredential(_settings.Email.Trim(), _settings.AppPassword.Trim()),
        };

        try
        {
            await smtpClient.SendMailAsync(mailMessage, ct);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex) when (ex is SmtpException or InvalidOperationException or FormatException)
        {
            logger.LogError(ex, "Gmail SMTP email delivery failed for {Email}.", message.ToEmail);
            throw new InvalidOperationException("Email delivery failed.", ex);
        }
    }

    private static MailMessage BuildMailMessage(EmailMessage message, GmailSmtpOptions settings)
    {
        var fromEmail = string.IsNullOrWhiteSpace(settings.FromEmail)
            ? settings.Email.Trim()
            : settings.FromEmail.Trim();

        var mailMessage = new MailMessage
        {
            From = string.IsNullOrWhiteSpace(settings.FromName)
                ? new MailAddress(fromEmail)
                : new MailAddress(fromEmail, settings.FromName.Trim()),
            Subject = message.Subject,
            Body = message.Html,
            IsBodyHtml = true,
        };

        mailMessage.To.Add(new MailAddress(message.ToEmail.Trim()));

        foreach (var attachment in message.Attachments)
        {
            var stream = new MemoryStream(attachment.Content);
            mailMessage.Attachments.Add(new Attachment(stream, attachment.FileName, attachment.ContentType));
        }

        return mailMessage;
    }

    private static bool HasRequiredSettings(GmailSmtpOptions settings)
        => !string.IsNullOrWhiteSpace(settings.Host)
            && settings.Port > 0
            && !string.IsNullOrWhiteSpace(settings.Email)
            && !string.IsNullOrWhiteSpace(settings.AppPassword)
            && (!string.IsNullOrWhiteSpace(settings.FromEmail) || !string.IsNullOrWhiteSpace(settings.Email));
}
