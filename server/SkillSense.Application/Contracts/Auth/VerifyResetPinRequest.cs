using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Auth;

public sealed class VerifyResetPinRequest
{
    [Required, EmailAddress]
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("pin")]
    public string Pin { get; set; } = string.Empty;

    [Required, MinLength(8)]
    [JsonPropertyName("newPassword")]
    public string NewPassword { get; set; } = string.Empty;

    [Required, MinLength(8)]
    [JsonPropertyName("confirmPassword")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
