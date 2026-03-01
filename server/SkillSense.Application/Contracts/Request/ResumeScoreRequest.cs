using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Request;

public sealed class ResumeScoreRequest
{
    [JsonPropertyName("submission_id")]
    public Guid SubmissionId { get; set; }

    [JsonPropertyName("job_description")]
    public JobDescriptionInput JobDescription { get; set; } = new();
}
