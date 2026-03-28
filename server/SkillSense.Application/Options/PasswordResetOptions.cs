namespace SkillSense.Application.Options;

public sealed class PasswordResetOptions
{
    public const string SectionName = "PasswordReset";

    public string FrontendBaseUrl { get; set; } = string.Empty;

    public int TokenLifespanMinutes { get; set; } = 60;
}
