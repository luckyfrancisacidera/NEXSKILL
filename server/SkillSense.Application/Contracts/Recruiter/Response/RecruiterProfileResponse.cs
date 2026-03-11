using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Recruiter.Response
{
    public sealed class RecruiterProfileResponse
    {
        [JsonPropertyName("profile_id")]
        public Guid ProfileId { get; set; }

        [JsonPropertyName("company_id")]
        public Guid CompanyId { get; set; }

        [JsonPropertyName("company_name")]
        public string? CompanyName { get; set; }

        [JsonPropertyName("company_email")]
        public string? CompanyEmail { get; set; }

        [JsonPropertyName("is_complete")]
        public bool IsComplete { get; set; }
    }
}
