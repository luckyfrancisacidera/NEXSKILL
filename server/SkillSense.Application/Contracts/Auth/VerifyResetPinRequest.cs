using System.ComponentModel.DataAnnotations;

namespace SkillSense.Application.Contracts.Auth;

public sealed class VerifyResetPinRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
    [Required, RegularExpression("^\\d{6}$")]
    public string Pin { get; set; } = string.Empty;
}
