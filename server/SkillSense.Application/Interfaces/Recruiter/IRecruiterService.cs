using SkillSense.Application.Contracts.Recruiter.Request;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces.Recruiter;

/// <summary>
/// Defines recruiter-facing operations for profiles, jobs, dashboards, and applicant stage management.
/// </summary>
public interface IRecruiterService
{
    /// <summary>
    /// Returns the recruiter company profile.
    /// </summary>
    Task<RecruiterProfileResponse> GetProfileAsync(Guid recruiterId, CancellationToken ct = default);

    /// <summary>
    /// Creates or updates the recruiter company profile.
    /// </summary>
    Task<RecruiterProfileResponse> UpsertProfileAsync(Guid recruiterId, RecruiterProfileRequest request, CancellationToken ct = default);

    /// <summary>
    /// Creates a new recruiter-owned job.
    /// </summary>
    Task<JobListItemResponse> CreateJobAsync(Guid recruiterId, CreateJobRequest request, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing recruiter-owned job.
    /// </summary>
    Task<JobListItemResponse> UpdateJobAsync(Guid recruiterId, Guid jobId, UpdateJobRequest request, CancellationToken ct = default);

    /// <summary>
    /// Returns recruiter-owned jobs using paging and filtering.
    /// </summary>
    Task<PagedResult<JobListItemResponse>> GetJobsAsync(Guid recruiterId, int pageNumber, int pageSize, string? search, string? department, string? sortBy, string? sortDir, CancellationToken ct = default);

    /// <summary>
    /// Returns a single recruiter-owned job.
    /// </summary>
    Task<JobListItemResponse?> GetJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default);

    /// <summary>
    /// Deletes a recruiter-owned job.
    /// </summary>
    Task DeleteJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default);

    /// <summary>
    /// Publishes a recruiter-owned job.
    /// </summary>
    Task PublishJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default);

    /// <summary>
    /// Closes a recruiter-owned job.
    /// </summary>
    Task CloseJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default);

    /// <summary>
    /// Returns recruiter dashboard data.
    /// </summary>
    Task<RecruiterDashboardResponse> GetDashboardAsync(Guid recruiterId, DateTime? startDate, DateTime? endDate, string? department, string? jobRole, string? groupBy, CancellationToken ct = default);

    /// <summary>
    /// Returns applicant score projections and filtering metadata.
    /// </summary>
    Task<ApplicantScoresResponse> GetApplicantScoresAsync(Guid recruiterId, Guid? jobId, string? department, string? stage, string? search, int? recommendedTopPercent, int pageNumber, int pageSize, CancellationToken ct = default);

    /// <summary>
    /// Returns the detailed recruiter view for a single submission.
    /// </summary>
    Task<ApplicantDetailResponse?> GetApplicantBySubmissionIdAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default);

    /// <summary>
    /// Updates the stage of a single applicant submission.
    /// </summary>
    Task UpdateApplicantStatusAsync(Guid recruiterId, Guid submissionId, UpdateApplicantStageRequest request, CancellationToken ct = default);

    /// <summary>
    /// Applies a stage update across multiple applicant submissions.
    /// </summary>
    Task<BulkUpdateApplicantStageResponse> UpdateApplicantStatusesAsync(Guid recruiterId, BulkUpdateApplicantStageRequest request, CancellationToken ct = default);
}
