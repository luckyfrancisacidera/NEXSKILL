using Microsoft.EntityFrameworkCore;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Persistence.Repositories;

public sealed class InterviewRepository(SkillSenseDbContext dbContext) : IInterviewRepository
{
    public async Task AddAsync(InterviewEntity interview, CancellationToken ct = default)
    {
        await dbContext.Interviews.AddAsync(interview, ct);
    }

    public Task<InterviewEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => BuildInterviewQuery().FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<InterviewEntity?> GetByIdForRecruiterAsync(Guid id, Guid recruiterId, Guid companyId, CancellationToken ct = default)
        => BuildInterviewQuery().FirstOrDefaultAsync(
            x => x.Id == id && x.RecruiterId == recruiterId && x.CompanyId == companyId,
            ct);

    public Task<InterviewEntity?> GetByIdForJobSeekerAsync(Guid id, Guid jobSeekerId, CancellationToken ct = default)
        => BuildInterviewQuery().FirstOrDefaultAsync(
            x => x.Id == id && x.JobSeekerId == jobSeekerId,
            ct);

    public async Task<IReadOnlyList<InterviewEntity>> GetInterviewsForCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await dbContext.Interviews
            .AsNoTracking()
            .Where(x => x.CompanyId == companyId)
            .OrderByDescending(x => x.ScheduledDateTimeUtc)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<InterviewEntity>> GetByRecruiterAsync(Guid recruiterId, CancellationToken ct = default)
        => await dbContext.Interviews
            .AsNoTracking()
            .Where(x => x.RecruiterId == recruiterId)
            .OrderByDescending(x => x.ScheduledDateTimeUtc)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<InterviewEntity>> GetByJobSeekerAsync(Guid jobSeekerId, CancellationToken ct = default)
        => await dbContext.Interviews
            .AsNoTracking()
            .Where(x => x.JobSeekerId == jobSeekerId)
            .OrderByDescending(x => x.ScheduledDateTimeUtc)
            .ToListAsync(ct);

    public async Task AddRescheduleRequestAsync(InterviewRescheduleRequestEntity request, CancellationToken ct = default)
    {
        await dbContext.InterviewRescheduleRequests.AddAsync(request, ct);
    }

    public Task SaveChangesAsync(CancellationToken ct = default)
        => dbContext.SaveChangesAsync(ct);

    private IQueryable<InterviewEntity> BuildInterviewQuery()
        => dbContext.Interviews
            .Include(x => x.Job)
            .Include(x => x.Recruiter)
            .Include(x => x.JobSeeker);
}
