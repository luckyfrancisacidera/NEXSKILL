using SkillSense.Application.Contracts.Email;

namespace SkillSense.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(EmailMessage message, CancellationToken ct = default);
}
