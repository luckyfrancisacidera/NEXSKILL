using System.Globalization;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SkillSense.Application.Contracts.Recruiter.Request;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Exceptions;
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
        IAppCacheService cacheService,
        ICandidateExplanationService candidateExplanationService,
        ILogger<RecruiterService> logger) : IRecruiterService
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
            if (request.NumberOfVacancies < 0) throw new ArgumentException("number_of_vacancies cannot be negative");
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
                JobDescriptionStructuredJson = JsonSerializer.Serialize(BuildNormalizedJobDescription(request)),
                NumberOfVacancies = request.NumberOfVacancies
            };

            await jobRepository.AddAsync(job, ct);
            InvalidateRecruiterCaches(recruiterId);
            cacheService.RemoveByPrefix("jobs:public:list:");
            return Map(job, job.NumberOfVacancies);
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
            if (request.NumberOfVacancies < 0) throw new ArgumentException("number_of_vacancies cannot be negative");
            job.NumberOfVacancies = request.NumberOfVacancies;
            job.Status = ParseStatusOrDefault(request.Status);

            if (job.Status == JobStatus.Published && job.PostedDateUtc is null)
            {
                job.PostedDateUtc = DateTime.UtcNow;
            }

            job.JobDescriptionStructuredJson = JsonSerializer.Serialize(BuildNormalizedJobDescription(request));

            await jobRepository.UpdateAsync(job, ct);
            InvalidateAfterJobMutation(recruiterId, job.Id);

            var remainingVacancies = await GetRemainingVacanciesByJobIdAsync(job.Id, job.NumberOfVacancies, ct);
            return Map(job, remainingVacancies);
        }

        public async Task<PagedResult<JobListItemResponse>> GetJobsAsync(Guid recruiterId, int pageNumber, int pageSize, string? search, string? department, string? sortBy, string? sortDir, CancellationToken ct = default)
        {
            var normalizedPageNumber = Math.Max(1, pageNumber);
            var normalizedPageSize = Math.Clamp(pageSize, 1, 100);
            var normalizedSearch = string.IsNullOrWhiteSpace(search) ? null : search.Trim().ToLowerInvariant();
            var normalizedDepartment = string.IsNullOrWhiteSpace(department) || department.Equals("all", StringComparison.OrdinalIgnoreCase) ? null : department.Trim();

            var cacheKey = $"jobs:recruiter:list:{recruiterId}:{normalizedPageNumber}:{normalizedPageSize}:{normalizedSearch}:{normalizedDepartment}:{sortBy}:{sortDir}";

            return await cacheService.GetOrCreateAsync(cacheKey, TimeSpan.FromSeconds(30), async () =>
            {
                var query = dbContext.Jobs.AsNoTracking().Where(x => x.RecruiterId == recruiterId);
                if (!string.IsNullOrWhiteSpace(normalizedSearch))
                {
                    query = query.Where(x => x.Title.ToLower().Contains(normalizedSearch) || x.Location.ToLower().Contains(normalizedSearch));
                }

                if (!string.IsNullOrWhiteSpace(normalizedDepartment))
                {
                    query = query.Where(x => x.Department != null && x.Department.ToLower() == normalizedDepartment.ToLower());
                }

                query = (sortBy?.ToLowerInvariant(), sortDir?.ToLowerInvariant()) switch
                {
                    ("title", "asc") => query.OrderBy(x => x.Title),
                    ("title", _) => query.OrderByDescending(x => x.Title),
                    ("createdat", "asc") => query.OrderBy(x => x.CreatedAtUtc),
                    _ => query.OrderByDescending(x => x.CreatedAtUtc)
                };

                var totalCount = await query.CountAsync(ct);
                var items = await query.Skip((normalizedPageNumber - 1) * normalizedPageSize).Take(normalizedPageSize).ToListAsync(ct);
                var remainingVacanciesByJobId = await BuildRemainingVacanciesLookupAsync(items, ct);

                return new PagedResult<JobListItemResponse>
                {
                    Items = items.Select(item => Map(item, remainingVacanciesByJobId.TryGetValue(item.Id, out var remaining) ? remaining : item.NumberOfVacancies)).ToList(),
                    PageNumber = normalizedPageNumber,
                    PageSize = normalizedPageSize,
                    TotalCount = totalCount,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)normalizedPageSize)
                };
            });
        }

        public async Task<JobListItemResponse?> GetJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
        {
            var job = await jobRepository.GetByIdForRecruiterAsync(jobId, recruiterId, ct);
            if (job is null)
            {
                return null;
            }

            var remainingVacancies = await GetRemainingVacanciesByJobIdAsync(job.Id, job.NumberOfVacancies, ct);
            return Map(job, remainingVacancies);
        }

        public async Task DeleteJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
        {
            var job = await jobRepository.GetByIdForRecruiterAsync(jobId, recruiterId, ct) ?? throw new KeyNotFoundException("Job not found.");
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

        public async Task<RecruiterDashboardResponse> GetDashboardAsync(Guid recruiterId, DateTime? startDate, DateTime? endDate, string? department, string? jobRole, string? groupBy, CancellationToken ct = default)
        {
            var normalizedStartDate = startDate?.Date;
            var normalizedEndDate = endDate?.Date;
            if (normalizedStartDate.HasValue && normalizedEndDate.HasValue && normalizedStartDate.Value > normalizedEndDate.Value)
            {
                (normalizedStartDate, normalizedEndDate) = (normalizedEndDate, normalizedStartDate);
            }

            var normalizedDepartment = string.IsNullOrWhiteSpace(department) || department.Equals("all", StringComparison.OrdinalIgnoreCase) ? null : department.Trim();
            var normalizedRole = string.IsNullOrWhiteSpace(jobRole) || jobRole.Equals("all", StringComparison.OrdinalIgnoreCase) ? null : jobRole.Trim();
            var normalizedGroupBy = string.IsNullOrWhiteSpace(groupBy) ? "month" : groupBy.Trim().ToLowerInvariant();
            if (normalizedGroupBy is not ("week" or "month" or "year" or "department" or "job"))
            {
                normalizedGroupBy = "month";
            }

            var startUtc = normalizedStartDate.HasValue ? ToUtcStartOfDay(normalizedStartDate.Value) : (DateTime?)null;
            var endExclusiveUtc = normalizedEndDate.HasValue ? ToUtcStartOfDay(normalizedEndDate.Value).AddDays(1) : (DateTime?)null;

            var cacheKey = $"dashboard:recruiter:{recruiterId}:{normalizedStartDate:yyyyMMdd}:{normalizedEndDate:yyyyMMdd}:{normalizedDepartment}:{normalizedRole}:{normalizedGroupBy}";
            return await cacheService.GetOrCreateAsync(cacheKey, TimeSpan.FromSeconds(30), async () =>
            {
                var recruiterJobsBaseQuery = dbContext.Jobs.AsNoTracking().Where(j => j.RecruiterId == recruiterId);
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

                var filterOptions = new RecruiterDashboardFilterOptionsResponse
                {
                    Departments = departments,
                    JobRoles = jobRoles,
                    JobRolesByDepartment = jobRolesByDepartment,
                };

                var effectiveRole = normalizedRole;
                if (normalizedDepartment is not null && normalizedRole is not null)
                {
                    if (!jobRolesByDepartment.TryGetValue(normalizedDepartment, out var rolesForDepartment)
                        || !rolesForDepartment.Contains(normalizedRole, StringComparer.OrdinalIgnoreCase))
                    {
                        effectiveRole = null;
                    }
                }

                var jobsQuery = recruiterJobsBaseQuery;

                if (normalizedDepartment is not null)
                {
                    jobsQuery = jobsQuery.Where(j => j.Department == normalizedDepartment);
                }

                if (effectiveRole is not null)
                {
                    jobsQuery = jobsQuery.Where(j => j.Title == effectiveRole);
                }

                var jobIds = await jobsQuery.Select(j => j.Id).ToListAsync(ct);
                var applicationsQuery = dbContext.ResumeSubmissions.AsNoTracking().Where(s => jobIds.Contains(s.JobId));
                if (startUtc.HasValue)
                {
                    applicationsQuery = applicationsQuery.Where(s => s.CreatedAtUtc >= startUtc.Value);
                }

                if (endExclusiveUtc.HasValue)
                {
                    applicationsQuery = applicationsQuery.Where(s => s.CreatedAtUtc < endExclusiveUtc.Value);
                }

                var applications = await applicationsQuery.ToListAsync(ct);

                var start = normalizedStartDate;
                var end = normalizedEndDate;
                var previousApplications = new List<ResumeSubmissionEntity>();
                if (start.HasValue && end.HasValue)
                {
                    var length = (end.Value - start.Value).Days + 1;
                    var prevStart = start.Value.AddDays(-length);
                    var prevEnd = start.Value.AddDays(-1);
                    var prevStartUtc = ToUtcStartOfDay(prevStart);
                    var prevEndExclusiveUtc = ToUtcStartOfDay(prevEnd).AddDays(1);

                    previousApplications = await dbContext.ResumeSubmissions.AsNoTracking()
                        .Where(s => jobIds.Contains(s.JobId) && s.CreatedAtUtc >= prevStartUtc && s.CreatedAtUtc < prevEndExclusiveUtc)
                        .ToListAsync(ct);
                }

                var summary = BuildSummary(applications, previousApplications);
                var jobLookup = await recruiterJobsBaseQuery
                    .Select(j => new { j.Id, j.Title, Department = j.Department ?? "Unassigned" })
                    .ToDictionaryAsync(j => j.Id, j => (j.Title, j.Department), ct);

                var trends = BuildTrends(applications, normalizedGroupBy, jobLookup);

                return new RecruiterDashboardResponse
                {
                    Filters = filterOptions,
                    Summary = summary,
                    Trends = trends,
                };
            });
        }

        public async Task<ApplicantScoresResponse> GetApplicantScoresAsync(Guid recruiterId, Guid? jobId, string? department, string? stage, string? search, int? recommendedTopPercent, int pageNumber, int pageSize, CancellationToken ct = default)
        {
            var normalizedStage = string.IsNullOrWhiteSpace(stage) ? "all" : stage.Trim().ToLowerInvariant();
            var normalizedSearch = string.IsNullOrWhiteSpace(search) ? null : search.Trim().ToLowerInvariant();
            var normalizedDepartment = string.IsNullOrWhiteSpace(department) || department.Equals("all", StringComparison.OrdinalIgnoreCase)
                ? null
                : department.Trim();
            var topPercent = Math.Clamp(recommendedTopPercent ?? 10, 1, 100);
            var normalizedPageNumber = Math.Max(1, pageNumber);
            var normalizedPageSize = Math.Clamp(pageSize, 1, 100);

            var recruiterJobs = await dbContext.Jobs
                .AsNoTracking()
                .Where(job => job.RecruiterId == recruiterId && job.Status == JobStatus.Published)
                .Select(job => new { job.Id, job.Title, Department = job.Department ?? "Unassigned" })
                .ToListAsync(ct);

            var recruiterJobsForFilter = normalizedDepartment is null
                 ? recruiterJobs
                 : recruiterJobs
                     .Where(job => job.Department.Equals(normalizedDepartment, StringComparison.OrdinalIgnoreCase))
                     .ToList();

            var submissionsBaseQuery = dbContext.ResumeSubmissions
                .AsNoTracking()
                .Join(dbContext.Jobs.AsNoTracking(), submission => submission.JobId, job => job.Id, (submission, job) => new { submission, job })
                .Join(dbContext.ResumeScores.AsNoTracking(), x => x.submission.Id, score => score.ResumeSubmissionId, (x, score) => new { x.submission, x.job, score })
                .Where(x => x.job.RecruiterId == recruiterId &&
                            x.job.Status == JobStatus.Published &&
                            (normalizedDepartment == null || (x.job.Department ?? "Unassigned") == normalizedDepartment));

            if (normalizedSearch is not null)
            {
                submissionsBaseQuery = submissionsBaseQuery.Where(x =>
                    (x.submission.FullName ?? string.Empty).ToLower().Contains(normalizedSearch) ||
                    (x.submission.Email ?? string.Empty).ToLower().Contains(normalizedSearch) ||
                    x.job.Title.ToLower().Contains(normalizedSearch));
            }

            var rawItems = await submissionsBaseQuery
                .OrderByDescending(x => x.submission.CreatedAtUtc)
                .Select(x => new
                {
                    Id = x.submission.Id,
                    FullName = x.submission.FullName,
                    Email = x.submission.Email,
                    CreatedAtUtc = x.submission.CreatedAtUtc,
                    JobId = x.submission.JobId,
                    Status = x.submission.Status,
                    JobTitle = x.job.Title,
                    JobDepartment = x.job.Department,
                    JobStatus = x.job.Status,
                    RecruiterId = x.job.RecruiterId,
                    Score = x.score.FinalWeightedScore
                })
                .ToListAsync(ct);

            var allItemsForCounts = rawItems
                .Select(x => new ApplicantScoreSourceRow(
                    x.Id,
                    x.FullName,
                    x.Email,
                    x.CreatedAtUtc,
                    x.JobId,
                    x.Status,
                    x.JobTitle,
                    x.JobDepartment,
                    x.JobStatus,
                    x.RecruiterId,
                    x.Score
                ))
                .ToList();

            var allItems = jobId.HasValue
                ? allItemsForCounts.Where(x => x.JobId == jobId.Value).ToList()
                : allItemsForCounts;

            List<ApplicantScoreItemResponse> BuildProjected(List<ApplicantScoreSourceRow> sourceItems)
            {
                var recommendedCount = sourceItems.Count == 0
                    ? 0
                    : (int)Math.Ceiling(sourceItems.Count * (topPercent / 100d));

                var recommendedIds = sourceItems
                    .OrderByDescending(x => x.Score)
                    .Take(recommendedCount)
                    .Select(x => x.Id)
                    .ToHashSet();

                return sourceItems
                    .Select(x =>
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
                    })
                    .ToList();
            }

            var projected = BuildProjected(allItems);
            var projectedForCounters = BuildProjected(allItemsForCounts);

            var filtered = normalizedStage == "all"
                ? projected
                : projected
                    .Where(x => x.SubmissionStatus.Equals(normalizedStage, StringComparison.OrdinalIgnoreCase))
                    .ToList();

            filtered = filtered
                .OrderByDescending(x => x.Score)
                .ThenByDescending(x => x.CreatedAtUtc)
                .ToList();

            var totalCount = filtered.Count;
            var totalPages = totalCount == 0 ? 1 : (int)Math.Ceiling(totalCount / (double)normalizedPageSize);
            var pagedItems = filtered
                .Skip((normalizedPageNumber - 1) * normalizedPageSize)
                .Take(normalizedPageSize)
                .ToList();

            var projectedByJobId = projectedForCounters
                .GroupBy(x => x.JobId)
                .ToDictionary(group => group.Key, group => group.ToList());

            var jobs = recruiterJobsForFilter
                .Select(job =>
                {
                    var hasValues = projectedByJobId.TryGetValue(job.Id, out var itemsForJob);
                    var safeItems = hasValues && itemsForJob is not null
                        ? itemsForJob
                        : new List<ApplicantScoreItemResponse>();

                    return new ApplicantScoreJobFilterResponse
                    {
                        Id = job.Id,
                        Title = job.Title,
                        Department = job.Department,
                        AllApplicants = safeItems.Count,
                        Recommended = safeItems.Count(x => x.SubmissionStatus == "Recommended"),
                        Shortlisted = safeItems.Count(x => x.SubmissionStatus == "Shortlisted"),
                        Interview = safeItems.Count(x => x.SubmissionStatus == "Interview"),
                        Offer = safeItems.Count(x => x.SubmissionStatus == "Offer"),
                        Hire = safeItems.Count(x => x.SubmissionStatus == "Hire"),
                    };
                })
                .OrderBy(x => x.Title)
                .ToList();

            var departments = recruiterJobs
                .Select(x => x.Department)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(x => x)
                .ToList();

            return new ApplicantScoresResponse
            {
                Items = pagedItems,
                PageNumber = normalizedPageNumber,
                PageSize = normalizedPageSize,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Jobs = jobs,
                Departments = departments,
                Counts = new ApplicantScoreCountsResponse
                {
                    AllApplicants = projectedForCounters.Count,
                    Recommended = projectedForCounters.Count(x => x.SubmissionStatus == "Recommended"),
                    Shortlisted = projectedForCounters.Count(x => x.SubmissionStatus == "Shortlisted"),
                    Interview = projectedForCounters.Count(x => x.SubmissionStatus == "Interview"),
                    Offer = projectedForCounters.Count(x => x.SubmissionStatus == "Offer"),
                    Hire = projectedForCounters.Count(x => x.SubmissionStatus == "Hire"),
                },
                Recommendation = new RecommendationSettingsResponse
                {
                    TopPercent = topPercent,
                }
            };
        }

        public async Task<ApplicantDetailResponse?> GetApplicantBySubmissionIdAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default)
        {
            var baseItem = (await GetApplicantScoresAsync(recruiterId, null, null, "all", null, 10, 1, 500, ct))
                 .Items
                 .FirstOrDefault(x => x.ResumeSubmissionId == submissionId);

            if (baseItem is null)
            {
                return null;
            }

            var parsedResumeJson = await dbContext.ResumeSubmissions
                .AsNoTracking()
                .Where(s => s.Id == submissionId)
                .Where(s => dbContext.Jobs.Any(j => j.Id == s.JobId && j.RecruiterId == recruiterId))
                .Select(s => s.ParsedResumeJson)
                .FirstOrDefaultAsync(ct);

            CandidateExplanationResponse? explanation = null;
            if (baseItem.SubmissionStatus == "Shortlisted")
            {
                var explanationEntity = await dbContext.CandidateExplanations
                    .AsNoTracking()
                    .Where(x => x.ResumeSubmissionId == submissionId && x.Status == ExplanationStatus.Succeeded)
                    .FirstOrDefaultAsync(ct);

                if (explanationEntity is not null)
                {
                    explanation = new CandidateExplanationResponse
                    {
                        Provider = explanationEntity.Provider,
                        Model = explanationEntity.Model,
                        Summary = explanationEntity.Summary,
                        Strengths = DeserializeListOrEmpty(explanationEntity.StrengthsJson),
                        Gaps = DeserializeListOrEmpty(explanationEntity.GapsJson),
                        ExplanationText = explanationEntity.ExplanationText,
                        GeneratedAtUtc = explanationEntity.GeneratedAtUtc,
                    };
                }
            }


            return new ApplicantDetailResponse
            {
                ResumeSubmissionId = baseItem.ResumeSubmissionId,
                ApplicantName = baseItem.ApplicantName,
                ApplicantEmail = baseItem.ApplicantEmail,
                JobId = baseItem.JobId,
                JobTitle = baseItem.JobTitle,
                Score = baseItem.Score,
                SubmissionStatus = baseItem.SubmissionStatus,
                JobseekerStage = baseItem.JobseekerStage,
                CreatedAtUtc = baseItem.CreatedAtUtc,
                ParsedResumeJson = ParseResumeJsonElement(parsedResumeJson),
                CandidateExplanation = explanation,
            };

        }

        public async Task UpdateApplicantStatusAsync(Guid recruiterId, Guid submissionId, UpdateApplicantStageRequest request, CancellationToken ct = default)
        {
            var action = ResolveAction(request.Action, request.Status);

            await using var transaction = await dbContext.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);
            var submission = await dbContext.ResumeSubmissions.FirstOrDefaultAsync(s => s.Id == submissionId, ct)
                ?? throw new KeyNotFoundException("Submission not found.");
            var job = await dbContext.Jobs.FirstOrDefaultAsync(j => j.Id == submission.JobId && j.RecruiterId == recruiterId, ct)
                ?? throw new KeyNotFoundException("Submission not found.");

            var nextStatus = ResolveNextStatus(submission.Status, action);

            var now = DateTime.UtcNow;
            if (nextStatus == ResumeSubmissionStatus.Hire && submission.Status != ResumeSubmissionStatus.Hire)
            {
                var hiredCount = await dbContext.ResumeSubmissions.CountAsync(s => s.JobId == job.Id && s.Status == ResumeSubmissionStatus.Hire, ct);
                if (hiredCount >= job.NumberOfVacancies)
                {
                    throw new InvalidOperationException("Cannot hire applicant. The number of vacancies for this position has already been filled.");
                }
            }

            submission.Status = nextStatus;
            submission.UpdatedAtUtc = now;
            await dbContext.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            if (nextStatus == ResumeSubmissionStatus.Shortlisted)
            {
                try
                {
                    await candidateExplanationService.GenerateForShortlistedAsync(recruiterId, submissionId, CancellationToken.None);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Shortlist succeeded but explanation generation failed for submission {SubmissionId}", submissionId);
                }
            }

            cacheService.RemoveByPrefix($"dashboard:recruiter:{recruiterId}:");
        }

        public async Task<BulkUpdateApplicantStageResponse> UpdateApplicantStatusesAsync(Guid recruiterId, BulkUpdateApplicantStageRequest request, CancellationToken ct = default)
        {
            var action = ResolveAction(request.Action, request.Status);
            var submissionIds = request.SubmissionIds.Distinct().ToList();
            var results = new List<BulkUpdateApplicantStageResultItemResponse>(submissionIds.Count);

            foreach (var submissionId in submissionIds)
            {
                try
                {
                    await UpdateApplicantStatusAsync(recruiterId, submissionId, new UpdateApplicantStageRequest
                    {
                        Action = request.Action,
                        Status = request.Status,
                    }, ct);

                    results.Add(new BulkUpdateApplicantStageResultItemResponse
                    {
                        SubmissionId = submissionId,
                        Success = true,
                        Message = "Applicant stage updated successfully.",
                    });
                }
                catch (InvalidStageTransitionException ex)
                {
                    results.Add(new BulkUpdateApplicantStageResultItemResponse
                    {
                        SubmissionId = submissionId,
                        Success = false,
                        Message = ex.Message,
                    });
                }
                catch (KeyNotFoundException ex)
                {
                    results.Add(new BulkUpdateApplicantStageResultItemResponse
                    {
                        SubmissionId = submissionId,
                        Success = false,
                        Message = ex.Message,
                    });
                }
                catch (InvalidOperationException ex)
                {
                    results.Add(new BulkUpdateApplicantStageResultItemResponse
                    {
                        SubmissionId = submissionId,
                        Success = false,
                        Message = ex.Message,
                    });
                }

            }

            cacheService.RemoveByPrefix($"dashboard:recruiter:{recruiterId}:");

            return new BulkUpdateApplicantStageResponse
            {
                Action = action,
                RequestedCount = request.SubmissionIds.Count,
                ProcessedCount = results.Count,
                SuccessCount = results.Count(x => x.Success),
                FailureCount = results.Count(x => !x.Success),
                Results = results,
            };
        }

        private static List<string> DeserializeListOrEmpty(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return [];
            try
            {
                return JsonSerializer.Deserialize<List<string>>(json) ?? [];
            }
            catch (JsonException)
            {
                return [];
            }
        }

        private static string ResolveAction(string? requestedAction, string? requestedStatus)
        {
            if (!string.IsNullOrWhiteSpace(requestedAction))
            {
                return requestedAction.Trim().ToLowerInvariant();
            }

            if (string.IsNullOrWhiteSpace(requestedStatus))
            {
                throw new ArgumentException("Action is required.");
            }

            if (!Enum.TryParse<ResumeSubmissionStatus>(requestedStatus, true, out var parsedStatus))
            {
                throw new ArgumentException("Invalid applicant status.");
            }

            return parsedStatus switch
            {
                ResumeSubmissionStatus.Shortlisted => "shortlist",
                ResumeSubmissionStatus.Interview => "set-interview",
                ResumeSubmissionStatus.Offer => "offer",
                ResumeSubmissionStatus.Hire => "hire",
                ResumeSubmissionStatus.Rejected => "reject",
                _ => throw new ArgumentException("Invalid applicant status.")
            };
        }

        private static readonly IReadOnlyDictionary<string, IReadOnlySet<ResumeSubmissionStatus>> AllowedTransitionsByAction =
            new Dictionary<string, IReadOnlySet<ResumeSubmissionStatus>>(StringComparer.OrdinalIgnoreCase)
            {
                ["shortlist"] = new HashSet<ResumeSubmissionStatus>
                {
                    ResumeSubmissionStatus.Completed,
                    ResumeSubmissionStatus.Shortlisted,
                    ResumeSubmissionStatus.Interview,
                },
                ["set-interview"] = new HashSet<ResumeSubmissionStatus>
                {
                    ResumeSubmissionStatus.Shortlisted,
                    ResumeSubmissionStatus.Interview,
                },
                ["offer"] = new HashSet<ResumeSubmissionStatus>
                {
                    ResumeSubmissionStatus.Interview,
                    ResumeSubmissionStatus.Offer,
                },
                ["hire"] = new HashSet<ResumeSubmissionStatus>
                {
                    ResumeSubmissionStatus.Offer,
                    ResumeSubmissionStatus.Hire,
                },
                ["reject"] = new HashSet<ResumeSubmissionStatus>
                {
                    ResumeSubmissionStatus.Completed,
                    ResumeSubmissionStatus.Shortlisted,
                    ResumeSubmissionStatus.Interview,
                    ResumeSubmissionStatus.Offer,
                    ResumeSubmissionStatus.Hire,
                },
                ["remove-shortlist"] = new HashSet<ResumeSubmissionStatus>
                {
                    ResumeSubmissionStatus.Shortlisted,
                    ResumeSubmissionStatus.Interview,
                },
            };

        private static ResumeSubmissionStatus ResolveNextStatus(ResumeSubmissionStatus currentStatus, string action)
        {
            if (!AllowedTransitionsByAction.TryGetValue(action, out var allowedStatuses) || !allowedStatuses.Contains(currentStatus))
            {
                throw new InvalidStageTransitionException(action, currentStatus.ToString());
            }

            return action switch
            {
                "shortlist" => ResumeSubmissionStatus.Shortlisted,
                "set-interview" => ResumeSubmissionStatus.Interview,
                "offer" => ResumeSubmissionStatus.Offer,
                "hire" => ResumeSubmissionStatus.Hire,
                "reject" => ResumeSubmissionStatus.Rejected,
                "remove-shortlist" when currentStatus == ResumeSubmissionStatus.Shortlisted => ResumeSubmissionStatus.Completed,
                "remove-shortlist" when currentStatus == ResumeSubmissionStatus.Interview => ResumeSubmissionStatus.Interview,
                _ => throw new InvalidStageTransitionException(action, currentStatus.ToString()),
            };
        }

        private static JsonElement? ParseResumeJsonElement(string? parsedResumeJson)
        {
            if (string.IsNullOrWhiteSpace(parsedResumeJson))
            {
                return null;
            }

            try
            {
                using var document = JsonDocument.Parse(parsedResumeJson);
                return document.RootElement.Clone();
            }
            catch (JsonException)
            {
                return null;
            }
        }


        private sealed record ApplicantScoreSourceRow(
            Guid Id,
            string? FullName,
            string? Email,
            DateTime CreatedAtUtc,
            Guid JobId,
            ResumeSubmissionStatus Status,
            string JobTitle,
            string? JobDepartment,
            JobStatus JobStatus,
            Guid RecruiterId,
            float Score);

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


        private static RecruiterDashboardSummaryResponse BuildSummary(IReadOnlyCollection<ResumeSubmissionEntity> current, IReadOnlyCollection<ResumeSubmissionEntity> previous)
            => new()
            {
                TotalApplicants = BuildMetric(current.Count(), previous.Count()),
                TotalShortlisted = BuildMetric(current.Count(x => x.Status == ResumeSubmissionStatus.Shortlisted), previous.Count(x => x.Status == ResumeSubmissionStatus.Shortlisted)),
                TotalInterview = BuildMetric(current.Count(x => x.Status == ResumeSubmissionStatus.Interview), previous.Count(x => x.Status == ResumeSubmissionStatus.Interview)),
                TotalOffer = BuildMetric(current.Count(x => x.Status == ResumeSubmissionStatus.Offer), previous.Count(x => x.Status == ResumeSubmissionStatus.Offer)),
                TotalHired = BuildMetric(current.Count(x => x.Status == ResumeSubmissionStatus.Hire), previous.Count(x => x.Status == ResumeSubmissionStatus.Hire)),
            };

        private static MetricWithComparisonResponse BuildMetric(int current, int previous)
        {
            var percent = previous <= 0 ? 0 : Math.Round(((decimal)(current - previous) / previous) * 100, 2);
            return new MetricWithComparisonResponse
            {
                Value = current,
                PreviousValue = previous,
                ComparisonPercent = percent,
            };
        }

        private static RecruiterDashboardTrendsResponse BuildTrends(IReadOnlyCollection<ResumeSubmissionEntity> applications, string groupBy, IReadOnlyDictionary<Guid, (string Title, string Department)> jobLookup)
        {
            string ResolveLabel(ResumeSubmissionEntity item)
                => groupBy switch
                {
                    "week" => $"W{ISOWeek.GetWeekOfYear(item.CreatedAtUtc)} {item.CreatedAtUtc.Year}",
                    "month" => item.CreatedAtUtc.ToString("yyyy-MM"),
                    "year" => item.CreatedAtUtc.Year.ToString(),
                    "department" => jobLookup.TryGetValue(item.JobId, out var job) ? job.Department : "Unassigned",
                    "job" => jobLookup.TryGetValue(item.JobId, out var j) ? j.Title : "Unknown",
                    _ => item.CreatedAtUtc.ToString("yyyy-MM")
                };

            var labels = applications.Select(ResolveLabel).Distinct().OrderBy(x => x).ToList();
            var metricsByLabel = labels.ToDictionary(label => label, _ => new TrendAccumulator());

            foreach (var application in applications)
            {
                var label = ResolveLabel(application);
                if (!metricsByLabel.TryGetValue(label, out var metric))
                {
                    continue;
                }

                metric.Applicants++;
                if (application.Status == ResumeSubmissionStatus.Shortlisted)
                {
                    metric.Shortlisted++;
                }
                else if (application.Status == ResumeSubmissionStatus.Interview)
                {
                    metric.Interview++;
                }
                else if (application.Status == ResumeSubmissionStatus.Hire)
                {
                    metric.Hired++;
                }
            }

            var datasets = new List<TrendDatasetResponse>
            {
                CreateTrendDataset("applicants", "Applicants", "#4F46E5", "rgba(79,70,229,0.2)", labels, metricsByLabel, x => x.Applicants),
                CreateTrendDataset("shortlisted", "Shortlisted", "#0EA5E9", "rgba(14,165,233,0.18)", labels, metricsByLabel, x => x.Shortlisted),
                CreateTrendDataset("interview", "Interview", "#F59E0B", "rgba(245,158,11,0.18)", labels, metricsByLabel, x => x.Interview),
                CreateTrendDataset("hired", "Hired", "#10B981", "rgba(16,185,129,0.18)", labels, metricsByLabel, x => x.Hired),
            };

            return new RecruiterDashboardTrendsResponse
            {
                Labels = labels,
                Datasets = datasets,
            };
        }

        private static TrendDatasetResponse CreateTrendDataset(
            string key,
            string label,
            string borderColor,
            string backgroundColor,
            IReadOnlyList<string> labels,
            IReadOnlyDictionary<string, TrendAccumulator> metricsByLabel,
            Func<TrendAccumulator, int> selector)
            => new()
            {
                Key = key,
                Label = label,
                BorderColor = borderColor,
                BackgroundColor = backgroundColor,
                Data = labels.Select(x => selector(metricsByLabel[x])).ToList(),
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

        private static JobListItemResponse Map(JobEntity x, int remainingVacancies)
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
                PostedDateUtc = x.PostedDateUtc,
                NumberOfVacancies = x.NumberOfVacancies,
                RemainingVacancies = Math.Max(0, remainingVacancies)
            };

        private async Task<Dictionary<Guid, int>> BuildRemainingVacanciesLookupAsync(IReadOnlyCollection<JobEntity> jobs, CancellationToken ct)
        {
            var jobIds = jobs.Select(x => x.Id).Distinct().ToList();
            if (jobIds.Count == 0)
            {
                return [];
            }

            var hiredCounts = await dbContext.ResumeSubmissions
                .AsNoTracking()
                .Where(x => jobIds.Contains(x.JobId) && x.Status == ResumeSubmissionStatus.Hire)
                .GroupBy(x => x.JobId)
                .Select(x => new { JobId = x.Key, Count = x.Count() })
                .ToDictionaryAsync(x => x.JobId, x => x.Count, ct);

            return jobs.ToDictionary(
                job => job.Id,
                job => Math.Max(0, job.NumberOfVacancies - hiredCounts.GetValueOrDefault(job.Id)));
        }

        private async Task<int> GetRemainingVacanciesByJobIdAsync(Guid jobId, int numberOfVacancies, CancellationToken ct)
        {
            var hiredCount = await dbContext.ResumeSubmissions
                .AsNoTracking()
                .CountAsync(x => x.JobId == jobId && x.Status == ResumeSubmissionStatus.Hire, ct);

            return Math.Max(0, numberOfVacancies - hiredCount);
        }

        private sealed class TrendAccumulator
        {
            public int Applicants { get; set; }
            public int Shortlisted { get; set; }
            public int Interview { get; set; }
            public int Hired { get; set; }
        }

        private static DateTime ToUtcStartOfDay(DateTime date)
            => DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);

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