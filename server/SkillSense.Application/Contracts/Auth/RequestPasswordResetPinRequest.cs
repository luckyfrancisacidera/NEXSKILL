using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Auth;

public sealed class RequestPasswordResetPinRequest
{
    [Required, EmailAddress]
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
}
