using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Auth;

public sealed class RegisterJobSeekerRequest
{
    [JsonPropertyName("first_name")]
    [Required, StringLength(120)]
    public string FirstName { get; set; } = string.Empty;

    [JsonPropertyName("last_name")]
    [Required, StringLength(120)]
    public string LastName { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("password")]
    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;
}
