namespace SkillSense.Infrastructure.Options;

public sealed class StorageOptions
{
    public const string SectionName = "Storage";

    public string Driver { get; set; } = "local";
    public string LocalRootPath { get; set; } = string.Empty;
    public int ResumeDownloadUrlExpirySeconds { get; set; } = 120;
}
