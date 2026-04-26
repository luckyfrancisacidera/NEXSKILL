using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace SkillSense.Persistence.Repositories;

public sealed class ResumeScoreRepository(SkillSenseDbContext dbContext) : IResumeScoreRepository
{
    public async Task AddAsync(ResumeScoreEntity score, bool saveChanges = true, CancellationToken ct = default)
    {
        dbContext.ResumeScores.Add(score);
        if (saveChanges)
        {
            await dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteBySubmissionIdAsync(Guid submissionId, bool saveChanges = true, CancellationToken ct = default)
    {
        await dbContext.ResumeScores
            .Where(x => x.ResumeSubmissionId == submissionId)
            .ExecuteDeleteAsync(ct);

        if (saveChanges)
        {
            await dbContext.SaveChangesAsync(ct);
        }
    }
}
