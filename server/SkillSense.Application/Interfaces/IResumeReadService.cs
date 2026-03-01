using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces;

public interface IResumeReadService
{
    Task<ResumeEmbeddingSummaryResponse> GetEmbeddingSummaryAsync(Guid submissionId, CancellationToken ct = default);
}
