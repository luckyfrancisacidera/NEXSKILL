using System.Text.Json;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services;

public sealed class ResumeReadService(IResumeEmbeddingRepository resumeEmbeddingRepository) : IResumeReadService
{
    public async Task<ResumeEmbeddingSummaryResponse> GetEmbeddingSummaryAsync(Guid submissionId, CancellationToken ct = default)
    {
        var embeddings = await resumeEmbeddingRepository.GetBySubmissionIdAsync(submissionId, ct);
        return new ResumeEmbeddingSummaryResponse
        {
            ResumeSubmissionId = submissionId,
            Sections = embeddings.Select(x => new EmbeddingSectionSummary
            {
                SectionType = x.SectionType,
                SubSectionKey = x.SubSectionKey,
                VectorLength = JsonSerializer.Deserialize<List<float>>(x.EmbeddingJson)?.Count ?? 0
            }).ToList()
        };
    }
}
