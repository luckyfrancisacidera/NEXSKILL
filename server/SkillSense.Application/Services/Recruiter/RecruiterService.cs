using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SkillSense.Application.Contracts.Recruiter.Request;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Recruiter;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services
{



    public sealed class RecruiterService(
        SkillSenseDbContext dbContext,
        IJobRepository jobRepository,
        ITextEmbeddingService embeddingService,
        IAppCacheService cacheService) : IRecruiterService
    {
        public async Task<RecruiterProfileResponse> GetProfileAsync(Guid recruiterId, CancellationToken ct = default)
        {
            var profile = await dbContext.RecruiterProfiles.FirstOrDefaultAsync(x => x.UserId == recruiterId, ct)
                ?? throw new InvalidOperationException("Recruiter profile not found.");

            return new RecruiterProfileResponse
            {
                CompanyName = profile.CompanyName,
                CompanyEmail = profile.CompanyEmail,
                IsComplete = !string.IsNullOrWhiteSpace(profile.CompanyName) && !string.IsNullOrWhiteSpace(profile.CompanyEmail)
            };
        }

        public async Task<RecruiterProfileResponse> UpsertProfileAsync(Guid recruiterId, RecruiterProfileRequest request, CancellationToken ct = default)
        {
            var profile = await dbContext.RecruiterProfiles.FirstOrDefaultAsync(x => x.UserId == recruiterId, ct)
                ?? throw new InvalidOperationException("Recruiter profile not found.");

            profile.CompanyName = request.CompanyName.Trim();
            profile.CompanyEmail = request.CompanyEmail.Trim();
            await dbContext.SaveChangesAsync(ct);

            return await GetProfileAsync(recruiterId, ct);
        }

        public async Task<JobListItemResponse> CreateJobAsync(Guid recruiterId, CreateJobRequest request, CancellationToken ct = default)
        {
            var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
            if (string.IsNullOrWhiteSpace(request.Location)) throw new ArgumentException("location is required");
            var embedding = await embeddingService.EmbedAsync(request.Description, ct);

            var job = new JobEntity
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                DescriptionEmbeddingJson = JsonSerializer.Serialize(embedding),
                ResponsibilitiesText = request.Responsibilities,
                RequiredSkillsJson = JsonSerializer.Serialize(request.RequiredSkills),
                PreferredSkillsJson = JsonSerializer.Serialize(request.PreferredSkills),
                ExperienceLevel = request.ExperienceLevel,
                MinYears = request.MinYears,
                Education = request.Education ?? request.MinEducation,
                Department = request.Department,
                Benefits = request.Benefits,
                SalaryMinPerAnnum = request.SalaryMinPerAnnum,
                SalaryMaxPerAnnum = request.SalaryMaxPerAnnum,
                Currency = string.IsNullOrWhiteSpace(request.Currency) ? "PHP" : request.Currency,
                Location = request.Location,
                Schedule = request.Schedule,
                WorkSetup = (WorkSetup)(request.WorkSetup ?? 0),
                EmploymentType = (EmploymentType)(request.EmploymentType ?? 0),
                Status = ParseStatusOrDefault(request.Status),
                CreatedAtUtc = DateTime.UtcNow,
                PostedDateUtc = ParseStatusOrDefault(request.Status) == JobStatus.Published ? DateTime.UtcNow : null,
                CompanyNameSnapshot = profile.CompanyName,
                CompanyEmailSnapshot = profile.CompanyEmail,
                JobDescriptionStructuredJson = JsonSerializer.Serialize(BuildJobDescriptionInput(request))
            };

            await jobRepository.AddAsync(job, ct);
            InvalidateRecruiterCaches(recruiterId);
            cacheService.RemoveByPrefix("jobs:public:list:");
            return Map(job);
        }

        public async Task<JobListItemResponse> UpdateJobAsync(Guid recruiterId, Guid jobId, UpdateJobRequest request, CancellationToken ct = default)
        {
            var job = await jobRepository.GetByIdAsync(jobId, ct) ?? throw new KeyNotFoundException("Job not found.");
            var embedding = await embeddingService.EmbedAsync(request.Description, ct);

            job.Title = request.Title;
            job.Description = request.Description;
            job.DescriptionEmbeddingJson = JsonSerializer.Serialize(embedding);
            job.ResponsibilitiesText = request.Responsibilities;
            job.RequiredSkillsJson = JsonSerializer.Serialize(request.RequiredSkills);
            job.PreferredSkillsJson = JsonSerializer.Serialize(request.PreferredSkills);
            job.ExperienceLevel = request.ExperienceLevel;
            job.MinYears = request.MinYears;
            job.Education = request.Education ?? request.MinEducation;
            job.Department = request.Department;
            job.Benefits = request.Benefits;
            job.SalaryMinPerAnnum = request.SalaryMinPerAnnum;
            job.SalaryMaxPerAnnum = request.SalaryMaxPerAnnum;
            job.Currency = string.IsNullOrWhiteSpace(request.Currency) ? job.Currency : request.Currency;
            job.Location = request.Location;
            job.Schedule = request.Schedule;
            job.WorkSetup = (WorkSetup)(request.WorkSetup ?? (int)job.WorkSetup);
            job.EmploymentType = (EmploymentType)(request.EmploymentType ?? (int)job.EmploymentType);
            job.Status = ParseStatusOrDefault(request.Status);
            if (job.Status == JobStatus.Published && job.PostedDateUtc is null)
            {
                job.PostedDateUtc = DateTime.UtcNow;
            }
            job.JobDescriptionStructuredJson = JsonSerializer.Serialize(BuildJobDescriptionInput(request));

            await jobRepository.UpdateAsync(job, ct);
            InvalidateAfterJobMutation(recruiterId, job.Id);
            return Map(job);
        }

        public async Task<PagedResult<JobListItemResponse>> GetJobsAsync(Guid recruiterId, int pageNumber, int pageSize, string? search, string? sortBy, string? sortDir, CancellationToken ct = default)
        {
            var cacheKey = $"jobs:recruiter:list:{recruiterId}:{pageNumber}:{pageSize}:{search}:{sortBy}:{sortDir}";
            return await cacheService.GetOrCreateAsync(cacheKey, TimeSpan.FromSeconds(30), async () =>
            {
                var query = dbContext.Jobs.AsNoTracking();
                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(x => x.Title.ToLower().Contains(search.ToLower()) || x.Location.ToLower().Contains(search.ToLower()));
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

        public async Task<JobListItemResponse?> GetJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
        {
            var job = await jobRepository.GetByIdAsync(jobId, ct);
            return job is null ? null : Map(job);
        }

        public async Task DeleteDraftJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
        {
            var job = await jobRepository.GetByIdAsync(jobId, ct) ?? throw new KeyNotFoundException("Job not found.");
            if (job.Status != JobStatus.Draft) throw new InvalidOperationException("Only draft jobs can be deleted.");
            await jobRepository.DeleteAsync(job, ct);
            InvalidateAfterJobMutation(recruiterId, jobId);
        }

        public async Task PublishJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
        {
            var job = await jobRepository.GetByIdAsync(jobId, ct) ?? throw new KeyNotFoundException("Job not found.");
            job.Status = JobStatus.Published;
            job.PostedDateUtc ??= DateTime.UtcNow;
            await jobRepository.UpdateAsync(job, ct);
            InvalidateAfterJobMutation(recruiterId, jobId);
        }

        public async Task CloseJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
        {
            var job = await jobRepository.GetByIdAsync(jobId, ct) ?? throw new KeyNotFoundException("Job not found.");
            job.Status = JobStatus.Closed;
            await jobRepository.UpdateAsync(job, ct);
            InvalidateAfterJobMutation(recruiterId, jobId);
        }

        public async Task<RecruiterDashboardResponse> GetDashboardAsync(Guid recruiterId, string? range, CancellationToken ct = default)
        {
            var normalizedRange = string.IsNullOrWhiteSpace(range) ? "last30" : range.ToLowerInvariant();
            var cacheKey = $"dashboard:recruiter:{recruiterId}:{normalizedRange}";
            return await cacheService.GetOrCreateAsync(cacheKey, TimeSpan.FromSeconds(30), async () =>
            {
                var days = normalizedRange switch { "last90" => 90, "ytd" => (DateTime.UtcNow - new DateTime(DateTime.UtcNow.Year, 1, 1)).Days + 1, _ => 30 };
                var start = DateTime.UtcNow.Date.AddDays(-days + 1);

                var jobs = await dbContext.Jobs.AsNoTracking().Where(x => x.CreatedAtUtc >= start).ToListAsync(ct);
                var jobIds = jobs.Select(x => x.Id).ToHashSet();
                var applications = await dbContext.ResumeSubmissions.AsNoTracking().Where(x => x.CreatedAtUtc >= start && jobIds.Contains(x.JobId)).ToListAsync(ct);

                var jobsOverTime = jobs.GroupBy(x => x.CreatedAtUtc.Date).Select(g => new TimePointResponse { Date = g.Key.ToString("yyyy-MM-dd"), Count = g.Count() }).OrderBy(x => x.Date).ToList();
                var appsOverTime = applications.GroupBy(x => x.CreatedAtUtc.Date).Select(g => new TimePointResponse { Date = g.Key.ToString("yyyy-MM-dd"), Count = g.Count() }).OrderBy(x => x.Date).ToList();
                var topJobs = applications.GroupBy(x => x.JobId).Select(g => new TopJobResponse { JobId = g.Key, Title = jobs.FirstOrDefault(j => j.Id == g.Key)?.Title ?? "Unknown", Applications = g.Count() }).OrderByDescending(x => x.Applications).Take(5).ToList();

                return new RecruiterDashboardResponse
                {
                    JobsPostedOverTime = jobsOverTime,
                    ApplicationsOverTime = appsOverTime,
                    TopJobsByApplications = topJobs,
                    RecommendedCount = applications.Count(x => x.Status == ResumeSubmissionStatus.Completed),
                    ShortlistedCount = applications.Count(x => x.Status == ResumeSubmissionStatus.Processing)
                };
            });
        }

        private async Task<RecruiterProfileEntity> EnsureProfileCompleteAsync(Guid recruiterId, CancellationToken ct)
        {
            var profile = await dbContext.RecruiterProfiles.FirstOrDefaultAsync(x => x.UserId == recruiterId, ct)
                ?? throw new InvalidOperationException("Recruiter profile not found.");
            if (string.IsNullOrWhiteSpace(profile.CompanyName) || string.IsNullOrWhiteSpace(profile.CompanyEmail))
            {
                throw new InvalidOperationException("Recruiter company profile must be completed before creating jobs.");
            }

            return profile;
        }

        private static JobDescriptionInput BuildJobDescriptionInput(CreateJobRequest request)
            => new()
            {
                Text = request.Description,
                Title = request.Title,
                Responsibilities = request.Responsibilities,
                RequiredSkills = request.RequiredSkills,
                PreferredSkills = request.PreferredSkills,
                ExperienceLevel = request.ExperienceLevel,
                MinYears = request.MinYears,
                Education = request.Education,
                MinEducation = request.MinEducation
            };

        private static JobDescriptionInput BuildJobDescriptionInput(UpdateJobRequest request)
            => new()
            {
                Text = request.Description,
                Title = request.Title,
                Responsibilities = request.Responsibilities,
                RequiredSkills = request.RequiredSkills,
                PreferredSkills = request.PreferredSkills,
                ExperienceLevel = request.ExperienceLevel,
                MinYears = request.MinYears,
                Education = request.Education,
                MinEducation = request.MinEducation
            };

        private static JobStatus ParseStatusOrDefault(string? status)
        {
            if (string.IsNullOrWhiteSpace(status)) return JobStatus.Draft;
            return Enum.TryParse<JobStatus>(status, true, out var parsed) ? parsed : JobStatus.Draft;
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
                CompanyName = x.CompanyNameSnapshot,
                CompanyEmail = x.CompanyEmailSnapshot,
                Description = x.Description,
                Responsibilities = x.ResponsibilitiesText,
                RequiredSkills = JsonSerializer.Deserialize<List<string>>(x.RequiredSkillsJson) ?? [],
                PreferredSkills = JsonSerializer.Deserialize<List<string>>(x.PreferredSkillsJson) ?? [],
                ExperienceLevel = x.ExperienceLevel,
                MinYears = x.MinYears,
                Education = x.Education,
                MinEducation = x.Education,
                PostedDateUtc = x.PostedDateUtc
            };

        private void InvalidateRecruiterCaches(Guid recruiterId)
        {
            cacheService.RemoveByPrefix($"jobs:recruiter:list:{recruiterId}:");
            cacheService.RemoveByPrefix($"dashboard:recruiter:{recruiterId}:");
        }

        private void InvalidateAfterJobMutation(Guid recruiterId, Guid jobId)
        {
            InvalidateRecruiterCaches(recruiterId);
            cacheService.Remove($"jobs:public:detail:{jobId}");
            cacheService.RemoveByPrefix("jobs:public:list:");
        }
    }
}