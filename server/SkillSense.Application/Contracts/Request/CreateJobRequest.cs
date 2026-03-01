using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Request
{
    public sealed class CreateJobRequest
    {
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        [JsonPropertyName("status")]
        public string? Status { get; set; }

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
}
