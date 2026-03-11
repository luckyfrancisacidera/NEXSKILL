using System.ComponentModel.DataAnnotations;

namespace SkillSense.Application.Contracts.Admin.Request;

public sealed class CreateManagedRecruiterRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;
}
