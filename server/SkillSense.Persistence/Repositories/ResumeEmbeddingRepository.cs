using Microsoft.EntityFrameworkCore;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Persistence.Repositories;

public sealed class ResumeEmbeddingRepository(SkillSenseDbContext dbContext) : IResumeEmbeddingRepository
{
    public async Task AddRangeAsync(IEnumerable<ResumeEmbeddingEntity> embeddings, CancellationToken ct = default)
    {
        dbContext.ResumeEmbeddings.AddRange(embeddings);
        await dbContext.SaveChangesAsync(ct);
    }

    public Task<List<ResumeEmbeddingEntity>> GetBySubmissionIdAsync(Guid submissionId, CancellationToken ct = default)
        => dbContext.ResumeEmbeddings
            .Where(x => x.ResumeSubmissionId == submissionId)
            .OrderBy(x => x.SectionType)
            .ThenBy(x => x.SubSectionKey)
            .ToListAsync(ct);
}
