using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Repositories;

public sealed class RecruiterRepository(SkillSenseDbContext dbContext) : IRecruiterRepository
{
    private static readonly ResumeSubmissionStatus[] RecruiterActiveApplicantStatuses =
    [
        ResumeSubmissionStatus.Completed,
        ResumeSubmissionStatus.Shortlisted,
        ResumeSubmissionStatus.Interview,
        ResumeSubmissionStatus.Offer,
    ];

    private static readonly ResumeSubmissionStatus[] RecruiterDetailApplicantStatuses =
    [
        ResumeSubmissionStatus.Completed,
        ResumeSubmissionStatus.Shortlisted,
        ResumeSubmissionStatus.Interview,
        ResumeSubmissionStatus.Offer,
        ResumeSubmissionStatus.Hired,
        ResumeSubmissionStatus.Rejected,
    ];

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
            .Join(dbContext.Hires.AsNoTracking(), submission => submission.Id, hire => hire.ApplicationId, (submission, hire) => new { submission, hire })
            .Where(x => jobIds.Contains(x.submission.JobId) && x.hire.Status == HireStatus.Active)
            .GroupBy(x => x.submission.JobId)
            .Select(x => new { JobId = x.Key, Count = x.Count() })
            .ToDictionaryAsync(x => x.JobId, x => x.Count, ct);
    }

    public Task<int> GetHiredCountByJobIdAsync(Guid jobId, CancellationToken ct = default)
        => dbContext.Hires
            .AsNoTracking()
            .CountAsync(x => x.JobId == jobId && x.Status == HireStatus.Active, ct);

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

    public Task<List<DashboardOfferMetricData>> GetLatestDashboardOffersAsync(IReadOnlyCollection<Guid> applicationIds, CancellationToken ct = default)
    {
        if (applicationIds.Count == 0)
        {
            return Task.FromResult(new List<DashboardOfferMetricData>());
        }

        return dbContext.JobOffers
            .AsNoTracking()
            .Where(offer => applicationIds.Contains(offer.ApplicationId))
            .GroupBy(offer => offer.ApplicationId)
            .Select(group => group
                .OrderByDescending(offer => offer.CreatedAtUtc)
                .Select(offer => new DashboardOfferMetricData
                {
                    ApplicationId = offer.ApplicationId,
                    SalaryAmount = offer.SalaryAmount,
                    SalaryType = offer.SalaryType,
                    Currency = offer.Currency,
                })
                .First())
            .ToListAsync(ct);
    }

    public Task<Dictionary<Guid, (string Title, string Department)>> GetJobLookupAsync(Guid recruiterId, Guid companyId, CancellationToken ct = default)
        => dbContext.Jobs.AsNoTracking()
            .Where(j => j.RecruiterId == recruiterId && j.CompanyId == companyId)
            .Select(j => new { j.Id, j.Title, Department = j.Department ?? "Unassigned" })
            .ToDictionaryAsync(j => j.Id, j => ValueTuple.Create(j.Title, j.Department), ct);

    public Task<List<ApplicantScoreData>> GetApplicantScoreDataAsync(Guid recruiterId, Guid companyId, string? department, string? search, CancellationToken ct = default)
    {
        var query = BuildApplicantScoreQuery(recruiterId, companyId, RecruiterActiveApplicantStatuses);

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
        => BuildApplicantScoreQuery(recruiterId, companyId, RecruiterDetailApplicantStatuses)
            .FirstOrDefaultAsync(x => x.ResumeSubmissionId == submissionId, ct);

    public async Task<PagedData<EmployeeRecordData>> GetHiredEmployeeDataAsync(Guid recruiterId, Guid companyId, int pageNumber, int pageSize, string? search, CancellationToken ct = default)
    {
        var normalizedPageNumber = Math.Max(1, pageNumber);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 100);
        var query = BuildEmployeeQuery(companyId)
            .Where(x => x.HiredByRecruiterId == recruiterId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLowerInvariant();
            query = query.Where(x =>
                x.EmployeeName.ToLower().Contains(normalizedSearch)
                || x.EmployeeEmail.ToLower().Contains(normalizedSearch)
                || x.JobTitle.ToLower().Contains(normalizedSearch)
                || x.Department.ToLower().Contains(normalizedSearch));
        }

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(x => x.HireDateUtc)
            .ThenBy(x => x.EmployeeName)
            .Skip((normalizedPageNumber - 1) * normalizedPageSize)
            .Take(normalizedPageSize)
            .ToListAsync(ct);

        return new PagedData<EmployeeRecordData>
        {
            Items = items,
            PageNumber = normalizedPageNumber,
            PageSize = normalizedPageSize,
            TotalCount = totalCount,
            TotalPages = totalCount == 0 ? 1 : (int)Math.Ceiling(totalCount / (double)normalizedPageSize),
        };
    }

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
                LatestOffer = dbContext.JobOffers
                    .Where(offer => offer.ApplicationId == submission.Id)
                    .OrderByDescending(offer => offer.CreatedAtUtc)
                    .FirstOrDefault(),
                LatestInterview = submission.JobSeekerUserId.HasValue
                    ? dbContext.Interviews
                        .Where(interview =>
                            interview.CompanyId == companyId
                            && interview.JobId == submission.JobId
                            && interview.RecruiterId == recruiterId
                            && interview.JobSeekerId == submission.JobSeekerUserId.Value
                            && !interview.IsArchived)
                        .OrderByDescending(interview => interview.CreatedAtUtc)
                        .ThenByDescending(interview => interview.ScheduledDateTimeUtc)
                        .FirstOrDefault()
                    : null,
            })
            .FirstOrDefaultAsync(x => x.Job.RecruiterId == recruiterId && x.Job.CompanyId == companyId, ct);

    public async Task<IReadOnlyList<ShortlistedCandidateData>> GetShortlistedCandidatesByJobAsync(Guid jobId, CancellationToken ct = default)
        => await dbContext.ResumeSubmissions
            .AsNoTracking()
            .Where(submission => submission.JobId == jobId
                && submission.Status == ResumeSubmissionStatus.Shortlisted
                && submission.JobSeekerUserId.HasValue)
            .Select(submission => new ShortlistedCandidateData
            {
                ResumeSubmissionId = submission.Id,
                JobId = submission.JobId,
                JobSeekerUserId = submission.JobSeekerUserId!.Value,
                CandidateName = submission.FullName ?? submission.Email ?? "Candidate",
                CandidateEmail = submission.Email ?? string.Empty,
            })
            .OrderBy(candidate => candidate.CandidateName)
            .ToListAsync(ct);

    public Task<ResumeSubmissionEntity?> GetSubmissionForInterviewAsync(Guid recruiterId, Guid companyId, Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default)
        => dbContext.ResumeSubmissions
            .Where(submission => submission.JobId == jobId
                && submission.JobSeekerUserId == jobSeekerUserId)
            .Where(submission => dbContext.Jobs.Any(job =>
                job.Id == submission.JobId
                && job.RecruiterId == recruiterId
                && job.CompanyId == companyId))
            .OrderByDescending(submission => submission.UpdatedAtUtc)
            .ThenByDescending(submission => submission.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

    public Task<ResumeSubmissionEntity?> GetSubmissionByIdForRecruiterAsync(Guid recruiterId, Guid companyId, Guid submissionId, CancellationToken ct = default)
        => dbContext.ResumeSubmissions
            .Where(submission => submission.Id == submissionId)
            .Where(submission => dbContext.Jobs.Any(job =>
                job.Id == submission.JobId
                && job.RecruiterId == recruiterId
                && job.CompanyId == companyId))
            .FirstOrDefaultAsync(ct);

    public Task<JobOfferEntity?> GetLatestOfferByApplicationIdAsync(Guid applicationId, CancellationToken ct = default)
        => dbContext.JobOffers
            .Where(offer => offer.ApplicationId == applicationId)
            .OrderByDescending(offer => offer.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

    public Task<InterviewEntity?> GetLatestInterviewForSubmissionAsync(Guid recruiterId, Guid companyId, Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default)
        => dbContext.Interviews
            .Where(interview =>
                interview.RecruiterId == recruiterId
                && interview.CompanyId == companyId
                && interview.JobId == jobId
                && interview.JobSeekerId == jobSeekerUserId
                && !interview.IsArchived)
            .OrderByDescending(interview => interview.CreatedAtUtc)
            .ThenByDescending(interview => interview.ScheduledDateTimeUtc)
            .FirstOrDefaultAsync(ct);

    public Task AddOfferAsync(JobOfferEntity offer, CancellationToken ct = default)
        => dbContext.JobOffers.AddAsync(offer, ct).AsTask();

    public Task<IDbContextTransaction> BeginSerializableTransactionAsync(CancellationToken ct = default)
        => dbContext.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);

    private IQueryable<ApplicantScoreData> BuildApplicantScoreQuery(Guid recruiterId, Guid companyId, IReadOnlyCollection<ResumeSubmissionStatus> statuses)
        => dbContext.ResumeSubmissions
            .AsNoTracking()
            .Join(dbContext.Jobs.AsNoTracking(), submission => submission.JobId, job => job.Id, (submission, job) => new { submission, job })
            .Where(x => x.job.RecruiterId == recruiterId
                && x.job.CompanyId == companyId
                && statuses.Contains(x.submission.Status))
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
                    JobSeekerUserId = x.submission.JobSeekerUserId,
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
                HasResume = !string.IsNullOrWhiteSpace(x.submission.BlobObjectKey),
                ResumeFileName = x.submission.FileName,
                OfferStatus = dbContext.JobOffers
                    .Where(offer => offer.ApplicationId == x.submission.Id)
                    .OrderByDescending(offer => offer.CreatedAtUtc)
                    .Select(offer => offer.Status.ToString())
                    .FirstOrDefault(),
                OfferSentAtUtc = dbContext.JobOffers
                    .Where(offer => offer.ApplicationId == x.submission.Id)
                    .OrderByDescending(offer => offer.CreatedAtUtc)
                    .Select(offer => (DateTime?)offer.SentAtUtc)
                    .FirstOrDefault(),
                LatestInterviewStatus = x.submission.JobSeekerUserId.HasValue
                    ? dbContext.Interviews
                        .Where(interview =>
                            interview.CompanyId == companyId
                            && interview.JobId == x.submission.JobId
                            && interview.RecruiterId == recruiterId
                            && interview.JobSeekerId == x.submission.JobSeekerUserId.Value
                            && !interview.IsArchived)
                        .OrderByDescending(interview => interview.CreatedAtUtc)
                        .ThenByDescending(interview => interview.ScheduledDateTimeUtc)
                        .Select(interview => interview.Status.ToString())
                        .FirstOrDefault()
                    : null,
                LatestInterviewScheduledDateTimeUtc = x.submission.JobSeekerUserId.HasValue
                    ? dbContext.Interviews
                        .Where(interview =>
                            interview.CompanyId == companyId
                            && interview.JobId == x.submission.JobId
                            && interview.RecruiterId == recruiterId
                            && interview.JobSeekerId == x.submission.JobSeekerUserId.Value
                            && !interview.IsArchived)
                        .OrderByDescending(interview => interview.CreatedAtUtc)
                        .ThenByDescending(interview => interview.ScheduledDateTimeUtc)
                        .Select(interview => (DateTime?)interview.ScheduledDateTimeUtc)
                        .FirstOrDefault()
                    : null,
                });

    private IQueryable<EmployeeRecordData> BuildEmployeeQuery(Guid companyId)
        => from hire in dbContext.Hires.AsNoTracking()
           where hire.CompanyId == companyId
              && hire.Status == HireStatus.Active
           join submission in dbContext.ResumeSubmissions.AsNoTracking() on hire.ApplicationId equals submission.Id
           join job in dbContext.Jobs.AsNoTracking() on hire.JobId equals job.Id
           join recruiterUser in dbContext.Users.AsNoTracking() on hire.RecruiterId equals recruiterUser.Id into recruiterUsers
           from recruiterUser in recruiterUsers.DefaultIfEmpty()
           select new EmployeeRecordData
           {
               HireId = hire.Id,
               ResumeSubmissionId = hire.ApplicationId,
               CompanyId = hire.CompanyId,
               JobId = hire.JobId,
               JobSeekerUserId = hire.JobSeekerId,
               HiredByRecruiterId = hire.RecruiterId,
               AcceptedOfferId = hire.OfferId,
               HireStatus = hire.Status.ToString(),
               EmployeeName = !string.IsNullOrWhiteSpace(submission.FullName) ? submission.FullName : submission.Email ?? "Unknown Applicant",
               EmployeeEmail = submission.Email ?? "-",
               RecruiterName = recruiterUser != null
                   ? (!string.IsNullOrWhiteSpace(recruiterUser.FirstName) || !string.IsNullOrWhiteSpace(recruiterUser.LastName)
                       ? $"{recruiterUser.FirstName} {recruiterUser.LastName}".Trim()
                       : recruiterUser.Email ?? recruiterUser.UserName ?? "Unknown Recruiter")
                   : "Unknown Recruiter",
               RecruiterEmail = recruiterUser != null ? recruiterUser.Email : null,
               JobTitle = job.Title,
               Department = job.Department ?? "Unassigned",
               OfferTitle = dbContext.JobOffers
                   .Where(offer => offer.Id == hire.OfferId)
                   .Select(offer => offer.Title)
                   .FirstOrDefault(),
               OfferSalaryText = dbContext.JobOffers
                   .Where(offer => offer.Id == hire.OfferId)
                   .Select(offer => offer.SalaryText)
                   .FirstOrDefault(),
               HireDateUtc = hire.HiredAtUtc,
           };
}
