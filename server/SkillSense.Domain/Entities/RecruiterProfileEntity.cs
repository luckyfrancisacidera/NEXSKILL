namespace SkillSense.Domain.Entities;

public sealed class RecruiterProfileEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public Guid CompanyId { get; set; }
    public CompanyEntity Company { get; set; } = null!;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
