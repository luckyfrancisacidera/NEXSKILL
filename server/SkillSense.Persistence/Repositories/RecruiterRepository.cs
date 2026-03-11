using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Repositories;

public sealed class RecruiterRepository(SkillSenseDbContext dbContext) : IRecruiterRepository
{
    public Task<RecruiterProfileEntity?> GetProfileByUserIdAsync(Guid recruiterId, CancellationToken ct = default)
        => dbContext.RecruiterProfiles
            .Include(x => x.Company)
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.UserId == recruiterId, ct);

    public Task<RecruiterProfileEntity?> GetProfileByUserAndProfileIdAsync(Guid recruiterId, Guid recruiterProfileId, CancellationToken ct = default)
        => dbContext.RecruiterProfiles
            .Include(x => x.Company)
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.UserId == recruiterId && x.Id == recruiterProfileId, ct);

    public async Task<IReadOnlyList<RecruiterProfileEntity>> GetProfilesByUserIdsAsync(IReadOnlyCollection<Guid> recruiterIds, CancellationToken ct = default)
    {
        if (recruiterIds.Count == 0)
        {
            return Array.Empty<RecruiterProfileEntity>();
        }

        return await dbContext.RecruiterProfiles
            .AsNoTracking()
            .Include(x => x.Company)
            .Include(x => x.User)
            .Where(x => recruiterIds.Contains(x.UserId))
            .ToListAsync(ct);
    }

    public Task SaveChangesAsync(CancellationToken ct = default)
        => dbContext.SaveChangesAsync(ct);

    public async Task<PagedData<JobEntity>> GetRecruiterJobsAsync(Guid recruiterId, Guid companyId, int pageNumber, int pageSize, string? search, string? department, string? sortBy, string? sortDir, CancellationToken ct = default)
    {
        var query = dbContext.Jobs.AsNoTracking().Where(x => x.RecruiterId == recruiterId && x.CompanyId == companyId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLowerInvariant();
            query = query.Where(x => x.Title.ToLower().Contains(normalizedSearch) || x.Location.ToLower().Contains(normalizedSearch));
        }

        if (!string.IsNullOrWhiteSpace(department))
        {
            var normalizedDepartment = department.Trim().ToLowerInvariant();
            query = query.Where(x => x.Department != null && x.Department.ToLower() == normalizedDepartment);
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

    public Task<Dictionary<Guid, int>> GetHiredCountsByJobIdsAsync(IReadOnlyCollection<Guid> jobIds, CancellationToken ct = default)
    {
        if (jobIds.Count == 0)
        {
            return Task.FromResult(new Dictionary<Guid, int>());
        }

        return dbContext.ResumeSubmissions
            .AsNoTracking()
            .Where(x => jobIds.Contains(x.JobId) && x.Status == ResumeSubmissionStatus.Hire)
            .GroupBy(x => x.JobId)
            .Select(x => new { JobId = x.Key, Count = x.Count() })
            .ToDictionaryAsync(x => x.JobId, x => x.Count, ct);
    }

    public Task<int> GetHiredCountByJobIdAsync(Guid jobId, CancellationToken ct = default)
        => dbContext.ResumeSubmissions
            .AsNoTracking()
            .CountAsync(x => x.JobId == jobId && x.Status == ResumeSubmissionStatus.Hire, ct);

    public async Task<RecruiterDashboardFilterData> GetDashboardFilterDataAsync(Guid recruiterId, Guid companyId, CancellationToken ct = default)
    {
        var recruiterJobsBaseQuery = dbContext.Jobs.AsNoTracking().Where(j => j.RecruiterId == recruiterId && j.CompanyId == companyId);
        var departments = await recruiterJobsBaseQuery
            .Where(j => j.Department != null && j.Department != string.Empty)
            .Select(j => j.Department!)
            .Distinct()
            .OrderBy(v => v)
            .ToListAsync(ct);
        var jobRoles = await recruiterJobsBaseQuery
            .Select(j => j.Title)
            .Distinct()
            .OrderBy(v => v)
            .ToListAsync(ct);

        var rolesByDepartment = await recruiterJobsBaseQuery
            .Where(j => j.Department != null && j.Department != string.Empty)
            .Select(j => new { Department = j.Department!, j.Title })
            .Distinct()
            .ToListAsync(ct);

        var jobRolesByDepartment = rolesByDepartment
            .GroupBy(item => item.Department)
            .OrderBy(group => group.Key)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyList<string>)group
                    .Select(item => item.Title)
                    .Distinct()
                    .OrderBy(title => title)
                    .ToList());

        return new RecruiterDashboardFilterData
        {
            Departments = departments,
            JobRoles = jobRoles,
            JobRolesByDepartment = jobRolesByDepartment,
        };
    }

    public Task<List<Guid>> GetDashboardJobIdsAsync(Guid recruiterId, Guid companyId, string? department, string? jobRole, CancellationToken ct = default)
    {
        var jobsQuery = dbContext.Jobs.AsNoTracking().Where(j => j.RecruiterId == recruiterId && j.CompanyId == companyId);

        if (!string.IsNullOrWhiteSpace(department))
        {
            jobsQuery = jobsQuery.Where(j => j.Department == department);
        }

        if (!string.IsNullOrWhiteSpace(jobRole))
        {
            jobsQuery = jobsQuery.Where(j => j.Title == jobRole);
        }

        return jobsQuery.Select(j => j.Id).ToListAsync(ct);
    }

    public Task<List<ResumeSubmissionEntity>> GetDashboardApplicationsAsync(IReadOnlyCollection<Guid> jobIds, DateTime? startUtc, DateTime? endExclusiveUtc, CancellationToken ct = default)
    {
        if (jobIds.Count == 0)
        {
            return Task.FromResult(new List<ResumeSubmissionEntity>());
        }

        var query = dbContext.ResumeSubmissions.AsNoTracking().Where(s => jobIds.Contains(s.JobId));
        if (startUtc.HasValue)
        {
            query = query.Where(s => s.CreatedAtUtc >= startUtc.Value);
        }

        if (endExclusiveUtc.HasValue)
        {
            query = query.Where(s => s.CreatedAtUtc < endExclusiveUtc.Value);
        }

        return query.ToListAsync(ct);
    }

    public Task<Dictionary<Guid, (string Title, string Department)>> GetJobLookupAsync(Guid recruiterId, Guid companyId, CancellationToken ct = default)
        => dbContext.Jobs.AsNoTracking()
            .Where(j => j.RecruiterId == recruiterId && j.CompanyId == companyId)
            .Select(j => new { j.Id, j.Title, Department = j.Department ?? "Unassigned" })
            .ToDictionaryAsync(j => j.Id, j => ValueTuple.Create(j.Title, j.Department), ct);

    public Task<List<ApplicantScoreData>> GetApplicantScoreDataAsync(Guid recruiterId, Guid companyId, string? department, string? search, CancellationToken ct = default)
    {
        var query = BuildApplicantScoreQuery(recruiterId, companyId);

        if (!string.IsNullOrWhiteSpace(department))
        {
            query = query.Where(x => x.JobDepartment == department);
        }

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

    public Task<ApplicantScoreData?> GetApplicantScoreBySubmissionIdAsync(Guid recruiterId, Guid companyId, Guid submissionId, CancellationToken ct = default)
        => BuildApplicantScoreQuery(recruiterId, companyId)
            .FirstOrDefaultAsync(x => x.ResumeSubmissionId == submissionId, ct);

    public Task<List<JobFilterData>> GetJobFiltersAsync(Guid recruiterId, Guid companyId, string? department, CancellationToken ct = default)
    {
        var query = dbContext.Jobs
            .AsNoTracking()
            .Where(x => x.RecruiterId == recruiterId && x.CompanyId == companyId && x.Status == JobStatus.Published)
            .Select(x => new JobFilterData
            {
                Id = x.Id,
                Title = x.Title,
                Department = x.Department ?? "Unassigned",
            });

        if (!string.IsNullOrWhiteSpace(department))
        {
            query = query.Where(x => x.Department == department);
        }

        return query.OrderBy(x => x.Title).ToListAsync(ct);
    }

    public Task<string?> GetParsedResumeJsonAsync(Guid recruiterId, Guid companyId, Guid submissionId, CancellationToken ct = default)
        => dbContext.ResumeSubmissions
            .AsNoTracking()
            .Where(s => s.Id == submissionId)
            .Where(s => dbContext.Jobs.Any(j => j.Id == s.JobId && j.RecruiterId == recruiterId && j.CompanyId == companyId))
            .Select(s => s.ParsedResumeJson)
            .FirstOrDefaultAsync(ct);

    public Task<ApplicantStageContextData?> GetApplicantStageContextAsync(Guid recruiterId, Guid companyId, Guid submissionId, CancellationToken ct = default)
        => dbContext.ResumeSubmissions
            .Where(s => s.Id == submissionId)
            .Join(dbContext.Jobs, s => s.JobId, j => j.Id, (submission, job) => new ApplicantStageContextData
            {
                Submission = submission,
                Job = job,
            })
            .FirstOrDefaultAsync(x => x.Job.RecruiterId == recruiterId && x.Job.CompanyId == companyId, ct);

    public Task<IDbContextTransaction> BeginSerializableTransactionAsync(CancellationToken ct = default)
        => dbContext.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);

    private IQueryable<ApplicantScoreData> BuildApplicantScoreQuery(Guid recruiterId, Guid companyId)
        => dbContext.ResumeSubmissions
            .AsNoTracking()
            .Join(dbContext.Jobs.AsNoTracking(), submission => submission.JobId, job => job.Id, (submission, job) => new { submission, job })
            .Where(x => x.job.RecruiterId == recruiterId && x.job.CompanyId == companyId)
            .GroupJoin(
                dbContext.ResumeScores.AsNoTracking(),
                x => x.submission.Id,
                score => score.ResumeSubmissionId,
                (x, scores) => new { x.submission, x.job, scores })
            .SelectMany(
                x => x.scores.DefaultIfEmpty(),
                (x, score) => new ApplicantScoreData
                {
                    ResumeSubmissionId = x.submission.Id,
                    JobId = x.job.Id,
                    JobTitle = x.job.Title,
                    JobDepartment = x.job.Department ?? "Unassigned",
                    Status = x.submission.Status,
                    Score = score != null ? (decimal)score.FinalWeightedScore : 0,
                    CreatedAtUtc = x.submission.CreatedAtUtc,
                    ApplicantName = x.submission.FullName,
                    ApplicantEmail = x.submission.Email,
                    PostalCode = x.submission.PostalCode,
                    MatchSummary = score != null ? score.ScoreBreakdownJson : null,
                });
}
