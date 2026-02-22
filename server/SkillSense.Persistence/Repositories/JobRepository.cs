using Microsoft.EntityFrameworkCore;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Persistence.Repositories;

public sealed class JobRepository(SkillSenseDbContext dbContext) : IJobRepository
{
    public async Task AddAsync(JobEntity job, CancellationToken ct = default)
    {
        dbContext.Jobs.Add(job);
        await dbContext.SaveChangesAsync(ct);
    }

    public Task<JobEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => dbContext.Jobs.FirstOrDefaultAsync(x => x.Id == id, ct);
}
