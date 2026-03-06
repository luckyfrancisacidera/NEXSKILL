using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Scoring.Response;

public sealed class SectionScore
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("score")]
    public float Score { get; set; }

    [JsonPropertyName("weight")]
    public float Weight { get; set; }

    [JsonPropertyName("matched_items")]
    public List<MatchEvidence> MatchedItems { get; set; } = [];

    [JsonPropertyName("notes")]
    public List<string> Notes { get; set; } = [];
}
