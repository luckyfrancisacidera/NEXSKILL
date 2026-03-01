using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Request;

public sealed class JobDescriptionInput
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("responsibilities")]
    public string Responsibilities { get; set; } = string.Empty;

    [JsonPropertyName("required_skills")]
    public List<string> RequiredSkills { get; set; } = new();

    [JsonPropertyName("preferred_skills")]
    public List<string> PreferredSkills { get; set; } = new();

    [JsonPropertyName("experience_level")]
    public string? ExperienceLevel { get; set; }

    [JsonPropertyName("min_years")]
    public int? MinYears { get; set; }

    [JsonPropertyName("education")]
    public string? Education { get; set; }

    [JsonPropertyName("min_education")]
    public string? MinEducation { get; set; }
}
