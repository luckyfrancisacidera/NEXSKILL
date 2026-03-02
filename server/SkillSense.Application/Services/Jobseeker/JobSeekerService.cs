using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SkillSense.Application.Contracts.Jobseeker.Request;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Jobseeker;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;

namespace SkillSense.Application.Services.Jobseeker
{
    public sealed class JobSeekerService(
        SkillSenseDbContext dbContext,
        IResumeUploadService resumeUploadService,
        IAppCacheService cacheService) : IJobSeekerService
    {
        public async Task<PagedResult<JobListItemResponse>> GetPublicJobsAsync(int pageNumber, int pageSize, string? search, string? sortBy, string? sortDir, CancellationToken ct = default)
        {
            var cacheKey = $"jobs:public:list:{pageNumber}:{pageSize}:{search}:{sortBy}:{sortDir}";
            return await cacheService.GetOrCreateAsync(cacheKey, TimeSpan.FromSeconds(60), async () =>
            {
                var query = dbContext.Jobs.AsNoTracking().Where(x => x.Status == JobStatus.Published);
                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(x => x.Title.ToLower().Contains(search.ToLower()) || x.Description.ToLower().Contains(search.ToLower()));
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
                return new PagedResult<JobListItemResponse>
                {
                    Items = items.Select(Map).ToList(),
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalCount = totalCount,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                };
            });
        }

        public async Task<JobListItemResponse?> GetPublicJobAsync(Guid id, CancellationToken ct = default)
        {
            return await cacheService.GetOrCreateAsync($"jobs:public:detail:{id}", TimeSpan.FromSeconds(120), async () =>
            {
                var job = await dbContext.Jobs.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && x.Status == JobStatus.Published, ct);
                return job is null ? null : Map(job);
            });
        }

        public async Task<ResumeUploadResponse> ApplyAsync(Guid jobId, ApplyToJobRequest request, Stream fileStream, string fileName, string contentType, CancellationToken ct = default)
        {
            var job = await dbContext.Jobs.AsNoTracking().FirstOrDefaultAsync(x => x.Id == jobId && x.Status == JobStatus.Published, ct)
                ?? throw new InvalidOperationException("Published job not found.");

            var response = await resumeUploadService.EnqueueUploadAsync(fileStream, fileName, contentType, jobId, job.Title, request.FullName, request.Email, request.PostalCode, request.Location, null, ct);
            cacheService.RemoveByPrefix("dashboard:recruiter:");
            return response;
        }

        public async Task<PagedResult<object>> GetMyApplicationsAsync(Guid userId, int pageNumber, int pageSize, CancellationToken ct = default)
        {
            var query = dbContext.ResumeSubmissions.AsNoTracking().Where(x => x.ApplicantUserId == userId).OrderByDescending(x => x.CreatedAtUtc);
            var totalCount = await query.CountAsync(ct);
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).Select(x => new
            {
                id = x.Id,
                job_id = x.JobId,
                full_name = x.FullName,
                email = x.Email,
                status = x.Status.ToString(),
                created_at_utc = x.CreatedAtUtc
            }).ToListAsync(ct);

            return new PagedResult<object>
            {
                Items = items,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        private static JobListItemResponse Map(JobEntity x)
            => new()
            {
                Id = x.Id,
                Title = x.Title,
                Department = x.Department,
                Benefits = x.Benefits,
                SalaryMinPerAnnum = x.SalaryMinPerAnnum,
                SalaryMaxPerAnnum = x.SalaryMaxPerAnnum,
                Currency = x.Currency,
                Location = x.Location,
                Schedule = x.Schedule,
                WorkSetup = x.WorkSetup.ToString(),
                EmploymentType = x.EmploymentType.ToString(),
                Status = x.Status.ToString(),
                RequiredSkills = JsonSerializer.Deserialize<List<string>>(x.RequiredSkillsJson) ?? [],
                PreferredSkills = JsonSerializer.Deserialize<List<string>>(x.PreferredSkillsJson) ?? [],
                CompanyName = x.CompanyNameSnapshot,
                CompanyEmail = x.CompanyEmailSnapshot,
                Description = x.Description,
                Responsibilities = x.ResponsibilitiesText,
                ExperienceLevel = x.ExperienceLevel,
                MinYears = x.MinYears,
                Education = x.Education,
                MinEducation = x.Education,
                PostedDateUtc = x.PostedDateUtc
            };
    }
}
