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

    public string NormalizedAppPassword
        => string.Concat((AppPassword ?? string.Empty).Where(character => !char.IsWhiteSpace(character)));

    public bool IsConfigured()
        => !string.IsNullOrWhiteSpace(Host)
            && Port > 0
            && !string.IsNullOrWhiteSpace(Email)
            && !string.IsNullOrWhiteSpace(NormalizedAppPassword)
            && (!string.IsNullOrWhiteSpace(FromEmail) || !string.IsNullOrWhiteSpace(Email));
}
