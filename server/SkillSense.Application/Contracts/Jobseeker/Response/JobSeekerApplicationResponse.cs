using System.Text.Json.Serialization;
using SkillSense.Application.Contracts.Offers;

namespace SkillSense.Application.Contracts.Jobseeker.Response;

public sealed class JobSeekerApplicationResponse
{
    [JsonPropertyName("id")]
    public Guid Id { get; init; }

    [JsonPropertyName("job_id")]
    public Guid JobId { get; init; }

    [JsonPropertyName("job_title")]
    public string JobTitle { get; init; } = string.Empty;

    [JsonPropertyName("company")]
    public string Company { get; init; } = string.Empty;

    [JsonPropertyName("company_name")]
    public string CompanyName { get; init; } = string.Empty;

    [JsonPropertyName("recruiter_name")]
    public string? RecruiterName { get; init; }

    [JsonPropertyName("recruiter_email")]
    public string? RecruiterEmail { get; init; }

    [JsonPropertyName("full_name")]
    public string? FullName { get; init; }

    [JsonPropertyName("email")]
    public string? Email { get; init; }

    [JsonPropertyName("status")]
    public string Status { get; init; } = string.Empty;

    [JsonPropertyName("current_stage")]
    public string CurrentStage { get; init; } = string.Empty;

    [JsonPropertyName("has_offer")]
    public bool HasOffer { get; init; }

    [JsonPropertyName("is_hired")]
    public bool IsHired { get; init; }

    [JsonPropertyName("offered_at_utc")]
    public DateTime? OfferedAtUtc { get; init; }

    [JsonPropertyName("hired_at_utc")]
    public DateTime? HiredAtUtc { get; init; }

    [JsonPropertyName("created_at_utc")]
    public DateTime CreatedAtUtc { get; init; }

    [JsonPropertyName("updated_at_utc")]
    public DateTime UpdatedAtUtc { get; init; }

    [JsonPropertyName("offer")]
    public OfferResponse? Offer { get; init; }
}
