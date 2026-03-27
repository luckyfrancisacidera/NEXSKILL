using Microsoft.EntityFrameworkCore;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Repositories;

public sealed class AdminManagementRepository(SkillSenseDbContext dbContext) : IAdminManagementRepository
{
    public async Task<SuperAdminDashboardData> GetSuperAdminDashboardAsync(
        int companiesPageNumber,
        int companyAdminsPageNumber,
        int recruitersPageNumber,
        int pageSize,
        CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var nextWeek = now.AddDays(7);
        var nowOffset = DateTimeOffset.UtcNow;

        var companiesQuery = dbContext.Companies
            .AsNoTracking()
            .OrderByDescending(company => company.UpdatedAtUtc)
            .Select(company => new AdminCompanyOverviewData
            {
                CompanyId = company.Id,
                Name = company.Name,
                PrimaryEmail = company.PrimaryEmail,
                IsActive = company.IsActive,
                RecruiterCount = dbContext.RecruiterProfiles.Count(profile => profile.CompanyId == company.Id),
                ActiveJobs = dbContext.Jobs.Count(job => job.CompanyId == company.Id && job.Status == JobStatus.Published),
                UpcomingInterviews = dbContext.Interviews.Count(interview =>
                    interview.CompanyId == company.Id &&
                    interview.ScheduledDateTimeUtc >= now &&
                    interview.ScheduledDateTimeUtc < nextWeek),
                UpdatedAtUtc = company.UpdatedAtUtc,
            });

        var companyAdminsQuery = dbContext.AdminProfiles
            .AsNoTracking()
            .Where(profile => profile.CompanyId.HasValue)
            .Join(dbContext.Users.AsNoTracking(), profile => profile.UserId, user => user.Id, (profile, user) => new { profile, user })
            .Join(dbContext.Companies.AsNoTracking(), joined => joined.profile.CompanyId!.Value, company => company.Id, (joined, company) => new AdminCompanyAdminOverviewData
            {
                UserId = joined.user.Id,
                CompanyId = company.Id,
                CompanyName = company.Name,
                Email = joined.user.Email ?? string.Empty,
                IsActive = !joined.user.LockoutEnd.HasValue || joined.user.LockoutEnd <= nowOffset,
                CreatedAtUtc = joined.profile.CreatedAtUtc,
            })
            .OrderByDescending(admin => admin.CreatedAtUtc);

        var recruitersQuery = dbContext.RecruiterProfiles
            .AsNoTracking()
            .Join(dbContext.Users.AsNoTracking(), profile => profile.UserId, user => user.Id, (profile, user) => new { profile, user })
            .Join(dbContext.Companies.AsNoTracking(), joined => joined.profile.CompanyId, company => company.Id, (joined, company) => new AdminRecruiterOverviewData
            {
                ProfileId = joined.profile.Id,
                UserId = joined.user.Id,
                CompanyId = company.Id,
                CompanyName = company.Name,
                Email = joined.user.Email ?? string.Empty,
                IsActive = !joined.user.LockoutEnd.HasValue || joined.user.LockoutEnd <= nowOffset,
                CreatedAtUtc = joined.profile.CreatedAtUtc,
                TotalJobs = dbContext.Jobs.Count(job => job.RecruiterId == joined.user.Id),
                ActiveJobs = dbContext.Jobs.Count(job => job.RecruiterId == joined.user.Id && job.Status == JobStatus.Published),
                UpcomingInterviews = dbContext.Interviews.Count(interview => interview.RecruiterId == joined.user.Id && interview.ScheduledDateTimeUtc >= now),
                TotalHires = dbContext.Hires.Count(hire =>
                    hire.Status == HireStatus.Active &&
                    hire.RecruiterId == joined.user.Id),
            })
            .OrderByDescending(recruiter => recruiter.CreatedAtUtc);

        return new SuperAdminDashboardData
        {
            TotalCompanies = await dbContext.Companies.CountAsync(ct),
            ActiveCompanies = await dbContext.Companies.CountAsync(company => company.IsActive, ct),
            TotalRecruiters = await dbContext.RecruiterProfiles.CountAsync(ct),
            ActiveRecruiters = await dbContext.RecruiterProfiles
                .Join(dbContext.Users, profile => profile.UserId, user => user.Id, (_, user) => user)
                .CountAsync(user => !user.LockoutEnd.HasValue || user.LockoutEnd <= nowOffset, ct),
            TotalJobs = await dbContext.Jobs.CountAsync(ct),
            ActiveJobs = await dbContext.Jobs.CountAsync(job => job.Status == JobStatus.Published, ct),
            Companies = await CreatePagedDataAsync(companiesQuery, companiesPageNumber, pageSize, ct),
            CompanyAdmins = await CreatePagedDataAsync(companyAdminsQuery, companyAdminsPageNumber, pageSize, ct),
            Recruiters = await CreatePagedDataAsync(recruitersQuery, recruitersPageNumber, pageSize, ct),
        };
    }

