using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Recruiter.Response;

public sealed class CandidateExplanationResponse
{
    [JsonPropertyName("provider")]
    public string Provider { get; set; } = string.Empty;

    [JsonPropertyName("model")]
    public string Model { get; set; } = string.Empty;

    [JsonPropertyName("summary")]
    public string? Summary { get; set; }

    [JsonPropertyName("strengths")]
    public List<string> Strengths { get; set; } = [];

    [JsonPropertyName("gaps")]
    public List<string> Gaps { get; set; } = [];

    [JsonPropertyName("risks")]
    public List<string> Risks
    {
        get => Gaps;
        set => Gaps = value ?? [];
    }

    [JsonPropertyName("explanation_text")]
    public string ExplanationText { get; set; } = string.Empty;

    [JsonPropertyName("recommendation")]
    public string Recommendation { get; set; } = string.Empty;

    [JsonPropertyName("generated_at_utc")]
    public DateTime? GeneratedAtUtc { get; set; }
}
