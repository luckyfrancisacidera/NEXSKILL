using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Interfaces
{
    public interface IResumeScoreRepository
    {
        Task AddAsync(ResumeScoreEntity score, CancellationToken ct = default);
    }
}
