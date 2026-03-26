using SkillSense.Application.Exceptions;
using SkillSense.Domain.Entities;

namespace SkillSense.Application.Common.Recruiter;

internal static class ApplicantStageTransitionPolicy
{
    private static readonly IReadOnlySet<ResumeSubmissionStatus> ActiveStatuses = new HashSet<ResumeSubmissionStatus>
    {
        ResumeSubmissionStatus.Completed,
        ResumeSubmissionStatus.Shortlisted,
        ResumeSubmissionStatus.Interview,
        ResumeSubmissionStatus.Offer,
        ResumeSubmissionStatus.Hire,
        ResumeSubmissionStatus.Rejected,
    };

    private static readonly IReadOnlyDictionary<string, IReadOnlySet<ResumeSubmissionStatus>> AllowedTransitionsByAction =
        new Dictionary<string, IReadOnlySet<ResumeSubmissionStatus>>(StringComparer.OrdinalIgnoreCase)
        {
            // Allow recruiters to move candidates between any active stages, including reviving rejected applicants.
            ["shortlist"] = ActiveStatuses,
            ["set-interview"] = ActiveStatuses,
            ["offer"] = new HashSet<ResumeSubmissionStatus>
            {
                ResumeSubmissionStatus.Interview,
            },
            ["hire"] = new HashSet<ResumeSubmissionStatus>
            {
                ResumeSubmissionStatus.Offer,
            },
            ["reject"] = ActiveStatuses,
            ["remove-shortlist"] = new HashSet<ResumeSubmissionStatus>
            {
                ResumeSubmissionStatus.Shortlisted,
                ResumeSubmissionStatus.Interview,
                ResumeSubmissionStatus.Rejected,
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
            "remove-shortlist" when currentStatus == ResumeSubmissionStatus.Rejected => ResumeSubmissionStatus.Completed,
            _ => throw new InvalidStageTransitionException(action, currentStatus.ToString()),
        };
    }
}
