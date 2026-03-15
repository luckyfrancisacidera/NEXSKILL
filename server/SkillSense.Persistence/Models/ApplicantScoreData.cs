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
}

public sealed class JobFilterData
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Department { get; init; } = "Unassigned";
}
