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
        if (!_settings.Enabled)
        {
            logger.LogWarning(
                "SMTP delivery is disabled by configuration. Email delivery to {Email} was skipped.",
                message.ToEmail);
            throw new InvalidOperationException("Email delivery is disabled for this environment.");
        }

        if (!_settings.IsConfigured())
        {
            logger.LogError(
                "SMTP is enabled but not fully configured. Email delivery to {Email} was skipped.",
                message.ToEmail);
            throw new InvalidOperationException("SMTP is enabled but not fully configured.");
        }

        using var mailMessage = BuildMailMessage(message, _settings);
        using var smtpClient = new SmtpClient(_settings.Host.Trim(), _settings.Port)
        {
            DeliveryMethod = SmtpDeliveryMethod.Network,
            EnableSsl = _settings.EnableSsl,
            Credentials = new NetworkCredential(_settings.Email.Trim(), _settings.NormalizedAppPassword),
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
            logger.LogError(
                ex,
                "Gmail SMTP email delivery failed. To={Email} Host={Host} Port={Port} Sender={Sender}.",
                message.ToEmail,
                _settings.Host.Trim(),
                _settings.Port,
                _settings.Email.Trim());
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
}
