using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Interfaces
{
    public interface IResumeScoreRepository
    {
        Task AddAsync(ResumeScoreEntity score, bool saveChanges = true, CancellationToken ct = default);
        Task DeleteBySubmissionIdAsync(Guid submissionId, bool saveChanges = true, CancellationToken ct = default);
    }
}
