using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Auth;

public sealed class VerifyEmailChangePinRequest
{
    [JsonPropertyName("new_email")]
    public string NewEmail { get; set; } = string.Empty;

    [JsonPropertyName("pin")]
    public string Pin { get; set; } = string.Empty;
}
