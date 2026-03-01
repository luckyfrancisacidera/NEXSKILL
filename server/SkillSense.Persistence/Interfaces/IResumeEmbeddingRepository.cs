using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Interfaces;

public interface IResumeEmbeddingRepository
{
    Task AddRangeAsync(IEnumerable<ResumeEmbeddingEntity> embeddings, CancellationToken ct = default);
    Task<List<ResumeEmbeddingEntity>> GetBySubmissionIdAsync(Guid submissionId, CancellationToken ct = default);
}
