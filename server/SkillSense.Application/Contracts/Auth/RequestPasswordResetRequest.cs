using System.ComponentModel.DataAnnotations;

namespace SkillSense.Application.Contracts.Auth;

public sealed class RequestPasswordResetRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
}
