namespace SkillSense.Domain.Entities;

public sealed class PasswordResetPinEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Pin { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public bool Used { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public AppUser User { get; set; } = null!;
}
