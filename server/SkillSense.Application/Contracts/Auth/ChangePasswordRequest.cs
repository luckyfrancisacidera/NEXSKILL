using System.ComponentModel.DataAnnotations;

namespace SkillSense.Application.Contracts.Auth;

public sealed class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}
