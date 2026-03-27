using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Models;

public sealed class ApplicantScoreData
{
    public Guid ResumeSubmissionId { get; init; }
    public Guid? JobSeekerUserId { get; init; }
    public string? ApplicantName { get; init; }
    public string? ApplicantEmail { get; init; }
    public string? PostalCode { get; init; }
    public string? MatchSummary { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public Guid JobId { get; init; }
    public ResumeSubmissionStatus Status { get; init; }
    public string JobTitle { get; init; } = string.Empty;
    public string JobDepartment { get; init; } = "Unassigned";
    public decimal Score { get; init; }
    public bool HasResume { get; init; }
    public string? ResumeFileName { get; init; }
    public string? OfferStatus { get; init; }
    public DateTime? OfferSentAtUtc { get; init; }
    public string? LatestInterviewStatus { get; init; }
    public DateTime? LatestInterviewScheduledDateTimeUtc { get; init; }
}

public sealed class EmployeeRecordData
{
    public Guid HireId { get; init; }
    public Guid ResumeSubmissionId { get; init; }
    public Guid CompanyId { get; init; }
    public Guid JobId { get; init; }
    public Guid? JobSeekerUserId { get; init; }
    public Guid? HiredByRecruiterId { get; init; }
    public Guid? AcceptedOfferId { get; init; }
    public string HireStatus { get; init; } = Domain.Entities.HireStatus.Active.ToString();
    public string EmployeeName { get; init; } = "Unknown Applicant";
    public string EmployeeEmail { get; init; } = "-";
    public string RecruiterName { get; init; } = "Unknown Recruiter";
    public string? RecruiterEmail { get; init; }
    public string JobTitle { get; init; } = string.Empty;
    public string Department { get; init; } = "Unassigned";
    public string? OfferTitle { get; init; }
    public string? OfferSalaryText { get; init; }
    public DateTime HireDateUtc { get; init; }
}

public sealed class JobFilterData
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Department { get; init; } = "Unassigned";
}
