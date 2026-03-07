using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Recruiter.Response
{
    public sealed class RecruiterDashboardResponse
    {
        [JsonPropertyName("filters")]
        public RecruiterDashboardFilterOptionsResponse Filters { get; set; } = new();

        [JsonPropertyName("summary")]
        public RecruiterDashboardSummaryResponse Summary { get; set; } = new();

        [JsonPropertyName("trends")]
        public RecruiterDashboardTrendsResponse Trends { get; set; } = new();
    }

    public sealed class RecruiterDashboardFilterOptionsResponse
    {
        [JsonPropertyName("departments")]
        public IReadOnlyList<string> Departments { get; set; } = [];

        [JsonPropertyName("job_roles")]
        public IReadOnlyList<string> JobRoles { get; set; } = [];

        [JsonPropertyName("job_roles_by_department")]
        public IReadOnlyDictionary<string, IReadOnlyList<string>> JobRolesByDepartment { get; set; } = new Dictionary<string, IReadOnlyList<string>>();
    }

    public sealed class RecruiterDashboardSummaryResponse
    {
        [JsonPropertyName("total_applicants")]
        public MetricWithComparisonResponse TotalApplicants { get; set; } = new();

        [JsonPropertyName("total_shortlisted")]
        public MetricWithComparisonResponse TotalShortlisted { get; set; } = new();

        [JsonPropertyName("total_interview")]
        public MetricWithComparisonResponse TotalInterview { get; set; } = new();

        [JsonPropertyName("total_offer")]
        public MetricWithComparisonResponse TotalOffer { get; set; } = new();

        [JsonPropertyName("total_hired")]
        public MetricWithComparisonResponse TotalHired { get; set; } = new();
    }

    public sealed class MetricWithComparisonResponse
    {
        [JsonPropertyName("value")]
        public int Value { get; set; }

        [JsonPropertyName("previous_value")]
        public int PreviousValue { get; set; }

        [JsonPropertyName("comparison_percent")]
        public decimal ComparisonPercent { get; set; }
    }

    public sealed class RecruiterDashboardTrendsResponse
    {
        [JsonPropertyName("labels")]
        public IReadOnlyList<string> Labels { get; set; } = [];

        [JsonPropertyName("datasets")]
        public IReadOnlyList<TrendDatasetResponse> Datasets { get; set; } = [];
    }

    public sealed class TrendDatasetResponse
    {
        [JsonPropertyName("key")]
        public string Key { get; set; } = string.Empty;

        [JsonPropertyName("label")]
        public string Label { get; set; } = string.Empty;

        [JsonPropertyName("data")]
        public IReadOnlyList<int> Data { get; set; } = [];

        [JsonPropertyName("border_color")]
        public string BorderColor { get; set; } = string.Empty;

        [JsonPropertyName("background_color")]
        public string BackgroundColor { get; set; } = string.Empty;
    }
}
