using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Recruiter.Response;

public sealed class CandidateStructuredExplanation
{
    [JsonPropertyName("overall_fit")]
    public string OverallFit { get; set; } = string.Empty;

    [JsonPropertyName("strengths")]
    public List<string> Strengths { get; set; } = [];

    [JsonPropertyName("areas_to_validate")]
    public List<string> AreasToValidate { get; set; } = [];

    [JsonPropertyName("potential_risks")]
    public List<string> PotentialRisks { get; set; } = [];

    [JsonPropertyName("recommended_interview_focus")]
    public List<string> RecommendedInterviewFocus { get; set; } = [];

    [JsonPropertyName("summary")]
    public string Summary
    {
        get => OverallFit;
        set => OverallFit = value ?? string.Empty;
    }

    [JsonPropertyName("gaps")]
    public List<string> Gaps
    {
        get => PotentialRisks;
        set => PotentialRisks = value ?? [];
    }

    [JsonPropertyName("risks")]
    public List<string> Risks
    {
        get => PotentialRisks;
        set => PotentialRisks = value ?? [];
    }

    [JsonPropertyName("recommendation")]
    public string Recommendation
    {
        get => RecommendedInterviewFocus.Count == 0
            ? string.Empty
            : string.Join(" ", RecommendedInterviewFocus);
        set => RecommendedInterviewFocus = string.IsNullOrWhiteSpace(value) ? [] : [value];
    }
}

public sealed class CandidateExplanationGenerationResult
{
    public CandidateStructuredExplanation Explanation { get; set; } = new();
    public string RawProviderResponse { get; set; } = string.Empty;
}
