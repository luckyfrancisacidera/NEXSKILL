using Microsoft.EntityFrameworkCore.Storage;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Interfaces;

/// <summary>
/// Defines persistence operations used by recruiter application services.
/// </summary>
public interface IRecruiterRepository
{
    /// <summary>
    /// Returns the recruiter profile for a user.
    /// </summary>
    Task<RecruiterProfileEntity?> GetProfileByUserIdAsync(Guid recruiterId, CancellationToken ct = default);

    /// <summary>
    /// Commits pending recruiter-related changes.
    /// </summary>
    Task SaveChangesAsync(CancellationToken ct = default);

    /// <summary>
    /// Returns recruiter-owned jobs using existing paging, filtering, and sorting behavior.
    /// </summary>
    Task<PagedData<JobEntity>> GetRecruiterJobsAsync(Guid recruiterId, int pageNumber, int pageSize, string? search, string? department, string? sortBy, string? sortDir, CancellationToken ct = default);

    /// <summary>
    /// Returns hired submission counts grouped by job identifier.
    /// </summary>
    Task<Dictionary<Guid, int>> GetHiredCountsByJobIdsAsync(IReadOnlyCollection<Guid> jobIds, CancellationToken ct = default);

    /// <summary>
    /// Returns the hired submission count for a single job.
    /// </summary>
    Task<int> GetHiredCountByJobIdAsync(Guid jobId, CancellationToken ct = default);

    /// <summary>
    /// Returns dashboard filter metadata for the recruiter.
    /// </summary>
    Task<RecruiterDashboardFilterData> GetDashboardFilterDataAsync(Guid recruiterId, CancellationToken ct = default);

    /// <summary>
    /// Returns job identifiers that match the dashboard filters.
    /// </summary>
    Task<List<Guid>> GetDashboardJobIdsAsync(Guid recruiterId, string? department, string? jobRole, CancellationToken ct = default);

    /// <summary>
    /// Returns application records for the supplied job identifiers and date range.
    /// </summary>
    Task<List<ResumeSubmissionEntity>> GetDashboardApplicationsAsync(IReadOnlyCollection<Guid> jobIds, DateTime? startUtc, DateTime? endExclusiveUtc, CancellationToken ct = default);

    /// <summary>
    /// Returns a lookup of recruiter jobs for dashboard trend grouping.
    /// </summary>
    Task<Dictionary<Guid, (string Title, string Department)>> GetJobLookupAsync(Guid recruiterId, CancellationToken ct = default);

    /// <summary>
    /// Returns applicant score source rows for recruiter applicant views.
    /// </summary>
    Task<List<ApplicantScoreData>> GetApplicantScoreDataAsync(Guid recruiterId, string? department, string? search, CancellationToken ct = default);

    /// <summary>
    /// Returns published job filter metadata for recruiter applicant views.
    /// </summary>
    Task<List<JobFilterData>> GetJobFiltersAsync(Guid recruiterId, string? department, CancellationToken ct = default);

    /// <summary>
    /// Returns the parsed resume JSON for a recruiter-accessible submission.
    /// </summary>
    Task<string?> GetParsedResumeJsonAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default);

    /// <summary>
    /// Returns the tracked submission and job entities required for applicant stage transitions.
    /// </summary>
    Task<ApplicantStageContextData?> GetApplicantStageContextAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default);

    /// <summary>
    /// Begins a serializable transaction for recruiter stage mutation flows.
    /// </summary>
    Task<IDbContextTransaction> BeginSerializableTransactionAsync(CancellationToken ct = default);
}
