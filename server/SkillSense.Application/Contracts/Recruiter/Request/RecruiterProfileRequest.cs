using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Recruiter.Request
{
    public sealed class RecruiterProfileRequest
    {
        [JsonPropertyName("company_name")]
        public string CompanyName { get; set; } = string.Empty;

        [JsonPropertyName("company_email")]
        public string CompanyEmail { get; set; } = string.Empty;
    }
}
