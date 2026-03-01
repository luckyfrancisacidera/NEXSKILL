using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Recruiter.Request
{
    public sealed class UpdateJobRequest
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

        [JsonPropertyName("department")]
        public string? Department { get; set; }

        [JsonPropertyName("benefits")]
        public string? Benefits { get; set; }

        [JsonPropertyName("salary_min_per_annum")]
        public decimal? SalaryMinPerAnnum { get; set; }

        [JsonPropertyName("salary_max_per_annum")]
        public decimal? SalaryMaxPerAnnum { get; set; }

        [JsonPropertyName("currency")]
        public string? Currency { get; set; }

        [JsonPropertyName("location")]
        public string Location { get; set; } = string.Empty;

        [JsonPropertyName("schedule")]
        public string? Schedule { get; set; }

        [JsonPropertyName("work_setup")]
        public int? WorkSetup { get; set; }

        [JsonPropertyName("employment_type")]
        public int? EmploymentType { get; set; }
    }
}
