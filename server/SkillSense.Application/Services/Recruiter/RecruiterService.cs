using System.Text.Json;
using System.Text.RegularExpressions;
using AutoMapper;
using Microsoft.Extensions.Logging;
using SkillSense.Application.Common.Jobs;
using SkillSense.Application.Common.Recruiter;
using SkillSense.Application.Common.Text;
using SkillSense.Application.Contracts.Employees;
using SkillSense.Application.Contracts.Interviews;
using SkillSense.Application.Contracts.Notifications;
using SkillSense.Application.Contracts.Offers;
using SkillSense.Application.Contracts.Recruiter.Request;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Exceptions;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Recruiter;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Application.Services.Recruiter;

public sealed class RecruiterService(
    IRecruiterRepository recruiterRepository,
    IJobRepository jobRepository,
    ICandidateExplanationRepository candidateExplanationRepository,
    ITextEmbeddingService embeddingService,
    IAppCacheService cacheService,
    ICandidateExplanationService candidateExplanationService,
    IObjectStorageService objectStorageService,
    INotificationService notificationService,
    IDateTimeProvider dateTimeProvider,
    IMapper mapper,
    ILogger<RecruiterService> logger) : IRecruiterService
{
    private static readonly Regex LeadingBulletPattern = new(@"^[\s\u2022\-\*\u00B7]+", RegexOptions.Compiled);
    private static readonly IReadOnlySet<string> AllowedEmploymentTypes = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        "Full-time",
        "Part-time",
        "Contract",
        "Internship",
        "Temporary",
    };
    private static readonly IReadOnlySet<string> AllowedWorkSetups = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        "On-site",
        "Hybrid",
        "Remote",
    };
    private static readonly IReadOnlySet<string> AllowedSalaryTypes = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        "Monthly",
        "Annual",
        "Weekly",
        "Daily",
    };
    private static readonly IReadOnlySet<string> AllowedCurrencies = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        "PHP",
        "USD",
    };

    public async Task<RecruiterProfileResponse> GetProfileAsync(Guid recruiterId, CancellationToken ct = default)
    {
        var profile = await recruiterRepository.GetProfileByUserIdAsync(recruiterId, ct)
            ?? throw new InvalidOperationException("Recruiter profile not found.");

        return mapper.Map<RecruiterProfileResponse>(profile);
    }

    public async Task<RecruiterProfileResponse> UpsertProfileAsync(Guid recruiterId, RecruiterProfileRequest request, CancellationToken ct = default)
    {
        var profile = await recruiterRepository.GetProfileByUserIdAsync(recruiterId, ct)
            ?? throw new InvalidOperationException("Recruiter profile not found.");

        if (profile.CompanyId == Guid.Empty || profile.Company is null)
        {
            throw new InvalidOperationException("Recruiter company profile must be completed before it can be updated.");
        }

        profile.Company.Name = request.CompanyName.Trim();
        profile.Company.PrimaryEmail = request.CompanyEmail.Trim();
        profile.Company.UpdatedAtUtc = DateTime.UtcNow;
        await recruiterRepository.SaveChangesAsync(ct);

        return mapper.Map<RecruiterProfileResponse>(profile);
    }

    public async Task<JobListItemResponse> CreateJobAsync(Guid recruiterId, CreateJobRequest request, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        return await CreateJobAsync(profile.CompanyId, recruiterId, request, ct);
    }

    public async Task<JobListItemResponse> CreateJobAsync(Guid companyId, Guid recruiterId, CreateJobRequest request, CancellationToken ct = default)
    {
        var profile = await EnsureProfileInCompanyAsync(companyId, recruiterId, ct);
        if (string.IsNullOrWhiteSpace(request.Location)) throw new ArgumentException("location is required");
        if (request.NumberOfVacancies < 0) throw new ArgumentException("number_of_vacancies cannot be negative");

        var embedding = await embeddingService.EmbedAsync(request.Description, ct);
        var status = ParseStatusOrDefault(request.Status);
        var job = mapper.Map<JobEntity>(request);

        job.Id = Guid.NewGuid();
        job.CompanyId = companyId;
        job.RecruiterId = recruiterId;
        job.DescriptionEmbeddingJson = JsonSerializer.Serialize(embedding);
        job.RequiredSkillsJson = JsonSerializer.Serialize(request.RequiredSkills);
        job.PreferredSkillsJson = JsonSerializer.Serialize(request.PreferredSkills);
        job.Currency = string.IsNullOrWhiteSpace(request.Currency) ? "PHP" : request.Currency;
        job.Status = status;
        job.CreatedAtUtc = DateTime.UtcNow;
        job.PostedDateUtc = status == JobStatus.Published ? DateTime.UtcNow : null;
        job.CompanyNameSnapshot = profile.Company.Name;
        job.CompanyEmailSnapshot = profile.Company.PrimaryEmail;
        job.JobDescriptionStructuredJson = JsonSerializer.Serialize(NormalizedJobDescriptionFactory.Create(request));
        job.NumberOfVacancies = request.NumberOfVacancies;

        await jobRepository.AddAsync(job, ct);
        InvalidateAfterJobMutation(recruiterId, job.Id);
        return MapJob(job, job.NumberOfVacancies);
    }

    public async Task<JobListItemResponse> DuplicateJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        return await DuplicateJobAsync(profile.CompanyId, recruiterId, jobId, ct);
    }

    public async Task<JobListItemResponse> DuplicateJobAsync(Guid companyId, Guid recruiterId, Guid jobId, CancellationToken ct = default)
    {
        var profile = await EnsureProfileInCompanyAsync(companyId, recruiterId, ct);
        var original = await jobRepository.GetByIdForCompanyAsync(jobId, companyId, ct);
        if (original is null || original.RecruiterId != recruiterId)
        {
            logger.LogWarning("Recruiter {RecruiterId} requested duplication for missing job {JobId}", recruiterId, jobId);
            throw new KeyNotFoundException("Job not found.");
        }

        logger.LogInformation("Recruiter {RecruiterId} duplicating job {JobId}", recruiterId, jobId);

        var duplicateRequest = BuildDuplicateJobRequest(original);
        var embedding = await embeddingService.EmbedAsync(duplicateRequest.Description, ct);
        var duplicate = mapper.Map<JobEntity>(duplicateRequest);

        duplicate.Id = Guid.NewGuid();
        duplicate.CompanyId = companyId;
        duplicate.RecruiterId = recruiterId;
        duplicate.DescriptionEmbeddingJson = JsonSerializer.Serialize(embedding);
        duplicate.RequiredSkillsJson = JsonSerializer.Serialize(duplicateRequest.RequiredSkills);
        duplicate.PreferredSkillsJson = JsonSerializer.Serialize(duplicateRequest.PreferredSkills);
        duplicate.Currency = string.IsNullOrWhiteSpace(duplicateRequest.Currency) ? "PHP" : duplicateRequest.Currency;
        duplicate.Status = JobStatus.Draft;
        duplicate.CreatedAtUtc = dateTimeProvider.UtcNow;
        duplicate.PostedDateUtc = null;
        duplicate.CompanyNameSnapshot = profile.Company.Name;
        duplicate.CompanyEmailSnapshot = profile.Company.PrimaryEmail;
        duplicate.JobDescriptionStructuredJson = JsonSerializer.Serialize(NormalizedJobDescriptionFactory.Create(duplicateRequest));
        duplicate.NumberOfVacancies = duplicateRequest.NumberOfVacancies;

        await jobRepository.AddAsync(duplicate, ct);
        InvalidateAfterJobMutation(recruiterId, duplicate.Id);

        logger.LogInformation("Recruiter {RecruiterId} duplicated job {OriginalJobId} into {DuplicateJobId}", recruiterId, jobId, duplicate.Id);
        return MapJob(duplicate, duplicate.NumberOfVacancies);
    }

    public async Task<JobListItemResponse> UpdateJobAsync(Guid recruiterId, Guid jobId, UpdateJobRequest request, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        return await UpdateJobAsync(profile.CompanyId, recruiterId, jobId, request, ct);
    }

    public async Task<JobListItemResponse> UpdateJobAsync(Guid companyId, Guid recruiterId, Guid jobId, UpdateJobRequest request, CancellationToken ct = default)
    {
        await EnsureProfileInCompanyAsync(companyId, recruiterId, ct);
        var job = await jobRepository.GetByIdForCompanyAsync(jobId, companyId, ct);
        if (job is null || job.RecruiterId != recruiterId)
        {
            throw new KeyNotFoundException("Job not found.");
        }

        if (request.NumberOfVacancies < 0) throw new ArgumentException("number_of_vacancies cannot be negative");

        var embedding = await embeddingService.EmbedAsync(request.Description, ct);
        mapper.Map(request, job);

        job.DescriptionEmbeddingJson = JsonSerializer.Serialize(embedding);
        job.RequiredSkillsJson = JsonSerializer.Serialize(request.RequiredSkills);
        job.PreferredSkillsJson = JsonSerializer.Serialize(request.PreferredSkills);
        job.Currency = string.IsNullOrWhiteSpace(request.Currency) ? job.Currency : request.Currency;
        job.WorkSetup = (WorkSetup)(request.WorkSetup ?? (int)job.WorkSetup);
        job.EmploymentType = (EmploymentType)(request.EmploymentType ?? (int)job.EmploymentType);
        job.NumberOfVacancies = request.NumberOfVacancies;
        job.Status = ParseStatusOrDefault(request.Status);
        job.JobDescriptionStructuredJson = JsonSerializer.Serialize(NormalizedJobDescriptionFactory.Create(request));

        if (job.Status == JobStatus.Published && job.PostedDateUtc is null)
        {
            job.PostedDateUtc = DateTime.UtcNow;
        }

        await jobRepository.UpdateAsync(job, ct);
        InvalidateAfterJobMutation(recruiterId, job.Id);

        var remainingVacancies = await GetRemainingVacanciesByJobIdAsync(job.Id, job.NumberOfVacancies, ct);
        return MapJob(job, remainingVacancies);
    }

    public async Task<JobListItemResponse> UpdateJobStatusAsync(Guid recruiterId, Guid jobId, UpdateJobStatusRequest request, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        return await UpdateJobStatusAsync(profile.CompanyId, recruiterId, jobId, request, ct);
    }

    public async Task<JobListItemResponse> UpdateJobStatusAsync(Guid companyId, Guid recruiterId, Guid jobId, UpdateJobStatusRequest request, CancellationToken ct = default)
    {
        await EnsureProfileInCompanyAsync(companyId, recruiterId, ct);
        var job = await jobRepository.GetByIdForCompanyAsync(jobId, companyId, ct);
        if (job is null || job.RecruiterId != recruiterId)
        {
            throw new KeyNotFoundException("Job not found.");
        }

        if (!TryParseUpdatableStatus(request.Status, out var status))
        {
            logger.LogWarning("Recruiter {RecruiterId} requested invalid job status {Status} for job {JobId}", recruiterId, request.Status, jobId);
            throw new ArgumentException("Invalid job status. Allowed values are Draft, Published, and Closed.");
        }

        job.Status = status;
        if (status == JobStatus.Published && job.PostedDateUtc is null)
        {
            job.PostedDateUtc = DateTime.UtcNow;
        }

        await jobRepository.UpdateAsync(job, ct);
        InvalidateAfterJobMutation(recruiterId, jobId);
        var remainingVacancies = await GetRemainingVacanciesByJobIdAsync(job.Id, job.NumberOfVacancies, ct);
        return MapJob(job, remainingVacancies);
    }

    public async Task<PagedResult<JobListItemResponse>> GetJobsAsync(Guid recruiterId, int pageNumber, int pageSize, string? search, string? department, string? sortBy, string? sortDir, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        return await GetJobsAsync(profile.CompanyId, recruiterId, pageNumber, pageSize, search, department, sortBy, sortDir, ct);
    }

    public async Task<PagedResult<JobListItemResponse>> GetJobsAsync(Guid companyId, Guid recruiterId, int pageNumber, int pageSize, string? search, string? department, string? sortBy, string? sortDir, CancellationToken ct = default)
    {
        await EnsureProfileInCompanyAsync(companyId, recruiterId, ct);
        var normalizedPageNumber = Math.Max(1, pageNumber);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 100);
        var normalizedSearch = string.IsNullOrWhiteSpace(search) ? null : search.Trim().ToLowerInvariant();
        var normalizedDepartment = string.IsNullOrWhiteSpace(department) || department.Equals("all", StringComparison.OrdinalIgnoreCase) ? null : department.Trim();

        var cacheKey = $"jobs:recruiter:list:{recruiterId}:{normalizedPageNumber}:{normalizedPageSize}:{normalizedSearch}:{normalizedDepartment}:{sortBy}:{sortDir}";

        return await cacheService.GetOrCreateAsync(cacheKey, TimeSpan.FromSeconds(30), async () =>
        {
            var page = await recruiterRepository.GetRecruiterJobsAsync(recruiterId, companyId, normalizedPageNumber, normalizedPageSize, normalizedSearch, normalizedDepartment, sortBy, sortDir, ct);
            var remainingVacanciesByJobId = await BuildRemainingVacanciesLookupAsync(page.Items, ct);

            return new PagedResult<JobListItemResponse>
            {
                Items = page.Items.Select(item => MapJob(item, remainingVacanciesByJobId.TryGetValue(item.Id, out var remaining) ? remaining : item.NumberOfVacancies)).ToList(),
                PageNumber = page.PageNumber,
                PageSize = page.PageSize,
                TotalCount = page.TotalCount,
                TotalPages = page.TotalPages
            };
        });
    }

    public async Task<JobListItemResponse?> GetJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        return await GetJobAsync(profile.CompanyId, recruiterId, jobId, ct);
    }

    public async Task<JobListItemResponse?> GetJobAsync(Guid companyId, Guid recruiterId, Guid jobId, CancellationToken ct = default)
    {
        await EnsureProfileInCompanyAsync(companyId, recruiterId, ct);
        var job = await jobRepository.GetByIdForCompanyAsync(jobId, companyId, ct);
        if (job is null || job.RecruiterId != recruiterId)
        {
            return null;
        }

        var remainingVacancies = await GetRemainingVacanciesByJobIdAsync(job.Id, job.NumberOfVacancies, ct);
        return MapJob(job, remainingVacancies);
    }

    public async Task DeleteJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        await DeleteJobAsync(profile.CompanyId, recruiterId, jobId, ct);
    }

    public async Task DeleteJobAsync(Guid companyId, Guid recruiterId, Guid jobId, CancellationToken ct = default)
    {
        await EnsureProfileInCompanyAsync(companyId, recruiterId, ct);
        var job = await jobRepository.GetByIdForCompanyAsync(jobId, companyId, ct);
        if (job is null || job.RecruiterId != recruiterId)
        {
            throw new KeyNotFoundException("Job not found.");
        }

        await jobRepository.DeleteAsync(job, ct);
        InvalidateAfterJobMutation(recruiterId, jobId);
    }

    public async Task<RecruiterDashboardResponse> GetDashboardAsync(Guid recruiterId, DateTime? startDate, DateTime? endDate, string? department, string? jobRole, string? groupBy, CancellationToken ct = default)
    {
        var profile = await recruiterRepository.GetProfileByUserIdAsync(recruiterId, ct);
        if (!HasDashboardCompanyContext(profile))
        {
            return CreateEmptyDashboardResponse();
        }

        return await GetDashboardCoreAsync(profile!.CompanyId, recruiterId, startDate, endDate, department, jobRole, groupBy, ct);
    }

    public async Task<RecruiterDashboardResponse> GetDashboardAsync(Guid companyId, Guid recruiterId, DateTime? startDate, DateTime? endDate, string? department, string? jobRole, string? groupBy, CancellationToken ct = default)
    {
        var profile = await recruiterRepository.GetProfileByUserIdAsync(recruiterId, ct);
        if (!HasDashboardCompanyContext(profile))
        {
            return CreateEmptyDashboardResponse();
        }

        if (profile!.CompanyId != companyId)
        {
            throw new UnauthorizedAccessException("Recruiter profile does not belong to the active company.");
        }

        return await GetDashboardCoreAsync(companyId, recruiterId, startDate, endDate, department, jobRole, groupBy, ct);
    }

    private async Task<RecruiterDashboardResponse> GetDashboardCoreAsync(Guid companyId, Guid recruiterId, DateTime? startDate, DateTime? endDate, string? department, string? jobRole, string? groupBy, CancellationToken ct)
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
            var filterData = await recruiterRepository.GetDashboardFilterDataAsync(recruiterId, companyId, ct);
            var effectiveRole = normalizedRole;
            if (normalizedDepartment is not null && normalizedRole is not null)
            {
                if (!filterData.JobRolesByDepartment.TryGetValue(normalizedDepartment, out var rolesForDepartment)
                    || !rolesForDepartment.Contains(normalizedRole, StringComparer.OrdinalIgnoreCase))
                {
                    effectiveRole = null;
                }
            }

            var jobIds = await recruiterRepository.GetDashboardJobIdsAsync(recruiterId, companyId, normalizedDepartment, effectiveRole, ct);
            var applications = await recruiterRepository.GetDashboardApplicationsAsync(jobIds, startUtc, endExclusiveUtc, ct);

            var previousApplications = new List<ResumeSubmissionEntity>();
            if (normalizedStartDate.HasValue && normalizedEndDate.HasValue)
            {
                var length = (normalizedEndDate.Value - normalizedStartDate.Value).Days + 1;
                var prevStartUtc = ToUtcStartOfDay(normalizedStartDate.Value.AddDays(-length));
                var prevEndExclusiveUtc = ToUtcStartOfDay(normalizedStartDate.Value.AddDays(-1)).AddDays(1);
                previousApplications = await recruiterRepository.GetDashboardApplicationsAsync(jobIds, prevStartUtc, prevEndExclusiveUtc, ct);
            }

            var currentOfferApplicationIds = applications
                .Where(application => application.Status == ResumeSubmissionStatus.Offer)
                .Select(application => application.Id)
                .Distinct()
                .ToList();
            var previousOfferApplicationIds = previousApplications
                .Where(application => application.Status == ResumeSubmissionStatus.Offer)
                .Select(application => application.Id)
                .Distinct()
                .ToList();
            var currentOffers = await recruiterRepository.GetLatestDashboardOffersAsync(currentOfferApplicationIds, ct);
            var previousOffers = await recruiterRepository.GetLatestDashboardOffersAsync(previousOfferApplicationIds, ct);

            return new RecruiterDashboardResponse
            {
                Filters = new RecruiterDashboardFilterOptionsResponse
                {
                    Departments = filterData.Departments,
                    JobRoles = filterData.JobRoles,
                    JobRolesByDepartment = filterData.JobRolesByDepartment,
                },
                Summary = RecruiterDashboardComposer.BuildSummary(applications, previousApplications, currentOffers, previousOffers),
                Trends = RecruiterDashboardComposer.BuildTrends(applications, normalizedGroupBy, await recruiterRepository.GetJobLookupAsync(recruiterId, companyId, ct)),
            };
        });
    }

    public async Task<ApplicantScoresResponse> GetApplicantScoresAsync(Guid recruiterId, Guid? jobId, string? department, string? stage, string? search, int? recommendedTopPercent, int pageNumber, int pageSize, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        return await GetApplicantScoresAsync(profile.CompanyId, recruiterId, jobId, department, stage, search, recommendedTopPercent, pageNumber, pageSize, ct);
    }

    public async Task<ApplicantScoresResponse> GetApplicantScoresAsync(Guid companyId, Guid recruiterId, Guid? jobId, string? department, string? stage, string? search, int? recommendedTopPercent, int pageNumber, int pageSize, CancellationToken ct = default)
    {
        await EnsureProfileInCompanyAsync(companyId, recruiterId, ct);
        var normalizedStage = string.IsNullOrWhiteSpace(stage) ? "all" : stage.Trim().ToLowerInvariant();
        var normalizedSearch = string.IsNullOrWhiteSpace(search) ? null : search.Trim().ToLowerInvariant();
        var normalizedDepartment = string.IsNullOrWhiteSpace(department) || department.Equals("all", StringComparison.OrdinalIgnoreCase)
            ? null
            : department.Trim();
        var topPercent = Math.Clamp(recommendedTopPercent ?? 10, 1, 100);
        var normalizedPageNumber = Math.Max(1, pageNumber);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 100);

        var recruiterJobs = await recruiterRepository.GetJobFiltersAsync(recruiterId, companyId, null, ct);
        var recruiterJobsForFilter = normalizedDepartment is null
            ? recruiterJobs
            : recruiterJobs.Where(job => job.Department.Equals(normalizedDepartment, StringComparison.OrdinalIgnoreCase)).ToList();

        var allItemsForCounts = await recruiterRepository.GetApplicantScoreDataAsync(recruiterId, companyId, normalizedDepartment, normalizedSearch, ct);
        var allItems = jobId.HasValue
            ? allItemsForCounts.Where(x => x.JobId == jobId.Value).ToList()
            : allItemsForCounts;

        var projected = BuildProjectedApplicants(allItems, topPercent);
        var projectedForCounters = BuildProjectedApplicants(allItemsForCounts, topPercent);

        var filtered = normalizedStage == "all"
            ? projected
            : projected.Where(x => x.SubmissionStatus.Equals(normalizedStage, StringComparison.OrdinalIgnoreCase)).ToList();

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
                var safeItems = hasValues && itemsForJob is not null ? itemsForJob : [];

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
                    Hired = 0,
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
                Hired = 0,
            },
            Recommendation = new RecommendationSettingsResponse
            {
                TopPercent = topPercent,
            }
        };
    }

    public async Task<ApplicantDetailResponse?> GetApplicantBySubmissionIdAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        return await GetApplicantBySubmissionIdAsync(profile.CompanyId, recruiterId, submissionId, ct);
    }

    public async Task<ApplicantDetailResponse?> GetApplicantBySubmissionIdAsync(Guid companyId, Guid recruiterId, Guid submissionId, CancellationToken ct = default)
    {
        await EnsureProfileInCompanyAsync(companyId, recruiterId, ct);
        var baseItem = await BuildApplicantProjectionAsync(recruiterId, companyId, submissionId, null, ct);
        if (baseItem is null)
        {
            return null;
        }

        var parsedResumeJson = await recruiterRepository.GetParsedResumeJsonAsync(recruiterId, companyId, submissionId, ct);
        CandidateExplanationResponse? explanation = null;
        var allowedStatusesForExplanation = new[] { "Shortlisted", "Interview", "Hired", "Offer" };
        if (allowedStatusesForExplanation.Contains(baseItem.SubmissionStatus))
        {
            var explanationEntity = await candidateExplanationRepository.GetSucceededExplanationAsync(submissionId, ct);
            if (explanationEntity is not null)
            {
                explanation = mapper.Map<CandidateExplanationResponse>(explanationEntity);
            }
        }

        var detail = mapper.Map<ApplicantDetailResponse>(baseItem);
        detail.ParsedResumeJson = RecruiterApplicantProjection.ParseResumeJsonElement(parsedResumeJson);
        detail.CandidateExplanation = explanation;
        detail.Offer = await GetOfferAsync(companyId, recruiterId, submissionId, ct);
        detail.LatestInterview = MapInterviewSummary(context: await GetApplicantStageContextForCompanyAsync(companyId, recruiterId, submissionId, ct));
        return detail;
    }

    public async Task<ApplicantResumeAccessResult> GetApplicantResumeAccessAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        return await GetApplicantResumeAccessAsync(profile.CompanyId, recruiterId, submissionId, ct);
    }

    public async Task<ApplicantResumeAccessResult> GetApplicantResumeAccessAsync(Guid companyId, Guid recruiterId, Guid submissionId, CancellationToken ct = default)
    {
        await EnsureProfileInCompanyAsync(companyId, recruiterId, ct);
        var submission = await recruiterRepository.GetSubmissionByIdForRecruiterAsync(recruiterId, companyId, submissionId, ct)
            ?? throw new KeyNotFoundException("Candidate not found.");

        if (string.IsNullOrWhiteSpace(submission.BlobObjectKey))
        {
            throw new KeyNotFoundException("Resume not found.");
        }

        if (!await objectStorageService.ExistsAsync(submission.BlobObjectKey, ct))
        {
            logger.LogWarning("Resume file missing from storage for submission {SubmissionId}. ObjectKey={ObjectKey}", submissionId, submission.BlobObjectKey);
            throw new KeyNotFoundException("Resume file not found.");
        }

        var fileName = string.IsNullOrWhiteSpace(submission.FileName) ? "resume" : submission.FileName;
        var contentType = string.IsNullOrWhiteSpace(submission.ContentType) ? "application/octet-stream" : submission.ContentType;
        var downloadUrl = await objectStorageService.GetDownloadUrlAsync(submission.BlobObjectKey, fileName, ct);

        return new ApplicantResumeAccessResult
        {
            ObjectKey = submission.BlobObjectKey,
            FileName = fileName,
            ContentType = contentType,
            DownloadUrl = downloadUrl,
        };
    }

    public async Task<IReadOnlyList<ShortlistedCandidateOptionDto>> GetShortlistedCandidatesByJobAsync(Guid companyId, Guid recruiterId, Guid jobId, string? department = null, CancellationToken ct = default)
    {
        await EnsureProfileInCompanyAsync(companyId, recruiterId, ct);
        var job = await jobRepository.GetByIdForCompanyAsync(jobId, companyId, ct);
        if (job is null || job.RecruiterId != recruiterId)
        {
            throw new KeyNotFoundException("Job not found.");
        }

        if (!string.IsNullOrWhiteSpace(department)
            && !string.Equals(job.Department ?? "Unassigned", department.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            return [];
        }

        // Recruiters choose from shortlisted candidates only so scheduling stays connected
        // to the applicant-review workflow and never depends on manually typed database IDs.
        var candidates = await recruiterRepository.GetShortlistedCandidatesByJobAsync(jobId, ct);
        return candidates
            .Select(candidate => new ShortlistedCandidateOptionDto
            {
                JobSeekerUserId = candidate.JobSeekerUserId,
                ResumeSubmissionId = candidate.ResumeSubmissionId,
                CandidateName = candidate.CandidateName,
                CandidateEmail = candidate.CandidateEmail,
            })
            .ToList();
    }

    public async Task<ApplicantScoreItemResponse> UpdateApplicantStatusAsync(Guid recruiterId, Guid submissionId, UpdateApplicantStageRequest request, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        return await UpdateApplicantStatusAsync(profile.CompanyId, recruiterId, submissionId, request, ct);
    }

    public async Task<ApplicantScoreItemResponse> UpdateApplicantStatusAsync(Guid companyId, Guid recruiterId, Guid submissionId, UpdateApplicantStageRequest request, CancellationToken ct = default)
    {
        var action = ApplicantStageTransitionPolicy.ResolveAction(request.Action, request.Status);
        var nextStatus = await ResolveTransitionStatusAsync(companyId, recruiterId, submissionId, action, ct);
        return await ApplyApplicantStatusAsync(companyId, recruiterId, submissionId, nextStatus, ct);
    }

    public async Task<ApplicantScoreItemResponse> CreateOfferAsync(Guid recruiterId, Guid submissionId, SendOfferRequest request, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        return await CreateOfferAsync(profile.CompanyId, recruiterId, submissionId, request, ct);
    }

    public async Task<ApplicantScoreItemResponse> CreateOfferAsync(Guid companyId, Guid recruiterId, Guid submissionId, SendOfferRequest request, CancellationToken ct = default)
    {
        await EnsureProfileInCompanyAsync(companyId, recruiterId, ct);
        ValidateOfferRequest(request);

        var now = dateTimeProvider.UtcNow;
        await using var transaction = await recruiterRepository.BeginSerializableTransactionAsync(ct);
        var context = await GetApplicantStageContextForCompanyAsync(companyId, recruiterId, submissionId, ct);
        var latestOffer = await EnsureOfferExpirationStateAsync(context.LatestOffer, ct);

        if (!CanSendOffer(context, latestOffer))
        {
            throw new InvalidOperationException("An offer can only be sent after the latest interview has been accepted and marked as completed.");
        }

        if (latestOffer?.Status == JobOfferStatus.Pending)
        {
            throw new InvalidOperationException("A pending offer already exists for this application.");
        }

        var offer = new JobOfferEntity
        {
            Id = Guid.NewGuid(),
            ApplicationId = submissionId,
            SentByUserId = recruiterId,
            Title = request.Title.Trim(),
            Message = RichTextPlainTextNormalizer.Normalize(request.Message),
            Benefits = string.IsNullOrWhiteSpace(request.Benefits) ? null : RichTextPlainTextNormalizer.Normalize(request.Benefits),
            SalaryText = BuildSalaryText(request.SalaryAmount!.Value, request.Currency, request.SalaryType),
            SalaryAmount = request.SalaryAmount!.Value,
            SalaryType = NormalizeOfferOption(request.SalaryType, AllowedSalaryTypes),
            Currency = NormalizeOfferOption(request.Currency, AllowedCurrencies),
            EmploymentType = NormalizeOfferOption(request.EmploymentType, AllowedEmploymentTypes),
            WorkSetup = NormalizeOfferOption(request.WorkSetup, AllowedWorkSetups),
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            ExpirationDate = request.ExpirationDate,
            Status = JobOfferStatus.Pending,
            SentAtUtc = now,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        context.Submission.Status = ResumeSubmissionStatus.Offer;
        context.Submission.UpdatedAtUtc = now;

        await recruiterRepository.AddOfferAsync(offer, ct);
        await recruiterRepository.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        await NotifyOfferSentAsync(context.Submission, context.Job.Title, offer, ct);

        cacheService.RemoveByPrefix($"dashboard:recruiter:{recruiterId}:");
        var updated = await BuildApplicantProjectionAsync(recruiterId, companyId, submissionId, null, ct)
            ?? throw new KeyNotFoundException("Submission not found after offer creation.");
        updated.Offer = MapOffer(offer);
        return updated;
    }

    public async Task<OfferResponse?> GetOfferAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        return await GetOfferAsync(profile.CompanyId, recruiterId, submissionId, ct);
    }

    public async Task<OfferResponse?> GetOfferAsync(Guid companyId, Guid recruiterId, Guid submissionId, CancellationToken ct = default)
    {
        await EnsureProfileInCompanyAsync(companyId, recruiterId, ct);
        _ = await GetApplicantStageContextForCompanyAsync(companyId, recruiterId, submissionId, ct);
        var latestOffer = await recruiterRepository.GetLatestOfferByApplicationIdAsync(submissionId, ct);
        latestOffer = await EnsureOfferExpirationStateAsync(latestOffer, ct);
        return latestOffer is null ? null : MapOffer(latestOffer);
    }

    public async Task<PagedResult<EmployeeRecordResponse>> GetHiredEmployeesAsync(Guid recruiterId, int pageNumber, int pageSize, string? search, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        return await GetHiredEmployeesAsync(profile.CompanyId, recruiterId, pageNumber, pageSize, search, ct);
    }

    public async Task<PagedResult<EmployeeRecordResponse>> GetHiredEmployeesAsync(Guid companyId, Guid recruiterId, int pageNumber, int pageSize, string? search, CancellationToken ct = default)
    {
        await EnsureProfileInCompanyAsync(companyId, recruiterId, ct);
        var data = await recruiterRepository.GetHiredEmployeeDataAsync(recruiterId, companyId, pageNumber, pageSize, search, ct);

        return new PagedResult<EmployeeRecordResponse>
        {
            Items = data.Items.Select(MapEmployee).ToList(),
            PageNumber = data.PageNumber,
            PageSize = data.PageSize,
            TotalCount = data.TotalCount,
            TotalPages = data.TotalPages,
        };
    }

    public async Task<ApplicantScoreItemResponse> MarkHiredAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        return await MarkHiredAsync(profile.CompanyId, recruiterId, submissionId, ct);
    }

    public async Task<ApplicantScoreItemResponse> MarkHiredAsync(Guid companyId, Guid recruiterId, Guid submissionId, CancellationToken ct = default)
    {
        var updated = await ApplyApplicantStatusAsync(companyId, recruiterId, submissionId, ResumeSubmissionStatus.Hired, ct);
        var context = await GetApplicantStageContextForCompanyAsync(companyId, recruiterId, submissionId, ct);
        await NotifyCandidateHiredAsync(context.Submission, context.Job.Title, ct);
        updated.Offer = await GetOfferAsync(companyId, recruiterId, submissionId, ct);
        return updated;
    }

    public async Task<BulkUpdateApplicantStageResponse> UpdateApplicantStatusesAsync(Guid recruiterId, BulkUpdateApplicantStageRequest request, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        return await UpdateApplicantStatusesAsync(profile.CompanyId, recruiterId, request, ct);
    }

    public async Task<BulkUpdateApplicantStageResponse> UpdateApplicantStatusesAsync(Guid companyId, Guid recruiterId, BulkUpdateApplicantStageRequest request, CancellationToken ct = default)
    {
        await EnsureProfileInCompanyAsync(companyId, recruiterId, ct);
        var requestedIds = request.SubmissionIds ?? [];
        var actionLabel = request.Action ?? request.Status ?? "unknown";

        logger.LogInformation("Recruiter {RecruiterId} bulk stage update requested. Action={Action} Count={Count}", recruiterId, actionLabel, requestedIds.Count);

        if (requestedIds.Count == 0)
        {
            logger.LogWarning("Recruiter {RecruiterId} bulk stage update called with no submission IDs.", recruiterId);
            return BuildBulkFailureResponse(actionLabel, requestedIds, "No submissions provided.");
        }

        try
        {
            var action = ApplicantStageTransitionPolicy.ResolveAction(request.Action, request.Status);
            var submissionIds = requestedIds.Distinct().ToList();
            var results = new List<BulkUpdateApplicantStageResultItemResponse>(submissionIds.Count);

            var allItemsForStatus = await recruiterRepository.GetApplicantScoreDataAsync(recruiterId, companyId, null, null, ct);
            var recommendedIds = BuildRecommendedIds(allItemsForStatus, 10);
            var statusById = allItemsForStatus.ToDictionary(x => x.ResumeSubmissionId, x => x.Status);

            await using var transaction = await recruiterRepository.BeginSerializableTransactionAsync(ct);
            var now = DateTime.UtcNow;
            var reservedHiresByJobId = new Dictionary<Guid, int>();
            var shortlistedForExplanation = new List<Guid>();

            foreach (var submissionId in submissionIds)
            {
                var previousStatus = statusById.TryGetValue(submissionId, out var previousRaw)
                    ? RecruiterApplicantProjection.ResolveSubmissionStatus(previousRaw, recommendedIds.Contains(submissionId))
                    : null;

                try
                {
                    var context = await recruiterRepository.GetApplicantStageContextAsync(recruiterId, companyId, submissionId, ct)
                        ?? throw new KeyNotFoundException("Submission not found.");

                    ResumeSubmissionStatus nextStatus;
                    try
                    {
                        nextStatus = ApplicantStageTransitionPolicy.ResolveNextStatus(context.Submission.Status, action);
                    }
                    catch (InvalidStageTransitionException ex)
                    {
                        logger.LogWarning(ex, "Invalid applicant transition {Action} from {Status} for submission {SubmissionId}", action, context.Submission.Status, submissionId);
                        throw;
                    }

                    if (nextStatus == ResumeSubmissionStatus.Hired && context.Submission.Status != ResumeSubmissionStatus.Hired)
                    {
                        if (!reservedHiresByJobId.TryGetValue(context.Job.Id, out var hiredCount))
                        {
                            hiredCount = await recruiterRepository.GetHiredCountByJobIdAsync(context.Job.Id, ct);
                        }

                        if (hiredCount >= context.Job.NumberOfVacancies)
                        {
                            logger.LogWarning("Recruiter {RecruiterId} exceeded vacancy limit while hiring submission {SubmissionId} for job {JobId}", recruiterId, submissionId, context.Job.Id);
                            throw new InvalidOperationException("Cannot hire applicant. The number of vacancies for this position has already been filled.");
                        }

                        reservedHiresByJobId[context.Job.Id] = hiredCount + 1;
                    }

                   
                    context.Submission.Status = nextStatus;
                    context.Submission.UpdatedAtUtc = now;
                    if (nextStatus == ResumeSubmissionStatus.Hired)
                    {
                        var latestOffer = await EnsureOfferExpirationStateAsync(context.LatestOffer, ct);
                        if (latestOffer is null || latestOffer.Status != JobOfferStatus.Accepted)
                        {
                            throw new InvalidOperationException("An applicant can only be marked as hired after accepting an offer.");
                        }

                        context.Submission.HireDateUtc ??= now;
                        context.Submission.HiredByRecruiterId ??= recruiterId;
                        context.Submission.AcceptedOfferId ??= latestOffer.Id;
                    }

                    if (nextStatus == ResumeSubmissionStatus.Shortlisted)
                    {
                        shortlistedForExplanation.Add(submissionId);
                    }

                    var newStatus = RecruiterApplicantProjection.ResolveSubmissionStatus(nextStatus, recommendedIds.Contains(submissionId));

                    results.Add(new BulkUpdateApplicantStageResultItemResponse
                    {
                        SubmissionId = submissionId,
                        Success = true,
                        Message = "Applicant stage updated successfully.",
                        PreviousStage = previousStatus,
                        NewStatus = newStatus,
                    });
                }
                catch (Exception ex) when (ex is InvalidOperationException or KeyNotFoundException or InvalidStageTransitionException)
                {
                    logger.LogWarning(ex, "Recruiter {RecruiterId} failed applicant action {Action} for submission {SubmissionId}", recruiterId, action, submissionId);
                    results.Add(new BulkUpdateApplicantStageResultItemResponse
                    {
                        SubmissionId = submissionId,
                        Success = false,
                        Message = ex.Message,
                        PreviousStage = previousStatus,
                    });
                }
            }

            await recruiterRepository.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            foreach (var result in results.Where(x => x.Success))
            {
                var updatedCandidate = await BuildApplicantProjectionAsync(recruiterId, companyId, result.SubmissionId, recommendedIds, ct);
                if (updatedCandidate is not null)
                {
                    result.Candidate = updatedCandidate;
                    result.NewStatus = updatedCandidate.SubmissionStatus;
                }
            }

            foreach (var submissionId in shortlistedForExplanation.Distinct())
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

            // Recalculate counts from the database after updates so the API reflects real totals
            // and never relies on client-side deltas that can drift or go negative.
            var refreshedItems = await recruiterRepository.GetApplicantScoreDataAsync(recruiterId, companyId, null, null, ct);
            var projectedForCounts = BuildProjectedApplicants(refreshedItems, 10);
            var counts = new ApplicantScoreCountsResponse
            {
                AllApplicants = projectedForCounts.Count,
                Recommended = projectedForCounts.Count(x => x.SubmissionStatus == "Recommended"),
                Shortlisted = projectedForCounts.Count(x => x.SubmissionStatus == "Shortlisted"),
                Interview = projectedForCounts.Count(x => x.SubmissionStatus == "Interview"),
                Offer = projectedForCounts.Count(x => x.SubmissionStatus == "Offer"),
                Hired = 0,
            };

            cacheService.RemoveByPrefix($"dashboard:recruiter:{recruiterId}:");

            return new BulkUpdateApplicantStageResponse
            {
                Action = action,
                RequestedCount = requestedIds.Count,
                ProcessedCount = results.Count,
                SuccessCount = results.Count(x => x.Success),
                FailureCount = results.Count(x => !x.Success),
                Results = results,
                Counts = counts,
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Recruiter {RecruiterId} bulk stage update failed.", recruiterId);
            return BuildBulkFailureResponse(actionLabel, requestedIds, "Bulk candidate stage update failed.");
        }
    }

    private static BulkUpdateApplicantStageResponse BuildBulkFailureResponse(string action, IReadOnlyList<Guid> submissionIds, string message)
    {
        var results = submissionIds
            .Select(id => new BulkUpdateApplicantStageResultItemResponse
            {
                SubmissionId = id,
                Success = false,
                Message = message,
            })
            .ToList();

        return new BulkUpdateApplicantStageResponse
        {
            Action = action,
            RequestedCount = submissionIds.Count,
            ProcessedCount = results.Count,
            SuccessCount = 0,
            FailureCount = results.Count,
            Results = results,
        };
    }

    private static ResumeSubmissionStatus ResolveNextStatus(ResumeSubmissionStatus currentStatus, string action)
        => ApplicantStageTransitionPolicy.ResolveNextStatus(currentStatus, action);

    private async Task<ResumeSubmissionStatus> ResolveTransitionStatusAsync(Guid companyId, Guid recruiterId, Guid submissionId, string action, CancellationToken ct)
    {
        await EnsureProfileInCompanyAsync(companyId, recruiterId, ct);
        var context = await GetApplicantStageContextForCompanyAsync(companyId, recruiterId, submissionId, ct);

        try
        {
            var nextStatus = ResolveNextStatus(context.Submission.Status, action);
            EnsureInterviewFlowAllowsTransition(context, nextStatus, action);
            return nextStatus;
        }
        catch (InvalidStageTransitionException ex)
        {
            logger.LogWarning(ex, "Invalid applicant transition {Action} from {Status} for submission {SubmissionId}", action, context.Submission.Status, submissionId);
            throw;
        }
    }

    private async Task<ApplicantStageContextData> GetApplicantStageContextForCompanyAsync(Guid companyId, Guid recruiterId, Guid submissionId, CancellationToken ct)
        => await recruiterRepository.GetApplicantStageContextAsync(recruiterId, companyId, submissionId, ct)
            ?? throw new KeyNotFoundException("Submission not found.");

    private async Task<ApplicantScoreItemResponse> ApplyApplicantStatusAsync(Guid companyId, Guid recruiterId, Guid submissionId, ResumeSubmissionStatus nextStatus, CancellationToken ct)
    {
        await EnsureProfileInCompanyAsync(companyId, recruiterId, ct);
        logger.LogInformation("Recruiter {RecruiterId} setting submission {SubmissionId} to {Status}", recruiterId, submissionId, nextStatus);

        await using var transaction = await recruiterRepository.BeginSerializableTransactionAsync(ct);
        var context = await GetApplicantStageContextForCompanyAsync(companyId, recruiterId, submissionId, ct);
        var latestOffer = await EnsureOfferExpirationStateAsync(context.LatestOffer, ct);

        if (nextStatus == ResumeSubmissionStatus.Offer)
        {
            throw new InvalidOperationException("Use the send offer workflow to move an application into offer stage.");
        }

        EnsureInterviewFlowAllowsTransition(context, nextStatus, nextStatus.ToString());

        if (nextStatus == ResumeSubmissionStatus.Hired && context.Submission.Status != ResumeSubmissionStatus.Hired)
        {
            if (latestOffer is null || latestOffer.Status != JobOfferStatus.Accepted)
            {
                throw new InvalidOperationException("An applicant can only be marked as hired after accepting an offer.");
            }

            var hiredCount = await recruiterRepository.GetHiredCountByJobIdAsync(context.Job.Id, ct);
            if (hiredCount >= context.Job.NumberOfVacancies)
            {
                logger.LogWarning("Recruiter {RecruiterId} exceeded vacancy limit while hiring submission {SubmissionId} for job {JobId}", recruiterId, submissionId, context.Job.Id);
                throw new InvalidOperationException("Cannot hire applicant. The number of vacancies for this position has already been filled.");
            }
        }

        context.Submission.Status = nextStatus;
        context.Submission.UpdatedAtUtc = dateTimeProvider.UtcNow;
        if (nextStatus == ResumeSubmissionStatus.Hired)
        {
            context.Submission.HireDateUtc ??= dateTimeProvider.UtcNow;
            context.Submission.HiredByRecruiterId ??= recruiterId;
            context.Submission.AcceptedOfferId ??= latestOffer?.Id;
        }
        await recruiterRepository.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        cacheService.RemoveByPrefix($"dashboard:recruiter:{recruiterId}:");
        var updated = await BuildApplicantProjectionAsync(recruiterId, companyId, submissionId, null, ct)
            ?? throw new KeyNotFoundException("Submission not found after update.");
        updated.Offer = latestOffer is null ? null : MapOffer(latestOffer);

        return updated;
    }

    private void ValidateOfferRequest(SendOfferRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new ArgumentException("Offer title is required.");
        }

        if (!request.SalaryAmount.HasValue || request.SalaryAmount.Value <= 0)
        {
            throw new ArgumentException("Salary amount is required.");
        }

        if (string.IsNullOrWhiteSpace(request.EmploymentType))
        {
            throw new ArgumentException("Employment type is required.");
        }

        if (!AllowedEmploymentTypes.Contains(request.EmploymentType.Trim()))
        {
            throw new ArgumentException("Please select a valid employment type.");
        }

        if (string.IsNullOrWhiteSpace(request.WorkSetup) || !AllowedWorkSetups.Contains(request.WorkSetup.Trim()))
        {
            throw new ArgumentException("Please select a valid work setup.");
        }

        if (string.IsNullOrWhiteSpace(request.SalaryType) || !AllowedSalaryTypes.Contains(request.SalaryType.Trim()))
        {
            throw new ArgumentException("Please select a valid salary type.");
        }

        if (string.IsNullOrWhiteSpace(request.Currency) || !AllowedCurrencies.Contains(request.Currency.Trim()))
        {
            throw new ArgumentException("Please select a valid currency.");
        }

        if (!request.StartDate.HasValue)
        {
            throw new ArgumentException("Start date is required.");
        }

        if (!request.ExpirationDate.HasValue)
        {
            throw new ArgumentException("Offer expiration date is required.");
        }

        var today = DateOnly.FromDateTime(dateTimeProvider.UtcNow);
        if (request.ExpirationDate.Value < today)
        {
            throw new ArgumentException("Expiration date must be later than today.");
        }

        if (request.ExpirationDate.Value < request.StartDate.Value)
        {
            throw new ArgumentException("Expiration date cannot be earlier than the start date.");
        }

        var requiresEndDate = RequiresOfferEndDate(request.EmploymentType);
        if (requiresEndDate && !request.EndDate.HasValue)
        {
            throw new ArgumentException($"End date is required for {request.EmploymentType.Trim().ToLowerInvariant()} offers.");
        }

        if (!requiresEndDate && request.EndDate.HasValue && request.EndDate.Value <= request.StartDate.Value)
        {
            throw new ArgumentException("End date must be after the start date.");
        }

        if (request.EndDate.HasValue && request.EndDate.Value <= request.StartDate.Value)
        {
            throw new ArgumentException("End date must be after the start date.");
        }
    }

    private bool CanSendOffer(ApplicantStageContextData context, JobOfferEntity? latestOffer)
    {
        if (!HasCompletedInterview(context))
        {
            return false;
        }

        if (context.Submission.Status == ResumeSubmissionStatus.Interview)
        {
            return true;
        }

        return context.Submission.Status == ResumeSubmissionStatus.Offer
            && latestOffer is not null
            && latestOffer.Status is JobOfferStatus.Declined or JobOfferStatus.Expired or JobOfferStatus.Cancelled;
    }

    private void EnsureInterviewFlowAllowsTransition(ApplicantStageContextData context, ResumeSubmissionStatus nextStatus, string action)
    {
        if (nextStatus == ResumeSubmissionStatus.Offer)
        {
            if (!HasCompletedInterview(context))
            {
                throw new InvalidOperationException("An offer can only be sent after the latest interview has been accepted and marked as completed.");
            }

            return;
        }

        if (nextStatus == ResumeSubmissionStatus.Rejected && context.Submission.Status == ResumeSubmissionStatus.Interview && !HasCompletedInterview(context))
        {
            throw new InvalidOperationException("Candidates in interview stage can only be rejected after the latest accepted interview has been marked as completed.");
        }

        if (action.Equals("reject", StringComparison.OrdinalIgnoreCase)
            && context.Submission.Status == ResumeSubmissionStatus.Interview
            && !HasCompletedInterview(context))
        {
            throw new InvalidOperationException("Candidates in interview stage can only be rejected after the latest accepted interview has been marked as completed.");
        }
    }

    private static bool HasCompletedInterview(ApplicantStageContextData context)
        => context.LatestInterview?.Status == InterviewStatus.Completed;

    private static CandidateInterviewSummaryDto? MapInterviewSummary(ApplicantStageContextData context)
        => context.LatestInterview is null
            ? null
            : new CandidateInterviewSummaryDto
            {
                Id = context.LatestInterview.Id,
                ScheduledDateTimeUtc = context.LatestInterview.ScheduledDateTimeUtc,
                Status = context.LatestInterview.Status,
            };

    private async Task<JobOfferEntity?> EnsureOfferExpirationStateAsync(JobOfferEntity? offer, CancellationToken ct)
    {
        if (offer is null || offer.Status != JobOfferStatus.Pending || !offer.ExpirationDate.HasValue)
        {
            return offer;
        }

        var today = DateOnly.FromDateTime(dateTimeProvider.UtcNow);
        if (offer.ExpirationDate.Value >= today)
        {
            return offer;
        }

        offer.Status = JobOfferStatus.Expired;
        offer.UpdatedAtUtc = dateTimeProvider.UtcNow;
        await recruiterRepository.SaveChangesAsync(ct);
        return offer;
    }

    private OfferResponse MapOffer(JobOfferEntity offer)
    {
        var effectiveStatus = ResolveOfferStatus(offer);
        var canRespond = effectiveStatus == JobOfferStatus.Pending;

        return new OfferResponse
        {
            Id = offer.Id,
            ApplicationId = offer.ApplicationId,
            SentByUserId = offer.SentByUserId,
            Title = offer.Title,
            Message = offer.Message,
            SalaryText = offer.SalaryText,
            SalaryAmount = offer.SalaryAmount,
            SalaryType = offer.SalaryType,
            Currency = offer.Currency,
            EmploymentType = offer.EmploymentType,
            WorkSetup = offer.WorkSetup,
            StartDate = offer.StartDate,
            EndDate = offer.EndDate,
            ExpirationDate = offer.ExpirationDate,
            Benefits = offer.Benefits,
            Status = effectiveStatus.ToString(),
            SentAtUtc = offer.SentAtUtc,
            RespondedAtUtc = offer.RespondedAtUtc,
            CreatedAtUtc = offer.CreatedAtUtc,
            UpdatedAtUtc = offer.UpdatedAtUtc,
            CanAccept = canRespond,
            CanDecline = canRespond,
            CanMarkHired = false,
        };
    }

    private JobOfferStatus ResolveOfferStatus(JobOfferEntity offer)
    {
        if (offer.Status == JobOfferStatus.Pending && offer.ExpirationDate.HasValue && offer.ExpirationDate.Value < DateOnly.FromDateTime(dateTimeProvider.UtcNow))
        {
            return JobOfferStatus.Expired;
        }

        return offer.Status;
    }

    private static bool RequiresOfferEndDate(string employmentType)
        => employmentType.Trim().Equals("Contract", StringComparison.OrdinalIgnoreCase)
            || employmentType.Trim().Equals("Internship", StringComparison.OrdinalIgnoreCase)
            || employmentType.Trim().Equals("Temporary", StringComparison.OrdinalIgnoreCase);

    private static string NormalizeOfferOption(string value, IReadOnlySet<string> allowedValues)
        => allowedValues.First(option => option.Equals(value.Trim(), StringComparison.OrdinalIgnoreCase));

    private static string BuildSalaryText(decimal amount, string currency, string salaryType)
    {
        var normalizedCurrency = NormalizeOfferOption(currency, AllowedCurrencies);
        var normalizedSalaryType = NormalizeOfferOption(salaryType, AllowedSalaryTypes);
        return $"{normalizedCurrency} {amount.ToString("N2", global::System.Globalization.CultureInfo.InvariantCulture)} / {normalizedSalaryType.ToLowerInvariant()}";
    }

    private async Task NotifyOfferSentAsync(ResumeSubmissionEntity submission, string jobTitle, JobOfferEntity offer, CancellationToken ct)
    {
        if (!submission.JobSeekerUserId.HasValue)
        {
            return;
        }

        await notificationService.CreateNotificationAsync(new CreateNotificationRequest
        {
            UserId = submission.JobSeekerUserId.Value,
            Title = "New job offer received",
            Message = $"You received an offer for {jobTitle}.",
            Type = NotificationType.Success,
            RelatedEntityId = offer.ApplicationId,
        }, ct);
    }

    private async Task NotifyCandidateHiredAsync(ResumeSubmissionEntity submission, string jobTitle, CancellationToken ct)
    {
        if (!submission.JobSeekerUserId.HasValue)
        {
            return;
        }

        await notificationService.CreateNotificationAsync(new CreateNotificationRequest
        {
            UserId = submission.JobSeekerUserId.Value,
            Title = "You have been marked as hired",
            Message = $"Your application for {jobTitle} has been moved to hired.",
            Type = NotificationType.Success,
            RelatedEntityId = submission.Id,
        }, ct);
    }

    private static bool HasDashboardCompanyContext(RecruiterProfileEntity? profile)
        => profile is not null
            && profile.CompanyId != Guid.Empty
            && profile.Company is not null
            && !string.IsNullOrWhiteSpace(profile.Company.Name);

    private static RecruiterDashboardResponse CreateEmptyDashboardResponse()
        => new();

    private async Task<RecruiterProfileEntity> EnsureProfileCompleteAsync(Guid recruiterId, CancellationToken ct)
    {
        var profile = await recruiterRepository.GetProfileByUserIdAsync(recruiterId, ct)
            ?? throw new InvalidOperationException("Recruiter profile not found.");
        if (!HasDashboardCompanyContext(profile))
        {
            throw new InvalidOperationException("Recruiter company profile must be completed before creating jobs.");
        }

        return profile;
    }

    private async Task<RecruiterProfileEntity> EnsureProfileInCompanyAsync(Guid companyId, Guid recruiterId, CancellationToken ct)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        if (profile.CompanyId != companyId)
        {
            throw new UnauthorizedAccessException("Recruiter profile does not belong to the active company.");
        }

        return profile;
    }

    private static CreateJobRequest BuildDuplicateJobRequest(JobEntity original)
    {
        var requiredSkills = JsonSerializer.Deserialize<List<string>>(original.RequiredSkillsJson) ?? [];
        var preferredSkills = JsonSerializer.Deserialize<List<string>>(original.PreferredSkillsJson) ?? [];

        return new CreateJobRequest
        {
            Title = BuildDuplicateTitle(original.Title),
            Description = original.Description,
            Responsibilities = NormalizeBullets(original.ResponsibilitiesText) ?? string.Empty,
            RequiredSkills = requiredSkills,
            PreferredSkills = preferredSkills,
            ExperienceLevel = original.ExperienceLevel,
            MinYears = original.MinYears,
            Education = original.Education,
            MinEducation = original.Education,
            Department = original.Department,
            Benefits = NormalizeBullets(original.Benefits),
            SalaryMinPerAnnum = original.SalaryMinPerAnnum,
            SalaryMaxPerAnnum = original.SalaryMaxPerAnnum,
            Currency = original.Currency,
            Location = original.Location,
            Schedule = original.Schedule,
            WorkSetup = (int)original.WorkSetup,
            EmploymentType = (int)original.EmploymentType,
            NumberOfVacancies = original.NumberOfVacancies,
            Status = JobStatus.Draft.ToString()
        };
    }

    private static string BuildDuplicateTitle(string title)
    {
        var trimmedTitle = title.Trim();
        if (string.IsNullOrWhiteSpace(trimmedTitle))
        {
            return "Copy of Untitled Job";
        }

        return $"Copy of {trimmedTitle}";
    }

    private static string? NormalizeBullets(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return text;
        }

        var lines = text
            .Replace("\r\n", "\n", StringComparison.Ordinal)
            .Split('\n', StringSplitOptions.RemoveEmptyEntries)
            .Select(line => LeadingBulletPattern.Replace(line.Trim(), string.Empty).Trim())
            .Where(line => !string.IsNullOrWhiteSpace(line))
            .Select(line => $"• {line}");

        return string.Join(Environment.NewLine, lines);
    }

    private static JobStatus ParseStatusOrDefault(string? status)
    {
        if (string.IsNullOrWhiteSpace(status)) return JobStatus.Draft;
        return Enum.TryParse<JobStatus>(status, true, out var parsed) ? parsed : JobStatus.Draft;
    }

    private static bool TryParseUpdatableStatus(string? status, out JobStatus parsedStatus)
    {
        if (Enum.TryParse<JobStatus>(status, true, out parsedStatus) && parsedStatus is JobStatus.Draft or JobStatus.Published or JobStatus.Closed)
        {
            return true;
        }

        parsedStatus = default;
        return false;
    }

    private JobListItemResponse MapJob(JobEntity job, int remainingVacancies)
    {
        var dto = mapper.Map<JobListItemResponse>(job);
        dto.RemainingVacancies = Math.Max(0, remainingVacancies);
        return dto;
    }

    private static EmployeeRecordResponse MapEmployee(EmployeeRecordData employee)
        => new()
        {
            HireId = employee.HireId,
            ResumeSubmissionId = employee.ResumeSubmissionId,
            JobId = employee.JobId,
            JobSeekerUserId = employee.JobSeekerUserId,
            HiredByRecruiterId = employee.HiredByRecruiterId,
            AcceptedOfferId = employee.AcceptedOfferId,
            HireStatus = employee.HireStatus,
            EmployeeName = employee.EmployeeName,
            EmployeeEmail = employee.EmployeeEmail,
            RecruiterName = employee.RecruiterName,
            RecruiterEmail = employee.RecruiterEmail,
            JobTitle = employee.JobTitle,
            Department = employee.Department,
            OfferTitle = employee.OfferTitle,
            OfferSalaryText = employee.OfferSalaryText,
            HireDateUtc = employee.HireDateUtc,
        };

    private List<ApplicantScoreItemResponse> BuildProjectedApplicants(List<ApplicantScoreData> sourceItems, int topPercent)
    {
        var recommendedIds = BuildRecommendedIds(sourceItems, topPercent);
        return sourceItems
            .Select(x => mapper.Map<ApplicantScoreItemResponse>(x, opt => opt.Items["recommendedIds"] = recommendedIds))
            .ToList();
    }

    private static IReadOnlySet<Guid> BuildRecommendedIds(List<ApplicantScoreData> sourceItems, int topPercent)
    {
        var recommendedCount = sourceItems.Count == 0
            ? 0
            : (int)Math.Ceiling(sourceItems.Count * (topPercent / 100d));

        return sourceItems
            .OrderByDescending(x => x.Score)
            .Take(recommendedCount)
            .Select(x => x.ResumeSubmissionId)
            .ToHashSet();
    }

    private async Task<ApplicantScoreItemResponse?> BuildApplicantProjectionAsync(Guid recruiterId, Guid companyId, Guid submissionId, IReadOnlySet<Guid>? recommendedIds, CancellationToken ct)
    {
        var source = await recruiterRepository.GetApplicantScoreBySubmissionIdAsync(recruiterId, companyId, submissionId, ct);
        if (source is null)
        {
            return null;
        }

        recommendedIds ??= BuildRecommendedIds(await recruiterRepository.GetApplicantScoreDataAsync(recruiterId, companyId, null, null, ct), 10);
        var item = mapper.Map<ApplicantScoreItemResponse>(source, opt => opt.Items["recommendedIds"] = recommendedIds);
        var latestOffer = await recruiterRepository.GetLatestOfferByApplicationIdAsync(submissionId, ct);
        latestOffer = await EnsureOfferExpirationStateAsync(latestOffer, ct);
        item.Offer = latestOffer is null ? null : MapOffer(latestOffer);
        return item;
    }

    private async Task<string?> ResolveDisplayedStatusAsync(Guid recruiterId, Guid companyId, Guid submissionId, CancellationToken ct)
    {
        var items = await recruiterRepository.GetApplicantScoreDataAsync(recruiterId, companyId, null, null, ct);
        var recommendedIds = BuildRecommendedIds(items, 10);
        var source = items.FirstOrDefault(x => x.ResumeSubmissionId == submissionId);
        if (source is null)
        {
            return null;
        }

        return mapper.Map<ApplicantScoreItemResponse>(source, opt => opt.Items["recommendedIds"] = recommendedIds).SubmissionStatus;
    }

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
        logger.LogDebug("Invalidating recruiter job caches for recruiter {RecruiterId} after job mutation {JobId}", recruiterId, jobId);
        InvalidateRecruiterCaches(recruiterId);
        cacheService.Remove($"jobs:public:detail:{jobId}");
        cacheService.RemoveByPrefix("jobs:public:list:");
    }
}
