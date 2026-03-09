using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Models;

public sealed class CandidateExplanationPayloadData
{
    public required ResumeSubmissionEntity Submission { get; init; }
    public required JobEntity Job { get; init; }
    public required ResumeScoreEntity Score { get; init; }
}
