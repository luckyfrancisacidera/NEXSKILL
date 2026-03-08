namespace SkillSense.Application.Interfaces.Recruiter;

public interface ICandidateExplanationService
{
    Task GenerateForShortlistedAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default);
}
