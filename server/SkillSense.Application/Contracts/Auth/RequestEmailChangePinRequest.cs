using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Auth;

public sealed class RequestEmailChangePinRequest
{
    [JsonPropertyName("new_email")]
    public string NewEmail { get; set; } = string.Empty;

    [JsonPropertyName("confirm_email")]
    public string ConfirmEmail { get; set; } = string.Empty;
}
