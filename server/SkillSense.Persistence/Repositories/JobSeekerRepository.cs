using Microsoft.EntityFrameworkCore;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Repositories;

public sealed class JobSeekerRepository(SkillSenseDbContext dbContext) : IJobSeekerRepository
{
    public async Task<PagedData<JobEntity>> GetPublishedJobsAsync(int pageNumber, int pageSize, string? search, string? sortBy, string? sortDir, CancellationToken ct = default)
    {
        var query = dbContext.Jobs.AsNoTracking().Where(x => x.Status == JobStatus.Published);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLower();
            query = query.Where(x => x.Title.ToLower().Contains(normalizedSearch) || x.Description.ToLower().Contains(normalizedSearch));
        }

        query = (sortBy?.ToLowerInvariant(), sortDir?.ToLowerInvariant()) switch
        {
            ("title", "asc") => query.OrderBy(x => x.Title),
            ("title", _) => query.OrderByDescending(x => x.Title),
            ("posteddateutc", "asc") => query.OrderBy(x => x.PostedDateUtc),
            _ => query.OrderByDescending(x => x.PostedDateUtc ?? x.CreatedAtUtc)
        };

        var totalCount = await query.CountAsync(ct);
        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return new PagedData<JobEntity>
        {
            Items = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    public Task<JobEntity?> GetPublishedJobByIdAsync(Guid id, CancellationToken ct = default)
        => dbContext.Jobs.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && x.Status == JobStatus.Published, ct);

    public async Task<PagedData<MyApplicationData>> GetApplicationsByUserAsync(Guid userId, int pageNumber, int pageSize, CancellationToken ct = default)
    {
        var query = dbContext.ResumeSubmissions
            .AsNoTracking()
            .Where(x => x.ApplicantUserId == userId)
            .OrderByDescending(x => x.CreatedAtUtc);

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new MyApplicationData
            {
                Id = x.Id,
                JobId = x.JobId,
                FullName = x.FullName,
                Email = x.Email,
                Status = x.Status.ToString(),
                CreatedAtUtc = x.CreatedAtUtc
            })
            .ToListAsync(ct);

        return new PagedData<MyApplicationData>
        {
            Items = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }
}
