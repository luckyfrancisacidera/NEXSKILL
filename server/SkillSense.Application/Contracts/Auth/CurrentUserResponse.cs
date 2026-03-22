using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Auth;

public sealed class CurrentUserResponse
{
    [JsonPropertyName("is_authenticated")]
    public bool IsAuthenticated { get; init; }

    [JsonPropertyName("user_id")]
    public string? UserId { get; init; }

    [JsonPropertyName("email")]
    public string? Email { get; init; }

    [JsonPropertyName("first_name")]
    public string? FirstName { get; init; }

    [JsonPropertyName("last_name")]
    public string? LastName { get; init; }

    [JsonPropertyName("role")]
    public string? Role { get; init; }

    [JsonPropertyName("roles")]
    public string[] Roles { get; init; } = [];

    [JsonPropertyName("active_company_id")]
    public string? ActiveCompanyId { get; init; }

    [JsonPropertyName("active_recruiter_profile_id")]
    public string? ActiveRecruiterProfileId { get; init; }

    [JsonPropertyName("company_ids")]
    public string[] CompanyIds { get; init; } = [];

    [JsonPropertyName("recruiter_profile_ids")]
    public string[] RecruiterProfileIds { get; init; } = [];

    public static CurrentUserResponse Unauthenticated() => new()
    {
        IsAuthenticated = false,
        Roles = [],
        CompanyIds = [],
        RecruiterProfileIds = [],
    };
}
