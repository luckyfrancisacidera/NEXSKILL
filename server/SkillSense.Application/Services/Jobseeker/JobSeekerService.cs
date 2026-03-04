using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SkillSense.Application.Contracts.Jobseeker.Request;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Jobseeker;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services.Jobseeker
{
    public sealed class JobSeekerService(
        IJobSeekerRepository jobSeekerRepository,
        IResumeUploadService resumeUploadService,
        IAppCacheService cacheService) : IJobSeekerService
    {
        public async Task<PagedResult<JobListItemResponse>> GetPublicJobsAsync(int pageNumber, int pageSize, string? search, string? sortBy, string? sortDir, CancellationToken ct = default)
        {
            var cacheKey = $"jobs:public:list:{pageNumber}:{pageSize}:{search}:{sortBy}:{sortDir}";
            return await cacheService.GetOrCreateAsync(cacheKey, TimeSpan.FromSeconds(60), async () =>
            {
                var pagedJobs = await jobSeekerRepository.GetPublishedJobsAsync(pageNumber, pageSize, search, sortBy, sortDir, ct);

               
                return new PagedResult<JobListItemResponse>
                {
                    Items = pagedJobs.Items.Select(Map).ToList(),
                    PageNumber = pagedJobs.PageNumber,
                    PageSize = pagedJobs.PageSize,
                    TotalCount = pagedJobs.TotalCount,
                    TotalPages = pagedJobs.TotalPages
                };
            });
        }

        public async Task<JobListItemResponse?> GetPublicJobAsync(Guid id, CancellationToken ct = default)
        {
            return await cacheService.GetOrCreateAsync($"jobs:public:detail:{id}", TimeSpan.FromSeconds(120), async () =>
            {
                var job = await jobSeekerRepository.GetPublishedJobByIdAsync(id, ct);
                return job is null ? null : Map(job);
            });
        }

        public async Task<ResumeUploadResponse> ApplyAsync(Guid jobId, ApplyToJobRequest request, Stream fileStream, string fileName, string contentType, CancellationToken ct = default)
        {
            var job = await jobSeekerRepository.GetPublishedJobByIdAsync(jobId, ct)
                ?? throw new InvalidOperationException("Published job not found.");

            var response = await resumeUploadService.EnqueueUploadAsync(fileStream, fileName, contentType, jobId, job.Title, request.FullName, request.Email, request.PostalCode, request.Location, null, ct);
            cacheService.RemoveByPrefix("dashboard:recruiter:");
            return response;
        }

        public async Task<PagedResult<object>> GetMyApplicationsAsync(Guid userId, int pageNumber, int pageSize, CancellationToken ct = default)
        {
            var pagedApplications = await jobSeekerRepository.GetApplicationsByUserAsync(userId, pageNumber, pageSize, ct);

            return new PagedResult<object>
            {
                Items = pagedApplications.Items.Select(x => (object)new
                {
                    id = x.Id,
                    job_id = x.JobId,
                    full_name = x.FullName,
                    email = x.Email,
                    status = ResolveJobseekerApplicationStatus(x.Status),
                    created_at_utc = x.CreatedAtUtc
                }).ToList(),
                PageNumber = pagedApplications.PageNumber,
                PageSize = pagedApplications.PageSize,
                TotalCount = pagedApplications.TotalCount,
                TotalPages = pagedApplications.TotalPages
            };
        }

        private static string ResolveJobseekerApplicationStatus(string? status)
            => status?.Trim().ToLowerInvariant() switch
            {
                    "shortlisted" => "Applied",
                    "interview" => "Interview",
                    "offer" => "Offer",
                    "hire" => "Offer",
                    "rejected" => "Rejected",
                    _ => "Applied",
            };

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
                Description = NormalizeMultilineText(x.Description),
                Responsibilities = NormalizeMultilineText(x.ResponsibilitiesText),
                ExperienceLevel = x.ExperienceLevel,
                MinYears = x.MinYears,
                Education = x.Education,
                MinEducation = x.Education,
                PostedDateUtc = x.PostedDateUtc
            };
        private static string NormalizeMultilineText(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return string.Empty;

            var lines = text
                .Split('\n', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                .Select(line => line.Replace("\r", string.Empty).Trim());

            return string.Join(Environment.NewLine, lines);
        }
    }
}