    public async Task<CompanyAdminDashboardData?> GetCompanyAdminDashboardAsync(
        Guid companyId,
        int pageNumber,
        int pageSize,
        CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var nextWeek = now.AddDays(7);
        var nowOffset = DateTimeOffset.UtcNow;

        var company = await dbContext.Companies
            .AsNoTracking()
            .Where(item => item.Id == companyId)
            .Select(item => new AdminCompanyIdentityData
            {
                Id = item.Id,
                Name = item.Name,
                PrimaryEmail = item.PrimaryEmail,
                Location = item.Location,
                IsActive = item.IsActive,
            })
            .FirstOrDefaultAsync(ct);

        if (company is null)
        {
            return null;
        }

        var recruitersQuery = dbContext.RecruiterProfiles
            .AsNoTracking()
            .Where(profile => profile.CompanyId == companyId)
            .Join(dbContext.Users.AsNoTracking(), profile => profile.UserId, user => user.Id, (profile, user) => new AdminRecruiterOverviewData
            {
                ProfileId = profile.Id,
                UserId = user.Id,
                CompanyId = profile.CompanyId,
                CompanyName = company.Name,
                Email = user.Email ?? string.Empty,
                IsActive = !user.LockoutEnd.HasValue || user.LockoutEnd <= nowOffset,
                CreatedAtUtc = profile.CreatedAtUtc,
                TotalJobs = dbContext.Jobs.Count(job => job.RecruiterId == user.Id),
                ActiveJobs = dbContext.Jobs.Count(job => job.RecruiterId == user.Id && job.Status == JobStatus.Published),
                UpcomingInterviews = dbContext.Interviews.Count(interview => interview.RecruiterId == user.Id && interview.ScheduledDateTimeUtc >= now),
                TotalHires = dbContext.Hires.Count(hire =>
                    hire.Status == HireStatus.Active &&
                    hire.RecruiterId == user.Id),
            })
            .OrderByDescending(recruiter => recruiter.CreatedAtUtc);

        var pagedRecruiters = await CreatePagedDataAsync(recruitersQuery, pageNumber, pageSize, ct);

        return new CompanyAdminDashboardData
        {
            Company = company,
            TotalRecruiters = await dbContext.RecruiterProfiles.CountAsync(profile => profile.CompanyId == companyId, ct),
            ActiveRecruiters = await dbContext.RecruiterProfiles
                .Where(profile => profile.CompanyId == companyId)
                .Join(dbContext.Users, profile => profile.UserId, user => user.Id, (_, user) => user)
                .CountAsync(user => !user.LockoutEnd.HasValue || user.LockoutEnd <= nowOffset, ct),
            ActiveJobs = await dbContext.Jobs.CountAsync(job => job.CompanyId == companyId && job.Status == JobStatus.Published, ct),
            UpcomingInterviews = await dbContext.Interviews.CountAsync(interview =>
                interview.CompanyId == companyId &&
                interview.ScheduledDateTimeUtc >= now &&
                interview.ScheduledDateTimeUtc < nextWeek, ct),
            TotalOffers = await dbContext.ResumeSubmissions.CountAsync(submission => submission.CompanyId == companyId && submission.Status == ResumeSubmissionStatus.Offer, ct),
            TotalHires = await dbContext.Hires.CountAsync(hire => hire.CompanyId == companyId && hire.Status == HireStatus.Active, ct),
            Recruiters = pagedRecruiters,
        };
    }

