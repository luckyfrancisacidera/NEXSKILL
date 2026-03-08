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

    public async Task<PagedData<ApplicationListItemData>> GetApplicationsByUserAsync(Guid userId, int pageNumber, int pageSize, string? search, string? status, DateTime? startDate, DateTime? endDate, CancellationToken ct = default)
    {
        var query = dbContext.ResumeSubmissions.AsNoTracking().Where(x => x.ApplicantUserId == userId)
            .Join(dbContext.Jobs.AsNoTracking(), s => s.JobId, j => j.Id, (s, j) => new { s, j });

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLower();
            query = query.Where(x => x.j.Title.ToLower().Contains(normalizedSearch) || (x.j.CompanyNameSnapshot ?? string.Empty).ToLower().Contains(normalizedSearch));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            var normalizedStatus = status.Trim().ToLowerInvariant();
            var statusFilter = normalizedStatus switch
            {
                "applied" or "submitted" or "recommended" or "shortlist" or "shortlisted" => new[]
                {
                    ResumeSubmissionStatus.Pending,
                    ResumeSubmissionStatus.Processing,
                    ResumeSubmissionStatus.Completed,
                    ResumeSubmissionStatus.Shortlisted
                },
                "interview" => new[] { ResumeSubmissionStatus.Interview },
                "hire" or "hired" or "offer" => new[] { ResumeSubmissionStatus.Offer, ResumeSubmissionStatus.Hire },
                "rejected" => new[] { ResumeSubmissionStatus.Rejected },
                "withdrawn" or "failed" => new[] { ResumeSubmissionStatus.Failed },
                _ => []
            };

            if (statusFilter.Length > 0)
            {
                query = query.Where(x => statusFilter.Contains(x.s.Status));
            }
        }

        if (startDate.HasValue) query = query.Where(x => x.s.CreatedAtUtc >= startDate.Value);
        if (endDate.HasValue) query = query.Where(x => x.s.CreatedAtUtc <= endDate.Value);

        query = query.OrderByDescending(x => x.s.CreatedAtUtc);
        var totalCount = await query.CountAsync(ct);

        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize)
            .Select(x => new ApplicationListItemData
            {
                Id = x.s.Id,
                JobId = x.s.JobId,
                JobTitle = x.j.Title,
                Company = x.j.CompanyNameSnapshot ?? "Company",
                FullName = x.s.FullName,
                Email = x.s.Email,
                Status = x.s.Status.ToString(),
                CreatedAtUtc = x.s.CreatedAtUtc
            }).ToListAsync(ct);

        return new PagedData<ApplicationListItemData>
        {
            Items = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    public async Task<ApplicationListItemData?> GetApplicationDetailAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        => await dbContext.ResumeSubmissions.AsNoTracking()
            .Where(x => x.ApplicantUserId == userId && x.Id == applicationId)
            .Join(dbContext.Jobs.AsNoTracking(), s => s.JobId, j => j.Id, (s, j) => new ApplicationListItemData
            {
                Id = s.Id,
                JobId = s.JobId,
                JobTitle = j.Title,
                Company = j.CompanyNameSnapshot ?? "Company",
                FullName = s.FullName,
                Email = s.Email,
                Status = s.Status.ToString(),
                CreatedAtUtc = s.CreatedAtUtc
            }).FirstOrDefaultAsync(ct);

    public Task<ResumeSubmissionEntity?> GetApplicationEntityAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        => dbContext.ResumeSubmissions.FirstOrDefaultAsync(x => x.ApplicantUserId == userId && x.Id == applicationId, ct);

    public Task SaveChangesAsync(CancellationToken ct = default) => dbContext.SaveChangesAsync(ct);

    public async Task<List<SavedJobData>> GetSavedJobsAsync(Guid userId, string? search, CancellationToken ct = default)
    {
        var query = dbContext.SavedJobs.AsNoTracking().Where(x => x.UserId == userId)
            .Join(dbContext.Jobs.AsNoTracking(), s => s.JobId, j => j.Id, (s, j) => new { s, j })
            .Where(x => x.j.Status == JobStatus.Published);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalized = search.Trim().ToLower();
            query = query.Where(x => x.j.Title.ToLower().Contains(normalized) || (x.j.CompanyNameSnapshot ?? string.Empty).ToLower().Contains(normalized));
        }

        return await query.OrderByDescending(x => x.s.CreatedAtUtc)
            .Select(x => new SavedJobData
            {
                JobId = x.j.Id,
                Title = x.j.Title,
                Company = x.j.CompanyNameSnapshot ?? "Company",
                Location = x.j.Location,
                SalaryMin = x.j.SalaryMinPerAnnum,
                SalaryMax = x.j.SalaryMaxPerAnnum,
                Currency = x.j.Currency,
                EmploymentType = x.j.EmploymentType.ToString(),
                SavedAtUtc = x.s.CreatedAtUtc
            }).ToListAsync(ct);
    }

    public Task<bool> IsJobSavedAsync(Guid userId, Guid jobId, CancellationToken ct = default)
        => dbContext.SavedJobs.AsNoTracking().AnyAsync(x => x.UserId == userId && x.JobId == jobId, ct);

    public async Task SaveJobAsync(SavedJobEntity entity, CancellationToken ct = default)
    {
        dbContext.SavedJobs.Add(entity);
        await dbContext.SaveChangesAsync(ct);
    }

    public async Task RemoveSavedJobAsync(Guid userId, Guid jobId, CancellationToken ct = default)
    {
        var item = await dbContext.SavedJobs.FirstOrDefaultAsync(x => x.UserId == userId && x.JobId == jobId, ct);
        if (item is null) return;
        dbContext.SavedJobs.Remove(item);
        await dbContext.SaveChangesAsync(ct);
    }

    public Task<JobSeekerProfileEntity?> GetProfileAsync(Guid userId, CancellationToken ct = default)
        => dbContext.JobSeekerProfiles.FirstOrDefaultAsync(x => x.UserId == userId, ct);

    public async Task UpsertProfileAsync(JobSeekerProfileEntity profile, CancellationToken ct = default)
    {
        if (profile.Id == Guid.Empty) dbContext.JobSeekerProfiles.Add(profile);
        await dbContext.SaveChangesAsync(ct);
    }

    public async Task<List<(DateTime Date, int Count)>> GetApplicationAnalyticsAsync(
     Guid userId,
     DateTime start,
     DateTime end,
     string granularity,
     CancellationToken ct = default)
    {
        var baseQuery = dbContext.ResumeSubmissions
            .AsNoTracking()
            .Where(x => x.ApplicantUserId == userId &&
                        x.CreatedAtUtc >= start &&
                        x.CreatedAtUtc <= end);

        if (granularity == "month")
        {
            var rows = await baseQuery
                .GroupBy(x => new
                {
                    x.CreatedAtUtc.Year,
                    x.CreatedAtUtc.Month
                })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Month,
                    Count = g.Count()
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ToListAsync(ct);

            return rows
                .Select(x => (new DateTime(x.Year, x.Month, 1), x.Count))
                .ToList();
        }

        var dailyRows = await baseQuery
            .GroupBy(x => new
            {
                x.CreatedAtUtc.Year,
                x.CreatedAtUtc.Month,
                x.CreatedAtUtc.Day
            })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                g.Key.Day,
                Count = g.Count()
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ThenBy(x => x.Day)
            .ToListAsync(ct);

        return dailyRows
            .Select(x => (new DateTime(x.Year, x.Month, x.Day), x.Count))
            .ToList();
    }
}
