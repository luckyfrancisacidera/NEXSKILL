using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Persistence.Repositories;

public sealed class InterviewRepository(
    SkillSenseDbContext dbContext,
    ILogger<InterviewRepository> logger) : IInterviewRepository
{
    public async Task AddAsync(InterviewEntity interview, CancellationToken ct = default)
    {
        await dbContext.Interviews.AddAsync(interview, ct);
    }

    public Task<InterviewEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => BuildInterviewQuery().FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<InterviewEntity?> GetActiveByIdAsync(Guid id, CancellationToken ct = default)
        => BuildActiveInterviewQuery().FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<InterviewEntity?> GetByIdForRecruiterAsync(Guid id, Guid recruiterId, Guid companyId, CancellationToken ct = default)
        => BuildInterviewQuery().FirstOrDefaultAsync(
            x => x.Id == id && x.RecruiterId == recruiterId && x.CompanyId == companyId,
            ct);

    public Task<InterviewEntity?> GetActiveByIdForRecruiterAsync(Guid id, Guid recruiterId, Guid companyId, CancellationToken ct = default)
        => BuildActiveInterviewQuery().FirstOrDefaultAsync(
            x => x.Id == id && x.RecruiterId == recruiterId && x.CompanyId == companyId,
            ct);

    public Task<InterviewEntity?> GetByIdForJobSeekerAsync(Guid id, Guid jobSeekerId, CancellationToken ct = default)
        => BuildInterviewQuery().FirstOrDefaultAsync(
            x => x.Id == id && x.JobSeekerId == jobSeekerId,
            ct);

    public Task<InterviewEntity?> GetActiveByIdForJobSeekerAsync(Guid id, Guid jobSeekerId, CancellationToken ct = default)
        => BuildActiveInterviewQuery().FirstOrDefaultAsync(
            x => x.Id == id && x.JobSeekerId == jobSeekerId,
            ct);

    public async Task<IReadOnlyList<InterviewEntity>> GetInterviewsForCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await BuildInterviewQuery()
            .AsNoTracking()
            .Where(x => x.CompanyId == companyId && !x.IsArchived)
            .OrderByDescending(x => x.ScheduledDateTimeUtc)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<InterviewEntity>> GetByRecruiterAsync(Guid recruiterId, CancellationToken ct = default)
        => await BuildInterviewQuery()
            .AsNoTracking()
            .Where(x => x.RecruiterId == recruiterId && !x.IsArchived)
            .OrderByDescending(x => x.ScheduledDateTimeUtc)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<InterviewEntity>> GetByJobSeekerAsync(Guid jobSeekerId, CancellationToken ct = default)
        => await BuildInterviewQuery()
            .AsNoTracking()
            .Where(x => x.JobSeekerId == jobSeekerId && !x.IsArchived)
            .OrderByDescending(x => x.ScheduledDateTimeUtc)
            .ToListAsync(ct);

    public async Task AddRescheduleRequestAsync(InterviewRescheduleRequestEntity request, CancellationToken ct = default)
    {
        await dbContext.InterviewRescheduleRequests.AddAsync(request, ct);
    }

    public async Task SaveChangesAsync(CancellationToken ct = default)
    {
        try
        {
            await dbContext.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(
                ex,
                "Interview persistence failed. Inner exception: {InnerMessage}. Tracked entries: {Entries}",
                ex.InnerException?.Message,
                string.Join(", ", ex.Entries.Select(entry => entry.Metadata.ClrType.Name)));
            throw;
        }
    }

    private IQueryable<InterviewEntity> BuildInterviewQuery()
        => dbContext.Interviews
            .Include(x => x.Job)
            .Include(x => x.Recruiter)
            .Include(x => x.JobSeeker);

    private IQueryable<InterviewEntity> BuildActiveInterviewQuery()
        => BuildInterviewQuery().Where(x => !x.IsArchived);
}
