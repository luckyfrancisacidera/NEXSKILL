using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Domain.Entities;

namespace SkillSense.Application.Interfaces;

public interface IResumeScoringOrchestrator
{
    Task<(List<ResumeEmbeddingEntity> Embeddings, AtsScoreResponse Score)> BuildAsync(
        Guid submissionId,
        ResumeParseResult resume,
        JobDescriptionInput jobDescription,
        CancellationToken ct);
}
