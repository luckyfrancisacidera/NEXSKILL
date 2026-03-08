namespace SkillSense.Application.Interfaces.Auth;

public interface IResetPinEmailSender
{
    Task SendResetPinAsync(string toEmail, string pin, CancellationToken ct = default);
}
