namespace SkillSense.Domain.Entities;

public sealed class CompanyEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? BusinessName { get; set; }
    public string? Industry { get; set; }
    public string? CompanySize { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? Description { get; set; }
    public string? Country { get; set; }
    public string? CityProvince { get; set; }
    public string? FullAddress { get; set; }
    public string? PrimaryAdminFullName { get; set; }
    public string? PrimaryAdminPhone { get; set; }
    public string? PrimaryAdminRole { get; set; }
    public string? PrimaryEmail { get; set; }
    public string? Location { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    public ICollection<AdminProfileEntity> AdminProfiles { get; set; } = [];
}
