namespace SkillSense.Application.Contracts.Email;

public sealed class EmailAttachment
{
    public string FileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = "application/octet-stream";

    public byte[] Content { get; set; } = [];
}
