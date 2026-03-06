using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Domain.Entities;

namespace SkillSense.Application.Interfaces;

public interface IResumeScoringOrchestrator
{
    Task<(List<ResumeEmbeddingEntity> Embeddings, FinalMatchScore Score)> BuildAsync(
        Guid submissionId,
        ParsedResume resume,
        NormalizedJobDescription jobDescription,
        CancellationToken ct);
}
