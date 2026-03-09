using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces;

/// <summary>
/// Exposes read-only resume embedding data for diagnostics and downstream reporting.
/// </summary>
public interface IResumeReadService
{
    /// <summary>
    /// Returns the stored embedding summary for the supplied submission identifier.
    /// </summary>
    Task<ResumeEmbeddingSummaryResponse> GetEmbeddingSummaryAsync(Guid submissionId, CancellationToken ct = default);
}
