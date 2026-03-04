using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Interfaces
{
    public interface IJobRepository
    {
        Task AddAsync(JobEntity job, CancellationToken ct = default);
        Task UpdateAsync(JobEntity job, CancellationToken ct = default);
        Task DeleteAsync(JobEntity job, CancellationToken ct = default);
        Task<JobEntity?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<JobEntity?> GetByIdForRecruiterAsync(Guid id, Guid recruiterId, CancellationToken ct = default);
        IQueryable<JobEntity> Query();
    }
}
