using System.Text.Json;
using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Recruiter.Response
{
    public sealed class ApplicantScoresResponse
    {
        [JsonPropertyName("items")]
        public IReadOnlyList<ApplicantScoreItemResponse> Items { get; set; } = [];

        [JsonPropertyName("page_number")]
        public int PageNumber { get; set; } = 1;

        [JsonPropertyName("page_size")]
        public int PageSize { get; set; } = 10;

        [JsonPropertyName("total_count")]
        public int TotalCount { get; set; }

        [JsonPropertyName("total_pages")]
        public int TotalPages { get; set; } = 1;

        [JsonPropertyName("jobs")]
        public IReadOnlyList<ApplicantScoreJobFilterResponse> Jobs { get; set; } = [];

        [JsonPropertyName("departments")]
        public IReadOnlyList<string> Departments { get; set; } = [];

        [JsonPropertyName("counts")]
        public ApplicantScoreCountsResponse Counts { get; set; } = new();

        [JsonPropertyName("recommendation")]
        public RecommendationSettingsResponse Recommendation { get; set; } = new();
    }

    public class ApplicantScoreItemResponse
    {
        [JsonPropertyName("resume_submission_id")]
        public Guid ResumeSubmissionId { get; set; }

        [JsonPropertyName("jobseeker_user_id")]
        public Guid? JobSeekerUserId { get; set; }

        [JsonPropertyName("applicant_name")]
        public string ApplicantName { get; set; } = "Unknown Applicant";

        [JsonPropertyName("applicant_email")]
        public string ApplicantEmail { get; set; } = "-";

        [JsonPropertyName("job_id")]
        public Guid JobId { get; set; }

        [JsonPropertyName("job_title")]
        public string JobTitle { get; set; } = string.Empty;

        [JsonPropertyName("score")]
        public int Score { get; set; }

        [JsonPropertyName("submission_status")]
        public string SubmissionStatus { get; set; } = "Pending";

        [JsonPropertyName("jobseeker_stage")]
        public string JobseekerStage { get; set; } = "Applied";

        [JsonPropertyName("created_at_utc")]
        public DateTime CreatedAtUtc { get; set; }
    }

    public sealed class ApplicantDetailResponse : ApplicantScoreItemResponse
    {
        [JsonPropertyName("parsed_resume_json")]
        public JsonElement? ParsedResumeJson { get; set; }

        [JsonPropertyName("candidate_explanation")]
        public CandidateExplanationResponse? CandidateExplanation { get; set; }
    }

    public sealed class ApplicantScoreJobFilterResponse
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("department")]
        public string Department { get; set; } = "Unassigned";

        [JsonPropertyName("all_applicants")]
        public int AllApplicants { get; set; }

        [JsonPropertyName("recommended")]
        public int Recommended { get; set; }

        [JsonPropertyName("shortlisted")]
        public int Shortlisted { get; set; }

        [JsonPropertyName("interview")]
        public int Interview { get; set; }

        [JsonPropertyName("offer")]
        public int Offer { get; set; }

        [JsonPropertyName("hire")]
        public int Hire { get; set; }
    }

    public sealed class ApplicantScoreCountsResponse
    {
        [JsonPropertyName("all_applicants")]
        public int AllApplicants { get; set; }

        [JsonPropertyName("recommended")]
        public int Recommended { get; set; }

        [JsonPropertyName("shortlisted")]
        public int Shortlisted { get; set; }

        [JsonPropertyName("interview")]
        public int Interview { get; set; }

        [JsonPropertyName("offer")]
        public int Offer { get; set; }

        [JsonPropertyName("hire")]
        public int Hire { get; set; }
    }

    public sealed class RecommendationSettingsResponse
    {
        [JsonPropertyName("top_percent")]
        public int TopPercent { get; set; }
    }

    public sealed class BulkUpdateApplicantStageResultItemResponse
    {
        [JsonPropertyName("submission_id")]
        public Guid SubmissionId { get; set; }

        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("previous_stage")]
        public string? PreviousStage { get; set; }

        [JsonPropertyName("new_status")]
        public string? NewStatus { get; set; }

        [JsonPropertyName("candidate")]
        public ApplicantScoreItemResponse? Candidate { get; set; }
    }

    public sealed class BulkUpdateApplicantStageResponse
    {
        [JsonPropertyName("action")]
        public string Action { get; set; } = string.Empty;

        [JsonPropertyName("requested_count")]
        public int RequestedCount { get; set; }

        [JsonPropertyName("processed_count")]
        public int ProcessedCount { get; set; }

        [JsonPropertyName("success_count")]
        public int SuccessCount { get; set; }

        [JsonPropertyName("failure_count")]
        public int FailureCount { get; set; }

        [JsonPropertyName("results")]
        public IReadOnlyList<BulkUpdateApplicantStageResultItemResponse> Results { get; set; } = [];

        [JsonPropertyName("counts")]
        public ApplicantScoreCountsResponse? Counts { get; set; }
    }

    public sealed class UpdateApplicantStageRequest
    {
        [JsonPropertyName("action")]
        public string? Action { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }
    }

    public sealed class BulkUpdateApplicantStageRequest
    {
        [JsonPropertyName("submission_ids")]
        public IReadOnlyList<Guid> SubmissionIds { get; set; } = [];

        [JsonPropertyName("action")]
        public string? Action { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }
    }
}
