using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Recruiter.Response;

public sealed class CandidateStructuredExplanation
{
    [JsonPropertyName("summary")]
    public string Summary { get; set; } = string.Empty;

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

    [JsonPropertyName("recommendation")]
    public string Recommendation { get; set; } = string.Empty;
}

public sealed class CandidateExplanationGenerationResult
{
    public CandidateStructuredExplanation Explanation { get; set; } = new();
    public string RawProviderResponse { get; set; } = string.Empty;
}
