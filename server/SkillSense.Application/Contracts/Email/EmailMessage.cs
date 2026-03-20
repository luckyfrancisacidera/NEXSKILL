namespace SkillSense.Application.Contracts.Email;

public sealed class EmailMessage
{
    public string ToEmail { get; set; } = string.Empty;

    public string Subject { get; set; } = string.Empty;

    public string Html { get; set; } = string.Empty;

    public List<EmailAttachment> Attachments { get; set; } = [];
}
