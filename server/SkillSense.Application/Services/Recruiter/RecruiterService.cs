using System.Text.Json;
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
                RecruiterId = recruiterId,
                Title = request.Title,
                Description = request.Description,
                DescriptionEmbeddingJson = JsonSerializer.Serialize(embedding),
                ResponsibilitiesText = NormalizeMultilineText(request.Responsibilities),
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
                JobDescriptionStructuredJson = JsonSerializer.Serialize(BuildNormalizedJobDescription(request))
            };

            await jobRepository.AddAsync(job, ct);
            InvalidateRecruiterCaches(recruiterId);
            cacheService.RemoveByPrefix("jobs:public:list:");
            return Map(job);
        }

        public async Task<JobListItemResponse> UpdateJobAsync(Guid recruiterId, Guid jobId, UpdateJobRequest request, CancellationToken ct = default)
        {
            var job = await jobRepository.GetByIdForRecruiterAsync(jobId, recruiterId, ct) ?? throw new KeyNotFoundException("Job not found.");
            var embedding = await embeddingService.EmbedAsync(request.Description, ct);

            job.Title = request.Title;
            job.Description = request.Description;
            job.DescriptionEmbeddingJson = JsonSerializer.Serialize(embedding);
            job.ResponsibilitiesText = NormalizeMultilineText(request.Responsibilities);
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

            job.JobDescriptionStructuredJson = JsonSerializer.Serialize(BuildNormalizedJobDescription(request));

            await jobRepository.UpdateAsync(job, ct);
            InvalidateAfterJobMutation(recruiterId, job.Id);
            return Map(job);
        }

        public async Task<PagedResult<JobListItemResponse>> GetJobsAsync(Guid recruiterId, int pageNumber, int pageSize, string? search, string? sortBy, string? sortDir, CancellationToken ct = default)
        {
            var cacheKey = $"jobs:recruiter:list:{recruiterId}:{pageNumber}:{pageSize}:{search}:{sortBy}:{sortDir}";
            return await cacheService.GetOrCreateAsync(cacheKey, TimeSpan.FromSeconds(30), async () =>
            {
                var query = dbContext.Jobs.AsNoTracking().Where(x => x.RecruiterId == recruiterId);
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
            var job = await jobRepository.GetByIdForRecruiterAsync(jobId, recruiterId, ct);
            return job is null ? null : Map(job);
        }

        public async Task DeleteDraftJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
        {
            var job = await jobRepository.GetByIdForRecruiterAsync(jobId, recruiterId, ct) ?? throw new KeyNotFoundException("Job not found.");
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

                var jobs = await dbContext.Jobs.AsNoTracking().Where(x => x.RecruiterId == recruiterId && x.CreatedAtUtc >= start).ToListAsync(ct);
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

        public async Task<ApplicantScoresResponse> GetApplicantScoresAsync(Guid recruiterId, Guid? jobId, string? stage, string? search, int? recommendedTopPercent, CancellationToken ct = default)
        {
            var normalizedStage = string.IsNullOrWhiteSpace(stage) ? "all" : stage.Trim().ToLowerInvariant();
            var normalizedSearch = string.IsNullOrWhiteSpace(search) ? null : search.Trim().ToLowerInvariant();
            var topPercent = Math.Clamp(recommendedTopPercent ?? 10, 1, 100);

            var submissionsQuery = dbContext.ResumeSubmissions
                .AsNoTracking()
                .Join(dbContext.Jobs.AsNoTracking(), submission => submission.JobId, job => job.Id, (submission, job) => new { submission, job })
                .Join(dbContext.ResumeScores.AsNoTracking(), x => x.submission.Id, score => score.ResumeSubmissionId, (x, score) => new
                {
                    x.submission.Id,
                    x.submission.FullName,
                    x.submission.Email,
                    x.submission.CreatedAtUtc,
                    x.submission.JobId,
                    x.submission.Status,
                    JobTitle = x.job.Title,
                    x.job.RecruiterId,
                    Score = score.FinalWeightedScore
                })
                .Where(x => x.RecruiterId == recruiterId && (!jobId.HasValue || x.JobId == jobId.Value));

            if (normalizedSearch is not null)
            {
                submissionsQuery = submissionsQuery.Where(x =>
                    (x.FullName ?? string.Empty).ToLower().Contains(normalizedSearch) ||
                    (x.Email ?? string.Empty).ToLower().Contains(normalizedSearch) ||
                    x.JobTitle.ToLower().Contains(normalizedSearch));
            }

            var allItems = await submissionsQuery
                .OrderByDescending(x => x.CreatedAtUtc)
                .ToListAsync(ct);

            var recommendedCount = allItems.Count == 0 ? 0 : (int)Math.Ceiling(allItems.Count * (topPercent / 100d));
            var recommendedIds = allItems
                .OrderByDescending(x => x.Score)
                .Take(recommendedCount)
                .Select(x => x.Id)
                .ToHashSet();

            var projected = allItems.Select(x =>
            {
                var score = (int)Math.Round(x.Score);
                return new ApplicantScoreItemResponse
                {
                    ResumeSubmissionId = x.Id,
                    ApplicantName = string.IsNullOrWhiteSpace(x.FullName) ? "Unknown Applicant" : x.FullName!,
                    ApplicantEmail = string.IsNullOrWhiteSpace(x.Email) ? "-" : x.Email!,
                    JobId = x.JobId,
                    JobTitle = x.JobTitle,
                    Score = score,
                    SubmissionStatus = ResolveSubmissionStatus(x.Status, recommendedIds.Contains(x.Id)),
                    JobseekerStage = ResolveJobseekerStage(x.Status),
                    CreatedAtUtc = x.CreatedAtUtc,
                };
            }).ToList();

            var filtered = normalizedStage == "all"
                ? projected
                : projected.Where(x => x.SubmissionStatus.Equals(normalizedStage, StringComparison.OrdinalIgnoreCase)).ToList();

            var jobs = projected
                .GroupBy(x => new { x.JobId, x.JobTitle })
                .Select(group => new ApplicantScoreJobFilterResponse
                {
                    Id = group.Key.JobId,
                    Title = group.Key.JobTitle,
                    AllApplicants = group.Count(),
                    Recommended = group.Count(x => x.SubmissionStatus == "Recommended"),
                    Shortlisted = group.Count(x => x.SubmissionStatus == "Shortlisted"),
                    Interview = group.Count(x => x.SubmissionStatus == "Interview"),
                    Offer = group.Count(x => x.SubmissionStatus == "Offer"),
                    Hire = group.Count(x => x.SubmissionStatus == "Hire"),
                })
                .OrderBy(x => x.Title)
                .ToList();

            return new ApplicantScoresResponse
            {
                Items = filtered,
                Jobs = jobs,
                Counts = new ApplicantScoreCountsResponse
                {
                    AllApplicants = projected.Count,
                    Recommended = projected.Count(x => x.SubmissionStatus == "Recommended"),
                    Shortlisted = projected.Count(x => x.SubmissionStatus == "Shortlisted"),
                    Interview = projected.Count(x => x.SubmissionStatus == "Interview"),
                    Offer = projected.Count(x => x.SubmissionStatus == "Offer"),
                    Hire = projected.Count(x => x.SubmissionStatus == "Hire"),
                },
                Recommendation = new RecommendationSettingsResponse
                {
                    TopPercent = topPercent,
                }
            };
        }

        public async Task<ApplicantScoreItemResponse?> GetApplicantBySubmissionIdAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default)
        {
            var data = await GetApplicantScoresAsync(recruiterId, null, "all", null, 10, ct);
            return data.Items.FirstOrDefault(x => x.ResumeSubmissionId == submissionId);
        }

        public async Task UpdateApplicantStatusAsync(Guid recruiterId, Guid submissionId, UpdateApplicantStageRequest request, CancellationToken ct = default)
        {
            if (!Enum.TryParse<ResumeSubmissionStatus>(request.Status, true, out var parsed))
            {
                throw new ArgumentException("Invalid applicant status.");
            }

            var now = DateTime.UtcNow;
            var updatedRows = await dbContext.ResumeSubmissions
                .Where(s => s.Id == submissionId)
                .Where(s => dbContext.Jobs.Any(j => j.Id == s.JobId && j.RecruiterId == recruiterId))
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(s => s.Status, parsed)
                    .SetProperty(s => s.UpdatedAtUtc, now), ct);

            if (updatedRows == 0)
            {
                throw new KeyNotFoundException("Submission not found.");
            }

            cacheService.RemoveByPrefix($"dashboard:recruiter:{recruiterId}:");
        }

        public async Task UpdateApplicantStatusesAsync(Guid recruiterId, BulkUpdateApplicantStageRequest request, CancellationToken ct = default)
        {
            if (!Enum.TryParse<ResumeSubmissionStatus>(request.Status, true, out var parsed))
            {
                throw new ArgumentException("Invalid applicant status.");
            }

            var submissionIds = request.SubmissionIds.Distinct().ToList();
            if (submissionIds.Count == 0)
            {
                return;
            }

            var now = DateTime.UtcNow;
            await dbContext.ResumeSubmissions
                .Where(s => submissionIds.Contains(s.Id))
                .Where(s => dbContext.Jobs.Any(j => j.Id == s.JobId && j.RecruiterId == recruiterId))
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(s => s.Status, parsed)
                    .SetProperty(s => s.UpdatedAtUtc, now), ct);

            cacheService.RemoveByPrefix($"dashboard:recruiter:{recruiterId}:");
        }


        private static string ResolveJobseekerStage(ResumeSubmissionStatus status)
            => status switch
            {
                ResumeSubmissionStatus.Shortlisted => "Applied",
                ResumeSubmissionStatus.Interview => "Interview",
                ResumeSubmissionStatus.Offer => "Offer",
                ResumeSubmissionStatus.Hire => "Offer",
                ResumeSubmissionStatus.Rejected => "Rejected",
                _ => "Applied",
            };

        private static string ResolveSubmissionStatus(ResumeSubmissionStatus status, bool isRecommended)
            => status switch
            {
                ResumeSubmissionStatus.Shortlisted => "Shortlisted",
                ResumeSubmissionStatus.Interview => "Interview",
                ResumeSubmissionStatus.Offer => "Offer",
                ResumeSubmissionStatus.Hire => "Hire",
                ResumeSubmissionStatus.Rejected => "Rejected",
                _ => isRecommended ? "Recommended" : "Applied",
            };


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

        private static NormalizedJobDescription BuildNormalizedJobDescription(CreateJobRequest request)
            => new()
            {
                Title = request.Title ?? string.Empty,
                Description = request.Description ?? string.Empty,
                Responsibilities = (request.Responsibilities ?? string.Empty).Split(new[] { "\n", ";", "." }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
                RequiredSkills = request.RequiredSkills,
                PreferredSkills = request.PreferredSkills,
                MinimumYearsExperience = request.MinYears ?? 0,
                MinimumEducationLevel = request.MinEducation ?? request.Education ?? string.Empty,
                EducationRequirements = string.IsNullOrWhiteSpace(request.Education) ? [] : [request.Education],
                Metadata = new Dictionary<string, string> { ["experience_level"] = request.ExperienceLevel ?? string.Empty }
            };

        private static NormalizedJobDescription BuildNormalizedJobDescription(UpdateJobRequest request)
            => new()
            {
                Title = request.Title ?? string.Empty,
                Description = request.Description ?? string.Empty,
                Responsibilities = (request.Responsibilities ?? string.Empty).Split(new[] { "\n", ";", "." }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
                RequiredSkills = request.RequiredSkills,
                PreferredSkills = request.PreferredSkills,
                MinimumYearsExperience = request.MinYears ?? 0,
                MinimumEducationLevel = request.MinEducation ?? request.Education ?? string.Empty,
                EducationRequirements = string.IsNullOrWhiteSpace(request.Education) ? [] : [request.Education],
                Metadata = new Dictionary<string, string> { ["experience_level"] = request.ExperienceLevel ?? string.Empty }
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
                Responsibilities = NormalizeMultilineText(x.ResponsibilitiesText),
                RequiredSkills = JsonSerializer.Deserialize<List<string>>(x.RequiredSkillsJson) ?? [],
                PreferredSkills = JsonSerializer.Deserialize<List<string>>(x.PreferredSkillsJson) ?? [],
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