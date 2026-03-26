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
        var query = BuildApplicationsQuery(userId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLower();
            query = query.Where(x => x.JobTitle.ToLower().Contains(normalizedSearch) || x.CompanyName.ToLower().Contains(normalizedSearch));
        }

        var statusFilter = ResolveStatusFilter(status);
        if (statusFilter.Count > 0)
        {
            query = query.Where(x => statusFilter.Contains(x.Status));
        }

        if (startDate.HasValue)
        {
            query = query.Where(x => x.CreatedAtUtc >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(x => x.CreatedAtUtc <= endDate.Value);
        }

        query = query.OrderByDescending(x => x.CreatedAtUtc);
        var totalCount = await query.CountAsync(ct);
        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return new PagedData<ApplicationListItemData>
        {
            Items = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    public Task<ApplicationListItemData?> GetApplicationDetailAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        => BuildApplicationsQuery(userId).FirstOrDefaultAsync(x => x.Id == applicationId, ct);

    public Task<ResumeSubmissionEntity?> GetApplicationEntityAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        => dbContext.ResumeSubmissions.FirstOrDefaultAsync(x => x.JobSeekerUserId == userId && x.Id == applicationId, ct);

    public Task<ResumeSubmissionEntity?> GetVisibleApplicationEntityAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        => dbContext.ResumeSubmissions.FirstOrDefaultAsync(
            x => x.JobSeekerUserId == userId && x.Id == applicationId && !x.IsHiddenFromJobSeekerHistory,
            ct);

    public Task<JobOfferEntity?> GetLatestOfferByApplicationIdAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        => dbContext.JobOffers
            .Where(offer => offer.ApplicationId == applicationId && offer.Application.JobSeekerUserId == userId)
            .OrderByDescending(offer => offer.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

    public Task SaveChangesAsync(CancellationToken ct = default) => dbContext.SaveChangesAsync(ct);

    public async Task<List<SavedJobData>> GetSavedJobsAsync(Guid userId, string? search, CancellationToken ct = default)
    {
        var query = dbContext.SavedJobs.AsNoTracking().Where(x => x.UserId == userId)
            .Join(dbContext.Jobs.AsNoTracking(), s => s.JobId, j => j.Id, (s, j) => new { s, j })
            .GroupJoin(dbContext.Companies.AsNoTracking(), item => item.j.CompanyId, company => company.Id, (item, companies) => new { item.s, item.j, companies })
            .SelectMany(item => item.companies.DefaultIfEmpty(), (item, company) => new { item.s, item.j, company })
            .Where(x => x.j.Status == JobStatus.Published);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalized = search.Trim().ToLower();
            query = query.Where(x =>
                x.j.Title.ToLower().Contains(normalized) ||
                ((x.company != null && x.company.Name != null ? x.company.Name : x.j.CompanyNameSnapshot) ?? string.Empty).ToLower().Contains(normalized));
        }

        return await query.OrderByDescending(x => x.s.CreatedAtUtc)
            .Select(x => new SavedJobData
            {
                JobId = x.j.Id,
                Title = x.j.Title,
                Company = x.company != null && !string.IsNullOrWhiteSpace(x.company.Name)
                    ? x.company.Name
                    : x.j.CompanyNameSnapshot ?? "Company",
                Location = x.j.Location,
                Description = x.j.Description,
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
            .Where(x => x.JobSeekerUserId == userId &&
                        !x.IsHiddenFromJobSeekerHistory &&
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

    private IQueryable<ApplicationListItemData> BuildApplicationsQuery(Guid userId)
        => from submission in dbContext.ResumeSubmissions.AsNoTracking()
           where submission.JobSeekerUserId == userId
              && !submission.IsHiddenFromJobSeekerHistory
           join job in dbContext.Jobs.AsNoTracking() on submission.JobId equals job.Id
           join recruiterUser in dbContext.Users.AsNoTracking() on job.RecruiterId equals recruiterUser.Id into recruiterUsers
           from recruiterUser in recruiterUsers.DefaultIfEmpty()
           join company in dbContext.Companies.AsNoTracking() on job.CompanyId equals company.Id into companies
           from company in companies.DefaultIfEmpty()
           select new ApplicationListItemData
           {
               Id = submission.Id,
               JobId = submission.JobId,
               JobTitle = job.Title,
               CompanyName = company != null && company.Name != null && company.Name != ""
                   ? company.Name
                   : (job.CompanyNameSnapshot ?? "Company"),
               RecruiterName = recruiterUser != null ? recruiterUser.UserName : null,
               RecruiterEmail = recruiterUser != null ? recruiterUser.Email : null,
               FullName = submission.FullName,
               Email = submission.Email,
               Status = submission.Status,
               CreatedAtUtc = submission.CreatedAtUtc,
               UpdatedAtUtc = submission.UpdatedAtUtc,
               OfferId = dbContext.JobOffers
                   .Where(offer => offer.ApplicationId == submission.Id)
                   .OrderByDescending(offer => offer.CreatedAtUtc)
                   .Select(offer => (Guid?)offer.Id)
                   .FirstOrDefault(),
               OfferTitle = dbContext.JobOffers
                   .Where(offer => offer.ApplicationId == submission.Id)
                   .OrderByDescending(offer => offer.CreatedAtUtc)
                   .Select(offer => offer.Title)
                   .FirstOrDefault(),
               OfferMessage = dbContext.JobOffers
                   .Where(offer => offer.ApplicationId == submission.Id)
                   .OrderByDescending(offer => offer.CreatedAtUtc)
                   .Select(offer => offer.Message)
                   .FirstOrDefault(),
               OfferSalaryText = dbContext.JobOffers
                   .Where(offer => offer.ApplicationId == submission.Id)
                   .OrderByDescending(offer => offer.CreatedAtUtc)
                   .Select(offer => offer.SalaryText)
                   .FirstOrDefault(),
               OfferEmploymentType = dbContext.JobOffers
                   .Where(offer => offer.ApplicationId == submission.Id)
                   .OrderByDescending(offer => offer.CreatedAtUtc)
                   .Select(offer => offer.EmploymentType)
                   .FirstOrDefault(),
               OfferStartDate = dbContext.JobOffers
                   .Where(offer => offer.ApplicationId == submission.Id)
                   .OrderByDescending(offer => offer.CreatedAtUtc)
                   .Select(offer => offer.StartDate)
                   .FirstOrDefault(),
               OfferExpirationDate = dbContext.JobOffers
                   .Where(offer => offer.ApplicationId == submission.Id)
                   .OrderByDescending(offer => offer.CreatedAtUtc)
                   .Select(offer => offer.ExpirationDate)
                   .FirstOrDefault(),
               OfferStatus = dbContext.JobOffers
                   .Where(offer => offer.ApplicationId == submission.Id)
                   .OrderByDescending(offer => offer.CreatedAtUtc)
                   .Select(offer => (JobOfferStatus?)offer.Status)
                   .FirstOrDefault(),
               OfferSentAtUtc = dbContext.JobOffers
                   .Where(offer => offer.ApplicationId == submission.Id)
                   .OrderByDescending(offer => offer.CreatedAtUtc)
                   .Select(offer => (DateTime?)offer.SentAtUtc)
                   .FirstOrDefault(),
               OfferRespondedAtUtc = dbContext.JobOffers
                   .Where(offer => offer.ApplicationId == submission.Id)
                   .OrderByDescending(offer => offer.CreatedAtUtc)
                   .Select(offer => offer.RespondedAtUtc)
                   .FirstOrDefault(),
           };

    private static IReadOnlyCollection<ResumeSubmissionStatus> ResolveStatusFilter(string? status)
    {
        var normalizedStatus = status?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(normalizedStatus))
        {
            return [];
        }

        return normalizedStatus switch
        {
            "applied" or "submitted" =>
            [
                ResumeSubmissionStatus.Pending,
                ResumeSubmissionStatus.Processing
            ],
            "recommended" or "under review" or "under-review" or "review" =>
            [
                ResumeSubmissionStatus.Completed,
            ],
            "shortlist" or "shortlisted" => [ResumeSubmissionStatus.Shortlisted],
            "interview" => [ResumeSubmissionStatus.Interview],
            "offer" => [ResumeSubmissionStatus.Offer],
            "hire" or "hired" => [ResumeSubmissionStatus.Hire],
            "rejected" => [ResumeSubmissionStatus.Rejected],
            "withdrawn" or "failed" => [ResumeSubmissionStatus.Failed],
            _ => []
        };
    }
}
