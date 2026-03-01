using System.ComponentModel.DataAnnotations;

namespace SkillSense.Application.Contracts.Auth;

public sealed class CreatePrivilegedUserRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(Recruiter|Admin)$", ErrorMessage = "Role must be Recruiter or Admin.")]
    public string Role { get; set; } = string.Empty;
}
