namespace SkillSense.Persistence.Models;

public sealed class ApplicationListItemData
{
    public Guid Id { get; set; }
    public Guid JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}

public sealed class SavedJobData
{
    public Guid JobId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string Currency { get; set; } = "PHP";
    public string EmploymentType { get; set; } = string.Empty;
    public DateTime SavedAtUtc { get; set; }
}