    public async Task<PagedData<EmployeeRecordData>> GetCompanyEmployeesAsync(
        Guid companyId,
        int pageNumber,
        int pageSize,
        string? search,
        CancellationToken ct = default)
    {
        var normalizedPageNumber = Math.Max(1, pageNumber);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 100);
        var query =
            from hire in dbContext.Hires.AsNoTracking()
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

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLowerInvariant();
            query = query.Where(x =>
                x.EmployeeName.ToLower().Contains(normalizedSearch)
                || x.EmployeeEmail.ToLower().Contains(normalizedSearch)
                || x.RecruiterName.ToLower().Contains(normalizedSearch)
                || x.JobTitle.ToLower().Contains(normalizedSearch)
                || x.Department.ToLower().Contains(normalizedSearch));
        }

        return await CreatePagedDataAsync(
            query.OrderByDescending(x => x.HireDateUtc).ThenBy(x => x.EmployeeName),
            normalizedPageNumber,
            normalizedPageSize,
            ct);
    }

    public Task<ApplicantScoreData?> GetApplicantScoreBySubmissionIdAsync(
        Guid companyId,
        Guid submissionId,
        CancellationToken ct = default)
        => dbContext.ResumeSubmissions
            .AsNoTracking()
            .Join(dbContext.Jobs.AsNoTracking(), submission => submission.JobId, job => job.Id, (submission, job) => new { submission, job })
            .Where(x => x.job.CompanyId == companyId && x.submission.Id == submissionId)
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
                })
            .FirstOrDefaultAsync(ct);

    public Task<string?> GetParsedResumeJsonAsync(
        Guid companyId,
        Guid submissionId,
        CancellationToken ct = default)
        => dbContext.ResumeSubmissions
            .AsNoTracking()
            .Where(s => s.Id == submissionId && s.CompanyId == companyId)
            .Select(s => s.ParsedResumeJson)
            .FirstOrDefaultAsync(ct);

    public Task<ResumeSubmissionEntity?> GetSubmissionByIdForCompanyAsync(
        Guid companyId,
        Guid submissionId,
        CancellationToken ct = default)
        => dbContext.ResumeSubmissions
            .Where(submission => submission.Id == submissionId && submission.CompanyId == companyId)
            .FirstOrDefaultAsync(ct);

    public Task<JobOfferEntity?> GetLatestOfferByApplicationIdAsync(
        Guid applicationId,
        CancellationToken ct = default)
        => dbContext.JobOffers
            .AsNoTracking()
            .Where(offer => offer.ApplicationId == applicationId)
            .OrderByDescending(offer => offer.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

    public Task<Guid?> GetCompanyIdByAdminUserIdAsync(Guid adminUserId, CancellationToken ct = default)
        => dbContext.AdminProfiles
            .AsNoTracking()
            .Where(profile => profile.UserId == adminUserId)
            .Select(profile => profile.CompanyId)
            .FirstOrDefaultAsync(ct);

    public Task<AdminRecruiterOverviewData?> GetRecruiterOverviewByUserIdAsync(Guid recruiterUserId, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var nowOffset = DateTimeOffset.UtcNow;

        return dbContext.RecruiterProfiles
            .AsNoTracking()
            .Where(profile => profile.UserId == recruiterUserId)
            .Join(dbContext.Users.AsNoTracking(), profile => profile.UserId, user => user.Id, (profile, user) => new { profile, user })
            .Join(dbContext.Companies.AsNoTracking(), joined => joined.profile.CompanyId, company => company.Id, (joined, company) => new AdminRecruiterOverviewData
            {
                ProfileId = joined.profile.Id,
                UserId = joined.user.Id,
                CompanyId = company.Id,
                CompanyName = company.Name,
                Email = joined.user.Email ?? string.Empty,
                IsActive = !joined.user.LockoutEnd.HasValue || joined.user.LockoutEnd <= nowOffset,
                CreatedAtUtc = joined.profile.CreatedAtUtc,
                TotalJobs = dbContext.Jobs.Count(job => job.RecruiterId == joined.user.Id),
                ActiveJobs = dbContext.Jobs.Count(job => job.RecruiterId == joined.user.Id && job.Status == JobStatus.Published),
                UpcomingInterviews = dbContext.Interviews.Count(interview => interview.RecruiterId == joined.user.Id && interview.ScheduledDateTimeUtc >= now),
                TotalHires = dbContext.Hires.Count(hire =>
                    hire.Status == HireStatus.Active &&
                    hire.RecruiterId == joined.user.Id),
            })
            .FirstOrDefaultAsync(ct);
    }

    public Task<AdminCompanyAdminOverviewData?> GetCompanyAdminOverviewByUserIdAsync(Guid adminUserId, CancellationToken ct = default)
    {
        var nowOffset = DateTimeOffset.UtcNow;

        return dbContext.AdminProfiles
            .AsNoTracking()
            .Where(profile => profile.UserId == adminUserId && profile.CompanyId.HasValue)
            .Join(dbContext.Users.AsNoTracking(), profile => profile.UserId, user => user.Id, (profile, user) => new { profile, user })
            .Join(dbContext.Companies.AsNoTracking(), joined => joined.profile.CompanyId!.Value, company => company.Id, (joined, company) => new AdminCompanyAdminOverviewData
            {
                UserId = joined.user.Id,
                CompanyId = company.Id,
                CompanyName = company.Name,
                Email = joined.user.Email ?? string.Empty,
                IsActive = !joined.user.LockoutEnd.HasValue || joined.user.LockoutEnd <= nowOffset,
                CreatedAtUtc = joined.profile.CreatedAtUtc,
            })
            .FirstOrDefaultAsync(ct);
    }

    public Task<CompanyEntity?> GetCompanyByIdAsync(Guid companyId, CancellationToken ct = default)
        => dbContext.Companies.FirstOrDefaultAsync(company => company.Id == companyId, ct);

    public Task<bool> CompanyNameExistsAsync(string companyName, CancellationToken ct = default)
    {
        var normalizedName = companyName.Trim().ToLower();
        return dbContext.Companies.AnyAsync(company => company.Name.ToLower() == normalizedName, ct);
    }

    public async Task AddCompanyAsync(CompanyEntity company, CancellationToken ct = default)
        => await dbContext.Companies.AddAsync(company, ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => dbContext.SaveChangesAsync(ct);

    private static async Task<PagedData<T>> CreatePagedDataAsync<T>(IQueryable<T> query, int pageNumber, int pageSize, CancellationToken ct)
    {
        var normalizedPageNumber = Math.Max(1, pageNumber);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 100);
        var totalCount = await query.CountAsync(ct);
        var items = await query
            .Skip((normalizedPageNumber - 1) * normalizedPageSize)
            .Take(normalizedPageSize)
            .ToListAsync(ct);

        return new PagedData<T>
        {
            Items = items,
            PageNumber = normalizedPageNumber,
            PageSize = normalizedPageSize,
            TotalCount = totalCount,
            TotalPages = totalCount == 0 ? 1 : (int)Math.Ceiling(totalCount / (double)normalizedPageSize),
        };
    }
}
