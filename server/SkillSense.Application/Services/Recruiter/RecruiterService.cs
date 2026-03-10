using System.Text.Json;
using AutoMapper;
using Microsoft.Extensions.Logging;
using SkillSense.Application.Common.Jobs;
using SkillSense.Application.Common.Recruiter;
using SkillSense.Application.Common.Text;
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
    IMapper mapper,
    ILogger<RecruiterService> logger) : IRecruiterService
{
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

        mapper.Map(request, profile);
        await recruiterRepository.SaveChangesAsync(ct);

        return mapper.Map<RecruiterProfileResponse>(profile);
    }

    public async Task<JobListItemResponse> CreateJobAsync(Guid recruiterId, CreateJobRequest request, CancellationToken ct = default)
    {
        var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
        if (string.IsNullOrWhiteSpace(request.Location)) throw new ArgumentException("location is required");
        if (request.NumberOfVacancies < 0) throw new ArgumentException("number_of_vacancies cannot be negative");

        var embedding = await embeddingService.EmbedAsync(request.Description, ct);
        var status = ParseStatusOrDefault(request.Status);
        var job = mapper.Map<JobEntity>(request);

        job.Id = Guid.NewGuid();
        job.RecruiterId = recruiterId;
        job.DescriptionEmbeddingJson = JsonSerializer.Serialize(embedding);
        job.RequiredSkillsJson = JsonSerializer.Serialize(request.RequiredSkills);
        job.PreferredSkillsJson = JsonSerializer.Serialize(request.PreferredSkills);
        job.Currency = string.IsNullOrWhiteSpace(request.Currency) ? "PHP" : request.Currency;
        job.Status = status;
        job.CreatedAtUtc = DateTime.UtcNow;
        job.PostedDateUtc = status == JobStatus.Published ? DateTime.UtcNow : null;
        job.CompanyNameSnapshot = profile.CompanyName;
        job.CompanyEmailSnapshot = profile.CompanyEmail;
        job.JobDescriptionStructuredJson = JsonSerializer.Serialize(NormalizedJobDescriptionFactory.Create(request));
        job.NumberOfVacancies = request.NumberOfVacancies;

        await jobRepository.AddAsync(job, ct);
        InvalidateRecruiterCaches(recruiterId);
        cacheService.RemoveByPrefix("jobs:public:list:");
        return MapJob(job, job.NumberOfVacancies);
    }

    public async Task<JobListItemResponse> UpdateJobAsync(Guid recruiterId, Guid jobId, UpdateJobRequest request, CancellationToken ct = default)
    {
        var job = await jobRepository.GetByIdForRecruiterAsync(jobId, recruiterId, ct) ?? throw new KeyNotFoundException("Job not found.");
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
        var job = await jobRepository.GetByIdForRecruiterAsync(jobId, recruiterId, ct) ?? throw new KeyNotFoundException("Job not found.");
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
        var job = await jobRepository.GetByIdForRecruiterAsync(jobId, recruiterId, ct);
        if (job is null)
        {
            return null;
        }

        var remainingVacancies = await GetRemainingVacanciesByJobIdAsync(job.Id, job.NumberOfVacancies, ct);
        return MapJob(job, remainingVacancies);
    }

    public async Task DeleteJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
    {
        var job = await jobRepository.GetByIdForRecruiterAsync(jobId, recruiterId, ct) ?? throw new KeyNotFoundException("Job not found.");
        await jobRepository.DeleteAsync(job, ct);
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
        var baseItem = await BuildApplicantProjectionAsync(recruiterId, submissionId, null, ct);
        if (baseItem is null)
        {
            return null;
        }

        var parsedResumeJson = await recruiterRepository.GetParsedResumeJsonAsync(recruiterId, submissionId, ct);
        CandidateExplanationResponse? explanation = null;
        var allowedStatusesForExplanation = new[] { "Shortlisted", "Interview", "Hire", "Offer" };
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
        return detail;
    }

    public async Task<ApplicantScoreItemResponse> UpdateApplicantStatusAsync(Guid recruiterId, Guid submissionId, UpdateApplicantStageRequest request, CancellationToken ct = default)
    {
        var action = ApplicantStageTransitionPolicy.ResolveAction(request.Action, request.Status);
        logger.LogInformation("Recruiter {RecruiterId} updating submission {SubmissionId}. Action={Action}", recruiterId, submissionId, action);
        await using var transaction = await recruiterRepository.BeginSerializableTransactionAsync(ct);
        var context = await recruiterRepository.GetApplicantStageContextAsync(recruiterId, submissionId, ct)
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

        var now = DateTime.UtcNow;
        if (nextStatus == ResumeSubmissionStatus.Hire && context.Submission.Status != ResumeSubmissionStatus.Hire)
        {
            var hiredCount = await recruiterRepository.GetHiredCountByJobIdAsync(context.Job.Id, ct);
            if (hiredCount >= context.Job.NumberOfVacancies)
            {
                logger.LogWarning("Recruiter {RecruiterId} exceeded vacancy limit while hiring submission {SubmissionId} for job {JobId}", recruiterId, submissionId, context.Job.Id);
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
        var updated = await BuildApplicantProjectionAsync(recruiterId, submissionId, null, ct)
            ?? throw new KeyNotFoundException("Submission not found after update.");

        return updated;
    }

    public async Task<BulkUpdateApplicantStageResponse> UpdateApplicantStatusesAsync(Guid recruiterId, BulkUpdateApplicantStageRequest request, CancellationToken ct = default)
    {
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

            var allItemsForStatus = await recruiterRepository.GetApplicantScoreDataAsync(recruiterId, null, null, ct);
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
                    var context = await recruiterRepository.GetApplicantStageContextAsync(recruiterId, submissionId, ct)
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

                    if (nextStatus == ResumeSubmissionStatus.Hire && context.Submission.Status != ResumeSubmissionStatus.Hire)
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
                var updatedCandidate = await BuildApplicantProjectionAsync(recruiterId, result.SubmissionId, recommendedIds, ct);
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
            var refreshedItems = await recruiterRepository.GetApplicantScoreDataAsync(recruiterId, null, null, ct);
            var projectedForCounts = BuildProjectedApplicants(refreshedItems, 10);
            var counts = new ApplicantScoreCountsResponse
            {
                AllApplicants = projectedForCounts.Count,
                Recommended = projectedForCounts.Count(x => x.SubmissionStatus == "Recommended"),
                Shortlisted = projectedForCounts.Count(x => x.SubmissionStatus == "Shortlisted"),
                Interview = projectedForCounts.Count(x => x.SubmissionStatus == "Interview"),
                Offer = projectedForCounts.Count(x => x.SubmissionStatus == "Offer"),
                Hire = projectedForCounts.Count(x => x.SubmissionStatus == "Hire"),
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

    private async Task<ApplicantScoreItemResponse?> BuildApplicantProjectionAsync(Guid recruiterId, Guid submissionId, IReadOnlySet<Guid>? recommendedIds, CancellationToken ct)
    {
        var source = await recruiterRepository.GetApplicantScoreBySubmissionIdAsync(recruiterId, submissionId, ct);
        if (source is null)
        {
            return null;
        }

        recommendedIds ??= BuildRecommendedIds(await recruiterRepository.GetApplicantScoreDataAsync(recruiterId, null, null, ct), 10);

        return mapper.Map<ApplicantScoreItemResponse>(source, opt => opt.Items["recommendedIds"] = recommendedIds);
    }

    private async Task<string?> ResolveDisplayedStatusAsync(Guid recruiterId, Guid submissionId, CancellationToken ct)
    {
        var items = await recruiterRepository.GetApplicantScoreDataAsync(recruiterId, null, null, ct);
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
        InvalidateRecruiterCaches(recruiterId);
        cacheService.Remove($"jobs:public:detail:{jobId}");
        cacheService.RemoveByPrefix("jobs:public:list:");
    }
}













