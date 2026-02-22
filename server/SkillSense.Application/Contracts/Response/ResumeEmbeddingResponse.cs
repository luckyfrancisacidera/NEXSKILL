using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Response;

public sealed class ResumeEmbeddingResponse
{
    [JsonPropertyName("job_description_embedding")]
    public List<float> JobDescriptionEmbedding { get; set; } = new();

    [JsonPropertyName("resume_embedding")]
    public List<float> ResumeEmbedding { get; set; } = new();

    [JsonPropertyName("section_similarities")]
    public List<SectionSimilarity> SectionSimilarities { get; set; } = new();

    [JsonPropertyName("overall_similarity")]
    public float OverallSimilarity { get; set; }

    [JsonPropertyName("job_target_similarity")]
    public float? JobTargetSimilarity { get; set; }

    [JsonPropertyName("applied_job_position_similarity")]
    public float? AppliedJobPositionSimilarity { get; set; }
}

public sealed class SectionSimilarity
{
    [JsonPropertyName("section")]
    public string Section { get; set; } = string.Empty;

    [JsonPropertyName("similarity")]
    public float Similarity { get; set; }
}
