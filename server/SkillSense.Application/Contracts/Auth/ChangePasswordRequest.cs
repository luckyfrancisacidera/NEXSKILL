using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Auth;

public sealed class ChangePasswordRequest
{
    [Required]
    [JsonPropertyName("currentPassword")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required, MinLength(8)]
    [JsonPropertyName("newPassword")]
    public string NewPassword { get; set; } = string.Empty;
}
