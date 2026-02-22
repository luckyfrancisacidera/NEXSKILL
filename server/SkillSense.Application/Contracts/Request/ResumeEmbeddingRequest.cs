using SkillSense.Application.Contracts.Response;
using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Request;

public sealed class ResumeEmbeddingRequest
{
    [JsonPropertyName("job_description")]
    public string JobDescription { get; set; } = string.Empty;

    [JsonPropertyName("applied_job_position")]
    public string AppliedJobPosition { get; set; } = string.Empty;

    [JsonPropertyName("resume")]
    public ResumeParseResult Resume { get; set; } = new();
}
