using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Request;

public sealed class NormalizedJobDescription
{
    [JsonPropertyName("job_id")]
    public string JobId { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("responsibilities")]
    public List<string> Responsibilities { get; set; } = [];

    [JsonPropertyName("required_skills")]
    public List<string> RequiredSkills { get; set; } = [];

    [JsonPropertyName("preferred_skills")]
    public List<string> PreferredSkills { get; set; } = [];

    [JsonPropertyName("minimum_years_experience")]
    public int MinimumYearsExperience { get; set; }

    [JsonPropertyName("minimum_education_level")]
    public string MinimumEducationLevel { get; set; } = string.Empty;

    [JsonPropertyName("education_requirements")]
    public List<string> EducationRequirements { get; set; } = [];

    [JsonPropertyName("metadata")]
    public Dictionary<string, string> Metadata { get; set; } = [];
}
