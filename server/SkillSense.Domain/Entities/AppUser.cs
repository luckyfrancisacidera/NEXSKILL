using Microsoft.AspNetCore.Identity;

namespace SkillSense.Domain.Entities;

public sealed class AppUser : IdentityUser<Guid>
{
    public JobSeekerProfileEntity? JobSeekerProfile { get; set; }
    public RecruiterProfileEntity? RecruiterProfile { get; set; }
    public AdminProfileEntity? AdminProfile { get; set; }
}
