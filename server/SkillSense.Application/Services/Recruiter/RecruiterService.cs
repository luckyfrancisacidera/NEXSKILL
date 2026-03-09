using System.Text.Json;
using Microsoft.Extensions.Logging;
using SkillSense.Application.Common.Jobs;
using SkillSense.Application.Common.Recruiter;
using SkillSense.Application.Common.Text;
using SkillSense.Application.Contracts.Recruiter.Request;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Recruiter;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Application.Services.Recruiter;

/// <summary>
/// Coordinates recruiter-facing workflows for profile management, job administration, dashboards, and applicant review.
/// </summary>
/// <remarks>
/// This service preserves the existing recruiter behavior while delegating database access to persistence repositories
/// and extracting reusable normalization and projection helpers into application common components.
/// </remarks>
public sealed class RecruiterService(
    IRecruiterRepository recruiterRepository,
    IJobRepository jobRepository,
    ICandidateExplanationRepository candidateExplanationRepository,
    ITextEmbeddingService embeddingService,
    IAppCacheService cacheService,
    ICandidateExplanationService candidateExplanationService,
    ILogger<RecruiterService> logger) : IRecruiterService
{
    /// <summary>
    /// Returns the recruiter company profile currently associated with the supplied user identifier.
    /// </summary>
    public async Task<RecruiterProfileResponse> GetProfileAsync(Guid recruiterId, CancellationToken ct = default)
    {
        var profile = await recruiterRepository.GetProfileByUserIdAsync(recruiterId, ct)
            ?? throw new InvalidOperationException("Recruiter profile not found.");

        return new RecruiterProfileResponse
        {
            CompanyName = profile.CompanyName,
            CompanyEmail = profile.CompanyEmail,
            IsComplete = !string.IsNullOrWhiteSpace(profile.CompanyName) && !string.IsNullOrWhiteSpace(profile.CompanyEmail)
        };
    }

    /// <summary>
    /// Updates the recruiter company profile and returns the normalized response contract.
    /// </summary>
    public async Task<RecruiterProfileResponse> UpsertProfileAsync(Guid recruiterId, RecruiterProfileRequest request, CancellationToken ct = default)
    {
        var profile = await recruiterRepository.GetProfileByUserIdAsync(recruiterId, ct)
            ?? throw new InvalidOperationException("Recruiter profile not found.");

        profile.CompanyName = request.CompanyName.Trim();
        profile.CompanyEmail = request.CompanyEmail.Trim();
        await recruiterRepository.SaveChangesAsync(ct);

        return await GetProfileAsync(recruiterId, ct);
    }

    /// <summary>
    /// Creates a recruiter-owned job posting and invalidates dependent cache entries.
    /// </summary>
    public async Task<JobListItemResponse> CreateJobAsync(Guid recruiterId, CreateJobRequest request, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        if (string.IsNullOrWhiteSpace(request.Location)) throw new ArgumentException("location is required");
        if (request.NumberOfVacancies < 0) throw new ArgumentException("number_of_vacancies cannot be negative");
        var embedding = await embeddingService.EmbedAsync(request.Description, ct);

        var status = ParseStatusOrDefault(request.Status);
        var job = new JobEntity
        {
            Id = Guid.NewGuid(),
            RecruiterId = recruiterId,
            Title = request.Title,
            Description = request.Description,
            DescriptionEmbeddingJson = JsonSerializer.Serialize(embedding),
            ResponsibilitiesText = MultilineTextNormalizer.Normalize(request.Responsibilities),
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
            Status = status,
            CreatedAtUtc = DateTime.UtcNow,
            PostedDateUtc = status == JobStatus.Published ? DateTime.UtcNow : null,
            CompanyNameSnapshot = profile.CompanyName,
            CompanyEmailSnapshot = profile.CompanyEmail,
            JobDescriptionStructuredJson = JsonSerializer.Serialize(NormalizedJobDescriptionFactory.Create(request)),
            NumberOfVacancies = request.NumberOfVacancies
        };

        await jobRepository.AddAsync(job, ct);
        InvalidateRecruiterCaches(recruiterId);
        cacheService.RemoveByPrefix("jobs:public:list:");
        return Map(job, job.NumberOfVacancies);
    }

    /// <summary>
    /// Updates a recruiter-owned job posting and returns the updated list item projection.
    /// </summary>
    public async Task<JobListItemResponse> UpdateJobAsync(Guid recruiterId, Guid jobId, UpdateJobRequest request, CancellationToken ct = default)
    {
        var job = await jobRepository.GetByIdForRecruiterAsync(jobId, recruiterId, ct) ?? throw new KeyNotFoundException("Job not found.");
        var embedding = await embeddingService.EmbedAsync(request.Description, ct);

        job.Title = request.Title;
        job.Description = request.Description;
        job.DescriptionEmbeddingJson = JsonSerializer.Serialize(embedding);
        job.ResponsibilitiesText = MultilineTextNormalizer.Normalize(request.Responsibilities);
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

        job.JobDescriptionStructuredJson = JsonSerializer.Serialize(NormalizedJobDescriptionFactory.Create(request));

        await jobRepository.UpdateAsync(job, ct);
        InvalidateAfterJobMutation(recruiterId, job.Id);

        var remainingVacancies = await GetRemainingVacanciesByJobIdAsync(job.Id, job.NumberOfVacancies, ct);
        return Map(job, remainingVacancies);
    }

    /// <summary>
    /// Returns recruiter-owned jobs using the existing search, filter, sort, and paging rules.
    /// </summary>
    public async Task<PagedResult<JobListItemResponse>> GetJobsAsync(Guid recruiterId, int pageNumber, int pageSize, string? search, string? department, string? sortBy, string? sortDir, CancellationToken ct = default)
    {
        var normalizedPageNumber = Math.Max(1, pageNumber);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 100);
        var normalizedSearch = string.IsNullOrWhiteSpace(search) ? null : search.Trim().ToLowerInvariant();
        var normalizedDepartment = string.IsNullOrWhiteSpace(department) || department.Equals("all", StringComparison.OrdinalIgnoreCase) ? null : department.Trim();

        var cacheKey = $"jobs:recruiter:list:{recruiterId}:{normalizedPageNumber}:{normalizedPageSize}:{normalizedSearch}:{normalizedDepartment}:{sortBy}:{sortDir}";

        return await cacheService.GetOrCreateAsync(cacheKey, TimeSpan.FromSeconds(30), async () =>
        {
            var page = await recruiterRepository.GetRecruiterJobsAsync(recruiterId, normalizedPageNumber, normalizedPageSize, normalizedSearch, normalizedDepartment, sortBy, sortDir, ct);
            var remainingVacanciesByJobId = await BuildRemainingVacanciesLookupAsync(page.Items, ct);

            return new PagedResult<JobListItemResponse>
            {
                Items = page.Items.Select(item => Map(item, remainingVacanciesByJobId.TryGetValue(item.Id, out var remaining) ? remaining : item.NumberOfVacancies)).ToList(),
                PageNumber = page.PageNumber,
                PageSize = page.PageSize,
                TotalCount = page.TotalCount,
                TotalPages = page.TotalPages
            };
        });
    }

    /// <summary>
    /// Returns a single recruiter-owned job projection or <see langword="null"/> when the job is unavailable.
    /// </summary>
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

    /// <summary>
    /// Deletes a recruiter-owned job and invalidates affected cache entries.
    /// </summary>
    public async Task DeleteJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
    {
        var job = await jobRepository.GetByIdForRecruiterAsync(jobId, recruiterId, ct) ?? throw new KeyNotFoundException("Job not found.");
        await jobRepository.DeleteAsync(job, ct);
        InvalidateAfterJobMutation(recruiterId, jobId);
    }

    /// <summary>
    /// Publishes a recruiter-owned job without changing any existing endpoint contract behavior.
    /// </summary>
    public async Task PublishJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
    {
        var job = await jobRepository.GetByIdAsync(jobId, ct) ?? throw new KeyNotFoundException("Job not found.");
        job.Status = JobStatus.Published;
        job.PostedDateUtc ??= DateTime.UtcNow;
        await jobRepository.UpdateAsync(job, ct);
        InvalidateAfterJobMutation(recruiterId, jobId);
    }

    /// <summary>
    /// Closes a recruiter-owned job and invalidates dependent recruiter and public cache entries.
    /// </summary>
    public async Task CloseJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
    {
        var job = await jobRepository.GetByIdAsync(jobId, ct) ?? throw new KeyNotFoundException("Job not found.");
        job.Status = JobStatus.Closed;
        await jobRepository.UpdateAsync(job, ct);
        InvalidateAfterJobMutation(recruiterId, jobId);
    }

    /// <summary>
    /// Returns dashboard metrics, trends, and filter options for recruiter analytics views.
    /// </summary>
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
            var filterData = await recruiterRepository.GetDashboardFilterDataAsync(recruiterId, ct);
            var effectiveRole = normalizedRole;
            if (normalizedDepartment is not null && normalizedRole is not null)
            {
                if (!filterData.JobRolesByDepartment.TryGetValue(normalizedDepartment, out var rolesForDepartment)
                    || !rolesForDepartment.Contains(normalizedRole, StringComparer.OrdinalIgnoreCase))
                {
                    effectiveRole = null;
                }
            }

            var jobIds = await recruiterRepository.GetDashboardJobIdsAsync(recruiterId, normalizedDepartment, effectiveRole, ct);
            var applications = await recruiterRepository.GetDashboardApplicationsAsync(jobIds, startUtc, endExclusiveUtc, ct);

            var previousApplications = new List<ResumeSubmissionEntity>();
            if (normalizedStartDate.HasValue && normalizedEndDate.HasValue)
            {
                var length = (normalizedEndDate.Value - normalizedStartDate.Value).Days + 1;
                var prevStartUtc = ToUtcStartOfDay(normalizedStartDate.Value.AddDays(-length));
                var prevEndExclusiveUtc = ToUtcStartOfDay(normalizedStartDate.Value.AddDays(-1)).AddDays(1);
                previousApplications = await recruiterRepository.GetDashboardApplicationsAsync(jobIds, prevStartUtc, prevEndExclusiveUtc, ct);
            }

            return new RecruiterDashboardResponse
            {
                Filters = new RecruiterDashboardFilterOptionsResponse
                {
                    Departments = filterData.Departments,
                    JobRoles = filterData.JobRoles,
                    JobRolesByDepartment = filterData.JobRolesByDepartment,
                },
                Summary = RecruiterDashboardComposer.BuildSummary(applications, previousApplications),
                Trends = RecruiterDashboardComposer.BuildTrends(applications, normalizedGroupBy, await recruiterRepository.GetJobLookupAsync(recruiterId, ct)),
            };
        });
    }

    /// <summary>
    /// Returns recruiter applicant score projections, summary counts, and filter metadata.
    /// </summary>
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

        var recruiterJobs = await recruiterRepository.GetJobFiltersAsync(recruiterId, null, ct);
        var recruiterJobsForFilter = normalizedDepartment is null
            ? recruiterJobs
            : recruiterJobs.Where(job => job.Department.Equals(normalizedDepartment, StringComparison.OrdinalIgnoreCase)).ToList();

        var allItemsForCounts = await recruiterRepository.GetApplicantScoreDataAsync(recruiterId, normalizedDepartment, normalizedSearch, ct);
        var allItems = jobId.HasValue
            ? allItemsForCounts.Where(x => x.JobId == jobId.Value).ToList()
            : allItemsForCounts;

        static List<ApplicantScoreItemResponse> BuildProjected(List<ApplicantScoreData> sourceItems, int topPercent)
        {
            var recommendedCount = sourceItems.Count == 0
                ? 0
                : (int)Math.Ceiling(sourceItems.Count * (topPercent / 100d));

            var recommendedIds = sourceItems
                .OrderByDescending(x => x.Score)
                .Take(recommendedCount)
                .Select(x => x.ResumeSubmissionId)
                .ToHashSet();

            return sourceItems
                .Select(x => RecruiterApplicantProjection.ToApplicantScoreItem(x, recommendedIds))
                .ToList();
        }

        var projected = BuildProjected(allItems, topPercent);
        var projectedForCounters = BuildProjected(allItemsForCounts, topPercent);

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

    /// <summary>
    /// Returns a detailed applicant view including parsed resume JSON and generated explanation data when available.
    /// </summary>
    public async Task<ApplicantDetailResponse?> GetApplicantBySubmissionIdAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default)
    {
        var baseItem = (await GetApplicantScoresAsync(recruiterId, null, null, "all", null, 10, 1, 500, ct))
             .Items
             .FirstOrDefault(x => x.ResumeSubmissionId == submissionId);

        if (baseItem is null)
        {
            return null;
        }

        var parsedResumeJson = await recruiterRepository.GetParsedResumeJsonAsync(recruiterId, submissionId, ct);

        CandidateExplanationResponse? explanation = null;
        if (baseItem.SubmissionStatus == "Shortlisted")
        {
            var explanationEntity = await candidateExplanationRepository.GetSucceededExplanationAsync(submissionId, ct);
            if (explanationEntity is not null)
            {
                explanation = new CandidateExplanationResponse
                {
                    Provider = explanationEntity.Provider,
                    Model = explanationEntity.Model,
                    Summary = explanationEntity.Summary,
                    Strengths = RecruiterApplicantProjection.DeserializeListOrEmpty(explanationEntity.StrengthsJson),
                    Gaps = RecruiterApplicantProjection.DeserializeListOrEmpty(explanationEntity.GapsJson),
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
            ParsedResumeJson = RecruiterApplicantProjection.ParseResumeJsonElement(parsedResumeJson),
            CandidateExplanation = explanation,
        };
    }

    /// <summary>
    /// Updates the applicant stage for a single submission while preserving the original transition rules.
    /// </summary>
    public async Task UpdateApplicantStatusAsync(Guid recruiterId, Guid submissionId, UpdateApplicantStageRequest request, CancellationToken ct = default)
    {
        var action = ApplicantStageTransitionPolicy.ResolveAction(request.Action, request.Status);

        await using var transaction = await recruiterRepository.BeginSerializableTransactionAsync(ct);
        var context = await recruiterRepository.GetApplicantStageContextAsync(recruiterId, submissionId, ct)
            ?? throw new KeyNotFoundException("Submission not found.");

        var nextStatus = ApplicantStageTransitionPolicy.ResolveNextStatus(context.Submission.Status, action);
        var now = DateTime.UtcNow;

        if (nextStatus == ResumeSubmissionStatus.Hire && context.Submission.Status != ResumeSubmissionStatus.Hire)
        {
            var hiredCount = await recruiterRepository.GetHiredCountByJobIdAsync(context.Job.Id, ct);
            if (hiredCount >= context.Job.NumberOfVacancies)
            {
                throw new InvalidOperationException("Cannot hire applicant. The number of vacancies for this position has already been filled.");
            }
        }

        context.Submission.Status = nextStatus;
        context.Submission.UpdatedAtUtc = now;
        await recruiterRepository.SaveChangesAsync(ct);
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

    /// <summary>
    /// Applies a single stage transition request to multiple submissions and reports per-item success or failure.
    /// </summary>
    public async Task<BulkUpdateApplicantStageResponse> UpdateApplicantStatusesAsync(Guid recruiterId, BulkUpdateApplicantStageRequest request, CancellationToken ct = default)
    {
        var action = ApplicantStageTransitionPolicy.ResolveAction(request.Action, request.Status);
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
            catch (Exception ex) when (ex is InvalidOperationException or KeyNotFoundException or SkillSense.Application.Exceptions.InvalidStageTransitionException)
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

    private static ResumeSubmissionStatus ResolveNextStatus(ResumeSubmissionStatus currentStatus, string action)
        => ApplicantStageTransitionPolicy.ResolveNextStatus(currentStatus, action);

    private async Task<RecruiterProfileEntity> EnsureProfileCompleteAsync(Guid recruiterId, CancellationToken ct)
    {
        var profile = await recruiterRepository.GetProfileByUserIdAsync(recruiterId, ct)
            ?? throw new InvalidOperationException("Recruiter profile not found.");
        if (string.IsNullOrWhiteSpace(profile.CompanyName) || string.IsNullOrWhiteSpace(profile.CompanyEmail))
        {
            throw new InvalidOperationException("Recruiter company profile must be completed before creating jobs.");
        }

        return profile;
    }

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
            Responsibilities = MultilineTextNormalizer.Normalize(x.ResponsibilitiesText),
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
        var hiredCounts = await recruiterRepository.GetHiredCountsByJobIdsAsync(jobs.Select(x => x.Id).Distinct().ToList(), ct);
        return jobs.ToDictionary(
            job => job.Id,
            job => Math.Max(0, job.NumberOfVacancies - hiredCounts.GetValueOrDefault(job.Id)));
    }

    private async Task<int> GetRemainingVacanciesByJobIdAsync(Guid jobId, int numberOfVacancies, CancellationToken ct)
    {
        var hiredCount = await recruiterRepository.GetHiredCountByJobIdAsync(jobId, ct);
        return Math.Max(0, numberOfVacancies - hiredCount);
    }

    private static DateTime ToUtcStartOfDay(DateTime date)
        => DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);

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


