using System.ComponentModel.DataAnnotations;

namespace SkillSense.Application.Contracts.Auth;

public sealed class ResetPasswordRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
    [Required, RegularExpression("^\\d{6}$")]
    public string Pin { get; set; } = string.Empty;
    [Required, MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}
