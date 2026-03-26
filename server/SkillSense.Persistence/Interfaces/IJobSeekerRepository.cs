using SkillSense.Domain.Entities;
using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Interfaces
{
    public interface IJobSeekerRepository
    {
        Task<PagedData<JobEntity>> GetPublishedJobsAsync(int pageNumber, int pageSize, string? search, string? sortBy, string? sortDir, CancellationToken ct = default);
        Task<JobEntity?> GetPublishedJobByIdAsync(Guid id, CancellationToken ct = default);
        Task<PagedData<ApplicationListItemData>> GetApplicationsByUserAsync(Guid userId, int pageNumber, int pageSize, string? search, string? status, DateTime? startDate, DateTime? endDate, CancellationToken ct = default);
        Task<ApplicationListItemData?> GetApplicationDetailAsync(Guid userId, Guid applicationId, CancellationToken ct = default);
        Task<ResumeSubmissionEntity?> GetApplicationEntityAsync(Guid userId, Guid applicationId, CancellationToken ct = default);
        Task<ResumeSubmissionEntity?> GetVisibleApplicationEntityAsync(Guid userId, Guid applicationId, CancellationToken ct = default);
        Task<JobOfferEntity?> GetLatestOfferByApplicationIdAsync(Guid userId, Guid applicationId, CancellationToken ct = default);
        Task SaveChangesAsync(CancellationToken ct = default);
        Task<List<SavedJobData>> GetSavedJobsAsync(Guid userId, string? search, CancellationToken ct = default);
        Task<bool> IsJobSavedAsync(Guid userId, Guid jobId, CancellationToken ct = default);
        Task SaveJobAsync(SavedJobEntity entity, CancellationToken ct = default);
        Task RemoveSavedJobAsync(Guid userId, Guid jobId, CancellationToken ct = default);
        Task<JobSeekerProfileEntity?> GetProfileAsync(Guid userId, CancellationToken ct = default);
        Task UpsertProfileAsync(JobSeekerProfileEntity profile, CancellationToken ct = default);
        Task<List<(DateTime Date, int Count)>> GetApplicationAnalyticsAsync(Guid userId, DateTime start, DateTime end, string granularity, CancellationToken ct = default);
    }
}
