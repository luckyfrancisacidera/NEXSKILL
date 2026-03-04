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

    public async Task UpdateAsync(JobEntity job, CancellationToken ct = default)
    {
        dbContext.Jobs.Update(job);
        await dbContext.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(JobEntity job, CancellationToken ct = default)
    {
        dbContext.Jobs.Remove(job);
        await dbContext.SaveChangesAsync(ct);
    }

    public Task<JobEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => dbContext.Jobs.FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<JobEntity?> GetByIdForRecruiterAsync(Guid id, Guid recruiterId, CancellationToken ct = default)
      => dbContext.Jobs.FirstOrDefaultAsync(x => x.Id == id && x.RecruiterId == recruiterId, ct);


    public IQueryable<JobEntity> Query() => dbContext.Jobs.AsQueryable();
}
