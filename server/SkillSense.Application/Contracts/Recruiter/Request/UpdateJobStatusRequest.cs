using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Recruiter.Request;

public sealed class UpdateJobStatusRequest
{
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;
}
