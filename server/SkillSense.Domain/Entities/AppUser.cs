using Microsoft.AspNetCore.Identity;

namespace SkillSense.Domain.Entities;

public sealed class AppUser : IdentityUser<Guid>
{
    public AppUser()
    {
        IsActive = true;
        LockoutEnabled = false;
    }

    public bool IsActive { get; set; } = true;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Location { get; set; }
    public JobSeekerProfileEntity? JobSeekerProfile { get; set; }
    public RecruiterProfileEntity? RecruiterProfile { get; set; }
    public AdminProfileEntity? AdminProfile { get; set; }
    public ICollection<SavedJobEntity> SavedJobs { get; set; } = [];
    public ICollection<PasswordResetPinEntity> PasswordResetPins { get; set; } = [];
}
