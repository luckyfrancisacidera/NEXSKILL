namespace SkillSense.Application.Interfaces.Recruiter;

/// <summary>
/// Generates recruiter-facing candidate explanations for shortlisted applicants.
/// </summary>
public interface ICandidateExplanationService
{
    /// <summary>
    /// Generates or refreshes the explanation for a shortlisted submission.
    /// </summary>
    Task GenerateForShortlistedAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default);
}
