using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Request
{
    public class CreateJobRequest
    {
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
    }
}
