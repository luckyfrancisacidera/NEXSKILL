using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Auth;

public sealed class UpdateAccountProfileRequest
{
    [JsonPropertyName("first_name")]
    [MaxLength(120)]
    public string? FirstName { get; set; }

    [JsonPropertyName("last_name")]
    [MaxLength(120)]
    public string? LastName { get; set; }
}
