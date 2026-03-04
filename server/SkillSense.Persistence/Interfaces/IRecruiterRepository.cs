using SkillSense.Domain.Entities;
using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Interfaces;

public interface IRecruiterRepository
{
    Task<RecruiterProfileEntity?> GetProfileByUserIdAsync(Guid recruiterId, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
    Task<PagedData<JobEntity>> GetRecruiterJobsAsync(Guid recruiterId, int pageNumber, int pageSize, string? search, string? sortBy, string? sortDir, CancellationToken ct = default);
    Task<List<JobEntity>> GetRecruiterJobsCreatedSinceAsync(Guid recruiterId, DateTime startDateUtc, CancellationToken ct = default);
    Task<List<ResumeSubmissionEntity>> GetSubmissionsForJobsCreatedSinceAsync(IEnumerable<Guid> jobIds, DateTime startDateUtc, CancellationToken ct = default);
    Task<List<ApplicantScoreData>> GetApplicantScoreDataAsync(Guid recruiterId, Guid? jobId, string? search, CancellationToken ct = default);
    Task<List<JobFilterData>> GetJobFiltersAsync(Guid recruiterId, CancellationToken ct = default);
}
