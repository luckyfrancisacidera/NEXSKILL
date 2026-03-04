﻿using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Recruiter.Response
{
    public sealed class ApplicantScoresResponse
    {
        [JsonPropertyName("items")]
        public IReadOnlyList<ApplicantScoreItemResponse> Items { get; set; } = [];

        [JsonPropertyName("jobs")]
        public IReadOnlyList<ApplicantScoreJobFilterResponse> Jobs { get; set; } = [];

        [JsonPropertyName("counts")]
        public ApplicantScoreCountsResponse Counts { get; set; } = new();

        [JsonPropertyName("recommendation")]
        public RecommendationSettingsResponse Recommendation { get; set; } = new();
    }

    public sealed class ApplicantScoreItemResponse
    {
        [JsonPropertyName("resume_submission_id")]
        public Guid ResumeSubmissionId { get; set; }

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

    public sealed class ApplicantScoreJobFilterResponse
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;
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

    public sealed class UpdateApplicantStageRequest
    {
        [JsonPropertyName("status")]
        public string Status { get; set; } = "Pending";
    }
}