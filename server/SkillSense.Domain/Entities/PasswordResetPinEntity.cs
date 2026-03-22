namespace SkillSense.Domain.Entities;

public enum VerificationPinPurpose
{
    PasswordReset = 0,
    EmailChange = 1,
}

public sealed class PasswordResetPinEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string PinHash { get; set; } = string.Empty;
    public string PinSalt { get; set; } = string.Empty;
    public string? PendingEmail { get; set; }
    public VerificationPinPurpose Purpose { get; set; } = VerificationPinPurpose.PasswordReset;
    public DateTime ExpiresAtUtc { get; set; }
    public bool Used { get; set; }
    public DateTime? VerifiedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public AppUser User { get; set; } = null!;
}
