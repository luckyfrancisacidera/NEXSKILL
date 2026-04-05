using System.Text.Json;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Models;

namespace SkillSense.Application.Common.Recruiter;

internal static class RecruiterApplicantProjection
{
    public static List<string> DeserializeListOrEmpty(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return [];
        }

        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }

    public static JsonElement? ParseResumeJsonElement(string? parsedResumeJson)
    {
        if (string.IsNullOrWhiteSpace(parsedResumeJson))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(parsedResumeJson);
            return document.RootElement.Clone();
        }
        catch (JsonException)
        {
            return null;
        }
    }

    public static string ResolveJobseekerStage(ResumeSubmissionStatus status)
        => status switch
        {
            ResumeSubmissionStatus.Recommended => "Applied",
            ResumeSubmissionStatus.Shortlisted => "Applied",
            ResumeSubmissionStatus.Interview => "Interview",
            ResumeSubmissionStatus.Offer => "Offer",
            ResumeSubmissionStatus.Hired => "Hired",
            ResumeSubmissionStatus.Rejected => "Rejected",
            _ => "Applied",
        };

    public static string ResolveSubmissionStatus(ResumeSubmissionStatus status, decimal score)
        => ApplicantRecommendationPolicy.ResolveRecruiterStageLabel(status, score);

    public static ApplicantScoreItemResponse ToApplicantScoreItem(ApplicantScoreData source)
    {
        var score = (int)Math.Round(source.Score);

        return new ApplicantScoreItemResponse
        {
            ResumeSubmissionId = source.ResumeSubmissionId,
            ApplicantName = string.IsNullOrWhiteSpace(source.ApplicantName) ? "Unknown Applicant" : source.ApplicantName!,
            ApplicantEmail = string.IsNullOrWhiteSpace(source.ApplicantEmail) ? "-" : source.ApplicantEmail!,
            JobId = source.JobId,
            JobTitle = source.JobTitle,
            Score = score,
            SubmissionStatus = ResolveSubmissionStatus(source.Status, source.Score),
            JobseekerStage = ResolveJobseekerStage(source.Status),
            CreatedAtUtc = source.CreatedAtUtc,
        };
    }
}
