using System.ComponentModel.DataAnnotations;

namespace SkillSense.Application.Contracts.Auth;

public sealed class CreatePrivilegedUserRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(Recruiter|Admin|CompanyAdmin|SuperAdmin)$", ErrorMessage = "Role must be Recruiter, Admin, CompanyAdmin, or SuperAdmin.")]
    public string Role { get; set; } = string.Empty;

    public Guid? CompanyId { get; set; }
}
