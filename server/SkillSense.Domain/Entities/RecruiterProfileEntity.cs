namespace SkillSense.Domain.Entities;

public sealed class RecruiterProfileEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public string? CompanyName { get; set; }
    public string? CompanyEmail { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
