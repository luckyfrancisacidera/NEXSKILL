using SkillSense.Application.Exceptions;
using SkillSense.Domain.Entities;

namespace SkillSense.Application.Common.Recruiter;

internal static class ApplicantStageTransitionPolicy
{
    private static readonly IReadOnlyDictionary<string, IReadOnlySet<ResumeSubmissionStatus>> AllowedTransitionsByAction =
        new Dictionary<string, IReadOnlySet<ResumeSubmissionStatus>>(StringComparer.OrdinalIgnoreCase)
        {
            ["shortlist"] = new HashSet<ResumeSubmissionStatus>
            {
                ResumeSubmissionStatus.Completed,
                ResumeSubmissionStatus.Shortlisted,
                ResumeSubmissionStatus.Interview,
            },
            ["set-interview"] = new HashSet<ResumeSubmissionStatus>
            {
                ResumeSubmissionStatus.Shortlisted,
                ResumeSubmissionStatus.Interview,
            },
            ["offer"] = new HashSet<ResumeSubmissionStatus>
            {
                ResumeSubmissionStatus.Interview,
                ResumeSubmissionStatus.Offer,
            },
            ["hire"] = new HashSet<ResumeSubmissionStatus>
            {
                ResumeSubmissionStatus.Offer,
                ResumeSubmissionStatus.Hire,
            },
            ["reject"] = new HashSet<ResumeSubmissionStatus>
            {
                ResumeSubmissionStatus.Completed,
                ResumeSubmissionStatus.Shortlisted,
                ResumeSubmissionStatus.Interview,
                ResumeSubmissionStatus.Offer,
                ResumeSubmissionStatus.Hire,
            },
            ["remove-shortlist"] = new HashSet<ResumeSubmissionStatus>
            {
                ResumeSubmissionStatus.Shortlisted,
                ResumeSubmissionStatus.Interview,
            },
        };

    public static string ResolveAction(string? requestedAction, string? requestedStatus)
    {
        if (!string.IsNullOrWhiteSpace(requestedAction))
        {
            return requestedAction.Trim().ToLowerInvariant();
        }

        if (string.IsNullOrWhiteSpace(requestedStatus))
        {
            throw new ArgumentException("Action is required.");
        }

        if (!Enum.TryParse<ResumeSubmissionStatus>(requestedStatus, true, out var parsedStatus))
        {
            throw new ArgumentException("Invalid applicant status.");
        }

        return parsedStatus switch
        {
            ResumeSubmissionStatus.Shortlisted => "shortlist",
            ResumeSubmissionStatus.Interview => "set-interview",
            ResumeSubmissionStatus.Offer => "offer",
            ResumeSubmissionStatus.Hire => "hire",
            ResumeSubmissionStatus.Rejected => "reject",
            _ => throw new ArgumentException("Invalid applicant status.")
        };
    }

    public static ResumeSubmissionStatus ResolveNextStatus(ResumeSubmissionStatus currentStatus, string action)
    {
        if (!AllowedTransitionsByAction.TryGetValue(action, out var allowedStatuses) || !allowedStatuses.Contains(currentStatus))
        {
            throw new InvalidStageTransitionException(action, currentStatus.ToString());
        }

        return action switch
        {
            "shortlist" => ResumeSubmissionStatus.Shortlisted,
            "set-interview" => ResumeSubmissionStatus.Interview,
            "offer" => ResumeSubmissionStatus.Offer,
            "hire" => ResumeSubmissionStatus.Hire,
            "reject" => ResumeSubmissionStatus.Rejected,
            "remove-shortlist" when currentStatus == ResumeSubmissionStatus.Shortlisted => ResumeSubmissionStatus.Completed,
            "remove-shortlist" when currentStatus == ResumeSubmissionStatus.Interview => ResumeSubmissionStatus.Interview,
            _ => throw new InvalidStageTransitionException(action, currentStatus.ToString()),
        };
    }
}
