namespace SkillSense.Infrastructure.Options;

public sealed class GmailSmtpOptions
{
    public const string SectionName = "GmailSmtp";

    public bool Enabled { get; set; }

    public bool Required { get; set; }

    public string Host { get; set; } = string.Empty;

    public int Port { get; set; }

    public string Email { get; set; } = string.Empty;

    public string AppPassword { get; set; } = string.Empty;

    public string FromEmail { get; set; } = string.Empty;

    public string FromName { get; set; } = string.Empty;

    public bool EnableSsl { get; set; } = true;

    public bool IsConfigured()
        => !string.IsNullOrWhiteSpace(Host)
            && Port > 0
            && !string.IsNullOrWhiteSpace(Email)
            && !string.IsNullOrWhiteSpace(AppPassword)
            && (!string.IsNullOrWhiteSpace(FromEmail) || !string.IsNullOrWhiteSpace(Email));
}
