namespace SkillSense.Infrastructure.Options;

public sealed class GmailSmtpOptions
{
    public const string SectionName = "GmailSmtp";

    public string Host { get; set; } = "smtp.gmail.com";

    public int Port { get; set; } = 587;

    public string Email { get; set; } = string.Empty;

    public string AppPassword { get; set; } = string.Empty;

    public string FromEmail { get; set; } = string.Empty;

    public string FromName { get; set; } = string.Empty;

    public bool EnableSsl { get; set; } = true;
}
