using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Recruiter.Response
{
    public sealed class JobListItemResponse
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("department")]
        public string? Department { get; set; }

        [JsonPropertyName("benefits")]
        public string? Benefits { get; set; }

        [JsonPropertyName("salary_min_per_annum")]
        public decimal? SalaryMinPerAnnum { get; set; }

        [JsonPropertyName("salary_max_per_annum")]
        public decimal? SalaryMaxPerAnnum { get; set; }

        [JsonPropertyName("currency")]
        public string Currency { get; set; } = "PHP";

        [JsonPropertyName("location")]
        public string Location { get; set; } = string.Empty;

        [JsonPropertyName("schedule")]
        public string? Schedule { get; set; }

        [JsonPropertyName("work_setup")]
        public string WorkSetup { get; set; } = string.Empty;

        [JsonPropertyName("employment_type")]
        public string EmploymentType { get; set; } = string.Empty;

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("company_name")]
        public string? CompanyName { get; set; }

        [JsonPropertyName("company_email")]
        public string? CompanyEmail { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        [JsonPropertyName("responsibilities")]
        public string Responsibilities { get; set; } = string.Empty;

        [JsonPropertyName("required_skills")]
        public List<string> RequiredSkills { get; set; } = [];

        [JsonPropertyName("preferred_skills")]
        public List<string> PreferredSkills { get; set; } = [];

        [JsonPropertyName("experience_level")]
        public string? ExperienceLevel { get; set; }

        [JsonPropertyName("min_years")]
        public int? MinYears { get; set; }

        [JsonPropertyName("education")]
        public string? Education { get; set; }

        [JsonPropertyName("min_education")]
        public string? MinEducation { get; set; }

        [JsonPropertyName("posted_date_utc")]
        public DateTime? PostedDateUtc { get; set; }
    }
}
