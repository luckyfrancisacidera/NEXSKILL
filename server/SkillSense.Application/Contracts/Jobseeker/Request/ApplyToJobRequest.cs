using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Jobseeker.Request
{
    public sealed class ApplyToJobRequest
    {
        [JsonPropertyName("full_name")]
        public string FullName { get; set; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("postal_code")]
        public string PostalCode { get; set; } = string.Empty;

        [JsonPropertyName("location")]
        public string Location { get; set; } = string.Empty;
    }
}
