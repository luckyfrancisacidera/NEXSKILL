using Microsoft.EntityFrameworkCore;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Repositories;

public sealed class RecruiterRepository(SkillSenseDbContext dbContext) : IRecruiterRepository
{
    public Task<RecruiterProfileEntity?> GetProfileByUserIdAsync(Guid recruiterId, CancellationToken ct = default)
        => dbContext.RecruiterProfiles.FirstOrDefaultAsync(x => x.UserId == recruiterId, ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => dbContext.SaveChangesAsync(ct);

    public async Task<PagedData<JobEntity>> GetRecruiterJobsAsync(Guid recruiterId, int pageNumber, int pageSize, string? search, string? sortBy, string? sortDir, CancellationToken ct = default)
    {
        var query = dbContext.Jobs.AsNoTracking().Where(x => x.RecruiterId == recruiterId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLower();
            query = query.Where(x => x.Title.ToLower().Contains(normalizedSearch) || x.Description.ToLower().Contains(normalizedSearch));
        }

        query = (sortBy?.ToLowerInvariant(), sortDir?.ToLowerInvariant()) switch
        {
            ("title", "asc") => query.OrderBy(x => x.Title),
            ("title", _) => query.OrderByDescending(x => x.Title),
            ("createdat", "asc") => query.OrderBy(x => x.CreatedAtUtc),
            _ => query.OrderByDescending(x => x.CreatedAtUtc)
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

    public Task<List<JobEntity>> GetRecruiterJobsCreatedSinceAsync(Guid recruiterId, DateTime startDateUtc, CancellationToken ct = default)
        => dbContext.Jobs
            .AsNoTracking()
            .Where(x => x.RecruiterId == recruiterId && x.CreatedAtUtc >= startDateUtc)
            .ToListAsync(ct);

    public Task<List<ResumeSubmissionEntity>> GetSubmissionsForJobsCreatedSinceAsync(IEnumerable<Guid> jobIds, DateTime startDateUtc, CancellationToken ct = default)
    {
        var jobIdSet = jobIds.ToHashSet();
        if (jobIdSet.Count == 0)
        {
            return Task.FromResult(new List<ResumeSubmissionEntity>());
        }

        return dbContext.ResumeSubmissions
            .AsNoTracking()
            .Where(x => x.CreatedAtUtc >= startDateUtc && jobIdSet.Contains(x.JobId))
            .ToListAsync(ct);
    }

    public Task<List<ApplicantScoreData>> GetApplicantScoreDataAsync(Guid recruiterId, Guid? jobId, string? search, CancellationToken ct = default)
    {
        var query = dbContext.ResumeSubmissions
            .AsNoTracking()
            .Join(dbContext.Jobs.AsNoTracking(), submission => submission.JobId, job => job.Id, (submission, job) => new { submission, job })
            .Join(dbContext.ResumeScores.AsNoTracking(), x => x.submission.Id, score => score.ResumeSubmissionId, (x, score) => new
            {
                x.job.RecruiterId,
                Data = new ApplicantScoreData
                {
                    ResumeSubmissionId = x.submission.Id,
                    ApplicantName = x.submission.FullName,
                    ApplicantEmail = x.submission.Email,
                    CreatedAtUtc = x.submission.CreatedAtUtc,
                    JobId = x.submission.JobId,
                    JobTitle = x.job.Title,
                    Score = (int)score.FinalWeightedScore
                }
            })
            .Where(x => x.RecruiterId == recruiterId && (!jobId.HasValue || x.Data.JobId == jobId.Value))
            .Select(x => x.Data);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLowerInvariant();
            query = query.Where(x =>
                (x.ApplicantName ?? string.Empty).ToLower().Contains(normalizedSearch) ||
                (x.ApplicantEmail ?? string.Empty).ToLower().Contains(normalizedSearch) ||
                x.JobTitle.ToLower().Contains(normalizedSearch));
        }

        return query.OrderByDescending(x => x.CreatedAtUtc).ToListAsync(ct);
    }

    public Task<List<JobFilterData>> GetJobFiltersAsync(Guid recruiterId, CancellationToken ct = default)
        => dbContext.Jobs
            .AsNoTracking()
            .Where(x => x.RecruiterId == recruiterId)
            .OrderBy(x => x.Title)
            .Select(x => new JobFilterData
            {
                Id = x.Id,
                Title = x.Title,
            })
            .ToListAsync(ct);
}
