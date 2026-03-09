using SkillSense.Domain.Entities;
using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Interfaces;

/// <summary>
/// Provides persistence operations for recruiter-facing candidate explanation records.
/// </summary>
public interface ICandidateExplanationRepository
{
    /// <summary>
    /// Returns the persisted explanation record for a submission when one exists.
    /// </summary>
    Task<CandidateExplanationEntity?> GetBySubmissionIdAsync(Guid submissionId, CancellationToken ct = default);

    /// <summary>
    /// Returns the joined submission, job, and score payload required to generate an explanation.
    /// </summary>
    Task<CandidateExplanationPayloadData?> GetExplanationPayloadAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default);

    /// <summary>
    /// Returns the succeeded explanation record for a submission.
    /// </summary>
    Task<CandidateExplanationEntity?> GetSucceededExplanationAsync(Guid submissionId, CancellationToken ct = default);

    /// <summary>
    /// Persists a newly created candidate explanation entity.
    /// </summary>
    Task AddAsync(CandidateExplanationEntity entity, CancellationToken ct = default);

    /// <summary>
    /// Commits pending explanation changes.
    /// </summary>
    Task SaveChangesAsync(CancellationToken ct = default);
}
