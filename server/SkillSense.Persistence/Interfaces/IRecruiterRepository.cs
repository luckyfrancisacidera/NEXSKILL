using Microsoft.EntityFrameworkCore.Storage;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Interfaces;

public interface IRecruiterRepository
{
    Task<RecruiterProfileEntity?> GetProfileByUserIdAsync(Guid recruiterId, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
    Task<PagedData<JobEntity>> GetRecruiterJobsAsync(Guid recruiterId, int pageNumber, int pageSize, string? search, string? department, string? sortBy, string? sortDir, CancellationToken ct = default);
    Task<Dictionary<Guid, int>> GetHiredCountsByJobIdsAsync(IReadOnlyCollection<Guid> jobIds, CancellationToken ct = default);
    Task<int> GetHiredCountByJobIdAsync(Guid jobId, CancellationToken ct = default);
    Task<RecruiterDashboardFilterData> GetDashboardFilterDataAsync(Guid recruiterId, CancellationToken ct = default);
    Task<List<Guid>> GetDashboardJobIdsAsync(Guid recruiterId, string? department, string? jobRole, CancellationToken ct = default);
    Task<List<ResumeSubmissionEntity>> GetDashboardApplicationsAsync(IReadOnlyCollection<Guid> jobIds, DateTime? startUtc, DateTime? endExclusiveUtc, CancellationToken ct = default);
    Task<Dictionary<Guid, (string Title, string Department)>> GetJobLookupAsync(Guid recruiterId, CancellationToken ct = default);
    Task<List<ApplicantScoreData>> GetApplicantScoreDataAsync(Guid recruiterId, string? department, string? search, CancellationToken ct = default);
    Task<ApplicantScoreData?> GetApplicantScoreBySubmissionIdAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default);
    Task<List<JobFilterData>> GetJobFiltersAsync(Guid recruiterId, string? department, CancellationToken ct = default);
    Task<string?> GetParsedResumeJsonAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default);
    Task<ApplicantStageContextData?> GetApplicantStageContextAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default);
    Task<IDbContextTransaction> BeginSerializableTransactionAsync(CancellationToken ct = default);
}
