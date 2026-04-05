using SkillSense.Domain.Entities;

namespace SkillSense.Application.Common.Recruiter;

internal static class ApplicantRecommendationPolicy
{
    // Backend-owned ATS rule: candidates at or above this score enter Recommended automatically.
    public const int RecommendationThresholdScore = 50;

    public static bool MeetsRecommendationThreshold(decimal score)
        => score >= RecommendationThresholdScore;

    public static bool MeetsRecommendationThreshold(float score)
        => score >= RecommendationThresholdScore;

    public static ResumeSubmissionStatus ResolveInitialStage(ResumeSubmissionStatus currentStatus, decimal score)
    {
        if (currentStatus == ResumeSubmissionStatus.Recommended)
        {
            return ResumeSubmissionStatus.Recommended;
        }

        if (currentStatus != ResumeSubmissionStatus.Completed)
        {
            return currentStatus;
        }

        return MeetsRecommendationThreshold(score)
            ? ResumeSubmissionStatus.Recommended
            : ResumeSubmissionStatus.Completed;
    }

    public static ResumeSubmissionStatus ResolveInitialStage(ResumeSubmissionStatus currentStatus, float score)
        => ResolveInitialStage(currentStatus, (decimal)score);

    public static string ResolveRecruiterStageLabel(ResumeSubmissionStatus status, decimal score)
        => ResolveInitialStage(status, score) switch
        {
            ResumeSubmissionStatus.Recommended => "Recommended",
            ResumeSubmissionStatus.Shortlisted => "Shortlisted",
            ResumeSubmissionStatus.Interview => "Interview",
            ResumeSubmissionStatus.Offer => "Offer",
            ResumeSubmissionStatus.Hired => "Hired",
            ResumeSubmissionStatus.Rejected => "Rejected",
            _ => "Applied",
        };
}
