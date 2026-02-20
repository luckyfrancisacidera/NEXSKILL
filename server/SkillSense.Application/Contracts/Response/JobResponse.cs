using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Response
{
    public class JobResponse
    {
        [JsonPropertyName("job_id")]
        public Guid JobId { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
    }
}
