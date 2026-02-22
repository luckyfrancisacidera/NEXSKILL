using Microsoft.EntityFrameworkCore;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Persistence.Repositories;

public sealed class ResumeSubmissionRepository(SkillSenseDbContext dbContext) : IResumeSubmissionRepository
{
    public async Task AddAsync(ResumeSubmissionEntity submission, CancellationToken ct = default)
    {
        dbContext.ResumeSubmissions.Add(submission);
        await dbContext.SaveChangesAsync(ct);
    }

    public Task<ResumeSubmissionEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => dbContext.ResumeSubmissions.FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<ResumeSubmissionEntity?> GetNextPendingAsync(CancellationToken ct = default)
        => dbContext.ResumeSubmissions
            .OrderBy(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync(x => x.Status == ResumeSubmissionStatus.Pending, ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => dbContext.SaveChangesAsync(ct);
}
