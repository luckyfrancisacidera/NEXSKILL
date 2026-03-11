using Microsoft.EntityFrameworkCore;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Repositories;

public sealed class AdminManagementRepository(SkillSenseDbContext dbContext) : IAdminManagementRepository
{
    public async Task<SuperAdminDashboardData> GetSuperAdminDashboardAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var nextWeek = now.AddDays(7);
        var nowOffset = DateTimeOffset.UtcNow;

        var companies = await dbContext.Companies
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
            })
            .Take(12)
            .ToListAsync(ct);

        var recentRecruiters = await dbContext.RecruiterProfiles
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
                TotalHires = dbContext.ResumeSubmissions.Count(submission =>
                    submission.Status == ResumeSubmissionStatus.Hire &&
                    dbContext.Jobs.Any(job => job.Id == submission.JobId && job.RecruiterId == joined.user.Id)),
            })
            .OrderByDescending(recruiter => recruiter.CreatedAtUtc)
            .Take(8)
            .ToListAsync(ct);

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
            Companies = companies,
            RecentRecruiters = recentRecruiters,
        };
    }

    public async Task<CompanyAdminDashboardData?> GetCompanyAdminDashboardAsync(Guid companyId, CancellationToken ct = default)
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

        var recruiters = await dbContext.RecruiterProfiles
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
                TotalHires = dbContext.ResumeSubmissions.Count(submission =>
                    submission.Status == ResumeSubmissionStatus.Hire &&
                    dbContext.Jobs.Any(job => job.Id == submission.JobId && job.RecruiterId == user.Id)),
            })
            .OrderByDescending(recruiter => recruiter.CreatedAtUtc)
            .ToListAsync(ct);

        return new CompanyAdminDashboardData
        {
            Company = company,
            TotalRecruiters = recruiters.Count,
            ActiveRecruiters = recruiters.Count(recruiter => recruiter.IsActive),
            ActiveJobs = await dbContext.Jobs.CountAsync(job => job.CompanyId == companyId && job.Status == JobStatus.Published, ct),
            UpcomingInterviews = await dbContext.Interviews.CountAsync(interview =>
                interview.CompanyId == companyId &&
                interview.ScheduledDateTimeUtc >= now &&
                interview.ScheduledDateTimeUtc < nextWeek, ct),
            TotalOffers = await dbContext.ResumeSubmissions.CountAsync(submission => submission.CompanyId == companyId && submission.Status == ResumeSubmissionStatus.Offer, ct),
            TotalHires = await dbContext.ResumeSubmissions.CountAsync(submission => submission.CompanyId == companyId && submission.Status == ResumeSubmissionStatus.Hire, ct),
            Recruiters = recruiters,
        };
    }

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
                TotalHires = dbContext.ResumeSubmissions.Count(submission =>
                    submission.Status == ResumeSubmissionStatus.Hire &&
                    dbContext.Jobs.Any(job => job.Id == submission.JobId && job.RecruiterId == joined.user.Id)),
            })
            .FirstOrDefaultAsync(ct);
    }
}
