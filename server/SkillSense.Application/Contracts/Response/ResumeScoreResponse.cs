using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Response;

public sealed class ResumeScoreResponse
{
    [JsonPropertyName("job_id")]
    public Guid JobId { get; set; }

    [JsonPropertyName("overall_similarity")]
    public float OverallSimilarity { get; set; }

    [JsonPropertyName("job_target_similarity")]
    public float? JobTargetSimilarity { get; set; }

    [JsonPropertyName("applied_job_position_similarity")]
    public float? AppliedJobPositionSimilarity { get; set; }

    [JsonPropertyName("section_similarities")]
    public List<SectionSimilarity> SectionSimilarities { get; set; } = new();
}
