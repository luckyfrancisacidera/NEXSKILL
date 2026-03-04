using SkillSense.Domain.Entities;
using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Interfaces
{
    public interface IJobSeekerRepository
    {
        Task<PagedData<JobEntity>> GetPublishedJobsAsync(int pageNumber, int pageSize, string? search, string? sortBy, string? sortDir, CancellationToken ct = default);
        Task<JobEntity?> GetPublishedJobByIdAsync(Guid id, CancellationToken ct = default);
        Task<PagedData<MyApplicationData>> GetApplicationsByUserAsync(Guid userId, int pageNumber, int pageSize, CancellationToken ct = default);
    }
}
