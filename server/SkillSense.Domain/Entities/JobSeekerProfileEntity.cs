namespace SkillSense.Domain.Entities;

public sealed class JobSeekerProfileEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public AppUser User { get; set; } = null!;

    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? Location { get; set; }
    public string? ProfessionalTitle { get; set; }
    public string? Skills { get; set; }
    public string? Bio { get; set; }
    public string? ExperienceSummary { get; set; }
    public string? ResumeUrl { get; set; }
    public string? AvatarUrl { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
