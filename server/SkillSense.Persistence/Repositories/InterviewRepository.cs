using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Repositories;

public sealed class InterviewRepository(
    SkillSenseDbContext dbContext,
    ILogger<InterviewRepository> logger) : IInterviewRepository
{
    private static readonly InterviewStatus[] ConflictStatuses =
    [
        InterviewStatus.Pending,
        InterviewStatus.Accepted,
        InterviewStatus.RescheduleRequested,
        InterviewStatus.Rescheduled,
    ];

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

    public async Task<IReadOnlyList<InterviewEntity>> GetArchivedByJobSeekerAsync(Guid jobSeekerId, CancellationToken ct = default)
        => await BuildInterviewQuery()
            .AsNoTracking()
            .Where(x => x.JobSeekerId == jobSeekerId && x.IsArchived)
            .OrderByDescending(x => x.ScheduledDateTimeUtc)
            .ToListAsync(ct);

    public async Task<PagedData<InterviewEntity>> GetArchivedByJobSeekerAsync(Guid jobSeekerId, int pageNumber, int pageSize, string? search, string? status, CancellationToken ct = default)
    {
        var normalizedPageNumber = Math.Max(1, pageNumber);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 100);
        var query = BuildInterviewQuery()
            .AsNoTracking()
            .Where(x => x.JobSeekerId == jobSeekerId && x.IsArchived);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLower();
            query = query.Where(x =>
                (x.Job.Title != null && x.Job.Title.ToLower().Contains(normalizedSearch)) ||
                (x.Job.CompanyNameSnapshot != null && x.Job.CompanyNameSnapshot.ToLower().Contains(normalizedSearch)) ||
                (x.Recruiter.UserName != null && x.Recruiter.UserName.ToLower().Contains(normalizedSearch)) ||
                (x.Recruiter.Email != null && x.Recruiter.Email.ToLower().Contains(normalizedSearch)) ||
                (x.LocationOrMeetingLink != null && x.LocationOrMeetingLink.ToLower().Contains(normalizedSearch)));
        }

        var statusFilter = ResolveInterviewStatusFilter(status);
        if (statusFilter.Count > 0)
        {
            query = query.Where(x => statusFilter.Contains(x.Status));
        }

        query = query.OrderByDescending(x => x.ArchivedAtUtc ?? x.ScheduledDateTimeUtc);

        var totalCount = await query.CountAsync(ct);
        var totalPages = totalCount == 0 ? 1 : (int)Math.Ceiling(totalCount / (double)normalizedPageSize);
        var items = await query
            .Skip((normalizedPageNumber - 1) * normalizedPageSize)
            .Take(normalizedPageSize)
            .ToListAsync(ct);

        return new PagedData<InterviewEntity>
        {
            Items = items,
            PageNumber = normalizedPageNumber,
            PageSize = normalizedPageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
        };
    }

    public Task<bool> HasRecruiterConflictAsync(Guid recruiterId, DateTime rangeStartUtc, DateTime rangeEndUtc, Guid? excludeInterviewId = null, CancellationToken ct = default)
        => BuildConflictQuery(rangeStartUtc, rangeEndUtc, excludeInterviewId)
            .AnyAsync(x => x.RecruiterId == recruiterId, ct);

    public Task<bool> HasJobSeekerConflictAsync(Guid jobSeekerId, DateTime rangeStartUtc, DateTime rangeEndUtc, Guid? excludeInterviewId = null, CancellationToken ct = default)
        => BuildConflictQuery(rangeStartUtc, rangeEndUtc, excludeInterviewId)
            .AnyAsync(x => x.JobSeekerId == jobSeekerId, ct);

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

    private IQueryable<InterviewEntity> BuildConflictQuery(DateTime rangeStartUtc, DateTime rangeEndUtc, Guid? excludeInterviewId)
    {
        var query = dbContext.Interviews
            .AsNoTracking()
            .Where(x => !x.IsArchived && ConflictStatuses.Contains(x.Status))
            // Interviews currently store only a start datetime, so the system treats each interview
            // as occupying the standard 60-minute calendar slot used throughout the recruiter UI.
            .Where(x => x.ScheduledDateTimeUtc < rangeEndUtc && x.ScheduledDateTimeUtc.AddMinutes(60) > rangeStartUtc);

        if (excludeInterviewId.HasValue)
        {
            query = query.Where(x => x.Id != excludeInterviewId.Value);
        }

        return query;
    }

    private IQueryable<InterviewEntity> BuildActiveInterviewQuery()
        => BuildInterviewQuery().Where(x => !x.IsArchived);

    private static IReadOnlyCollection<InterviewStatus> ResolveInterviewStatusFilter(string? status)
    {
        var normalizedStatus = status?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(normalizedStatus))
        {
            return [];
        }

        return normalizedStatus switch
        {
            "pending" => [InterviewStatus.Pending],
            "accepted" => [InterviewStatus.Accepted],
            "declined" => [InterviewStatus.Declined],
            "reschedulerequested" or "reschedule-requested" or "reschedule requested" => [InterviewStatus.RescheduleRequested],
            "rescheduled" => [InterviewStatus.Rescheduled],
            "cancelled" or "canceled" => [InterviewStatus.Cancelled],
            "completed" => [InterviewStatus.Completed],
            _ => [],
        };
    }
}
