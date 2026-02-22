using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Interfaces
{
    public interface IJobRepository
    {
        Task AddAsync(JobEntity job, CancellationToken ct = default);
        Task<JobEntity?> GetByIdAsync(Guid id, CancellationToken ct = default);
    }
}
