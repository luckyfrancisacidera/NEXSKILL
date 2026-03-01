using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Recruiter.Response
{
    public sealed class RecruiterDashboardResponse
    {
        [JsonPropertyName("jobs_posted_over_time")]
        public IReadOnlyList<TimePointResponse> JobsPostedOverTime { get; set; } = [];

        [JsonPropertyName("applications_over_time")]
        public IReadOnlyList<TimePointResponse> ApplicationsOverTime { get; set; } = [];

        [JsonPropertyName("top_jobs_by_applications")]
        public IReadOnlyList<TopJobResponse> TopJobsByApplications { get; set; } = [];

        [JsonPropertyName("recommended_count")]
        public int RecommendedCount { get; set; }

        [JsonPropertyName("shortlisted_count")]
        public int ShortlistedCount { get; set; }
    }

    public sealed class TimePointResponse
    {
        [JsonPropertyName("date")]
        public string Date { get; set; } = string.Empty;

        [JsonPropertyName("count")]
        public int Count { get; set; }
    }

    public sealed class TopJobResponse
    {
        [JsonPropertyName("job_id")]
        public Guid JobId { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("applications")]
        public int Applications { get; set; }
    }
}
