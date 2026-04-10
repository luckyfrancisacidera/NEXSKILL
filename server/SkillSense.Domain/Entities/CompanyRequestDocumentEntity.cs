using SkillSense.Domain.Enums;

namespace SkillSense.Domain.Entities;

public sealed class CompanyRequestDocumentEntity
{
    public Guid Id { get; set; }
    public Guid CompanyAccountRequestId { get; set; }
    public CompanyAccountRequestEntity CompanyAccountRequest { get; set; } = null!;
    public CompanyDocumentType DocumentType { get; set; }
    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public string StorageKey { get; set; } = string.Empty;
    public string StorageProvider { get; set; } = string.Empty;
    public DateTime UploadedAtUtc { get; set; } = DateTime.UtcNow;
}
