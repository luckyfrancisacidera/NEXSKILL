using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Response
{
    public class ResumeUploadResponse
    {
        [JsonPropertyName("submission_id")]
        public Guid SubmissionId { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;
    }
}
