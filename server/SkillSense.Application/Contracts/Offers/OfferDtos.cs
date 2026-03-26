using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Offers;

public sealed class SendOfferRequest
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("salary_text")]
    public string SalaryText { get; set; } = string.Empty;

    [JsonPropertyName("employment_type")]
    public string EmploymentType { get; set; } = string.Empty;

    [JsonPropertyName("start_date")]
    public DateOnly? StartDate { get; set; }

    [JsonPropertyName("expiration_date")]
    public DateOnly? ExpirationDate { get; set; }
}

public sealed class OfferResponse
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("application_id")]
    public Guid ApplicationId { get; set; }

    [JsonPropertyName("sent_by_user_id")]
    public Guid SentByUserId { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("salary_text")]
    public string SalaryText { get; set; } = string.Empty;

    [JsonPropertyName("employment_type")]
    public string EmploymentType { get; set; } = string.Empty;

    [JsonPropertyName("start_date")]
    public DateOnly? StartDate { get; set; }

    [JsonPropertyName("expiration_date")]
    public DateOnly? ExpirationDate { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("sent_at_utc")]
    public DateTime SentAtUtc { get; set; }

    [JsonPropertyName("responded_at_utc")]
    public DateTime? RespondedAtUtc { get; set; }

    [JsonPropertyName("created_at_utc")]
    public DateTime CreatedAtUtc { get; set; }

    [JsonPropertyName("updated_at_utc")]
    public DateTime UpdatedAtUtc { get; set; }

    [JsonPropertyName("can_accept")]
    public bool CanAccept { get; set; }

    [JsonPropertyName("can_decline")]
    public bool CanDecline { get; set; }

    [JsonPropertyName("can_mark_hired")]
    public bool CanMarkHired { get; set; }
}
