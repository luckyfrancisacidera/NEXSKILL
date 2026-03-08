using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Jobseeker.Request;

public sealed class JobSeekerProfileRequest
{
    [JsonPropertyName("full_name")]
    public string? FullName { get; set; }
    [JsonPropertyName("phone")]
    public string? Phone { get; set; }
    [JsonPropertyName("location")]
    public string? Location { get; set; }
    [JsonPropertyName("professional_title")]
    public string? ProfessionalTitle { get; set; }
    [JsonPropertyName("skills")]
    public string? Skills { get; set; }
    [JsonPropertyName("bio")]
    public string? Bio { get; set; }
    [JsonPropertyName("experience_summary")]
    public string? ExperienceSummary { get; set; }
    [JsonPropertyName("resume_url")]
    public string? ResumeUrl { get; set; }
    [JsonPropertyName("avatar_url")]
    public string? AvatarUrl { get; set; }
}
