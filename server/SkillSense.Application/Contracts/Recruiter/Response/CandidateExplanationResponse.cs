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

    [JsonPropertyName("overall_fit")]
    public string? OverallFit
    {
        get => Summary;
        set => Summary = value;
    }

    [JsonPropertyName("strengths")]
    public List<string> Strengths { get; set; } = [];

    [JsonPropertyName("areas_to_validate")]
    public List<string> AreasToValidate { get; set; } = [];

    [JsonPropertyName("potential_risks")]
    public List<string> PotentialRisks { get; set; } = [];

    [JsonPropertyName("recommended_interview_focus")]
    public List<string> RecommendedInterviewFocus { get; set; } = [];

    [JsonPropertyName("gaps")]
    public List<string> Gaps { get; set; } = [];

    [JsonPropertyName("risks")]
    public List<string> Risks
    {
        get => PotentialRisks.Count > 0 ? PotentialRisks : Gaps;
        set => PotentialRisks = value ?? [];
    }

    [JsonPropertyName("explanation_text")]
    public string ExplanationText { get; set; } = string.Empty;

    [JsonPropertyName("recommendation")]
    public string Recommendation { get; set; } = string.Empty;

    [JsonPropertyName("generated_at_utc")]
    public DateTime? GeneratedAtUtc { get; set; }
}
