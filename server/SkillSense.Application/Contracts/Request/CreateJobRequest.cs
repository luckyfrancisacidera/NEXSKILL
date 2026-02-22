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
    }
}
