using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Persistence.Repositories;

public sealed class ResumeScoreRepository(SkillSenseDbContext dbContext) : IResumeScoreRepository
{
    public async Task AddAsync(ResumeScoreEntity score, CancellationToken ct = default)
    {
        dbContext.ResumeScores.Add(score);
        await dbContext.SaveChangesAsync(ct);
    }
}
