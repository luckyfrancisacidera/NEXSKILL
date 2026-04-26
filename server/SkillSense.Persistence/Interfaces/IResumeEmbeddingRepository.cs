using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Interfaces;

public interface IResumeEmbeddingRepository
{
    Task AddRangeAsync(IEnumerable<ResumeEmbeddingEntity> embeddings, bool saveChanges = true, CancellationToken ct = default);
    Task DeleteBySubmissionIdAsync(Guid submissionId, bool saveChanges = true, CancellationToken ct = default);
    Task<List<ResumeEmbeddingEntity>> GetBySubmissionIdAsync(Guid submissionId, CancellationToken ct = default);
}
