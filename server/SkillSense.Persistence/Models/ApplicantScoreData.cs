namespace SkillSense.Persistence.Models;

public sealed class ApplicantScoreData
{
    public Guid ResumeSubmissionId { get; init; }
    public string? ApplicantName { get; init; }
    public string? ApplicantEmail { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public Guid JobId { get; init; }
    public string JobTitle { get; init; } = string.Empty;
    public decimal Score { get; init; }
}

public sealed class JobFilterData
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
}
