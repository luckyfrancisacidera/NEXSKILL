namespace SkillSense.Domain.Entities;

public sealed class CompanyEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? PrimaryEmail { get; set; }
    public string? Location { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

