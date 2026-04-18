using System;
using System.Collections.Generic;
using System.Text;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Interfaces
{
    public interface IResumeSubmissionRepository
    {
        Task AddAsync(ResumeSubmissionEntity submission, CancellationToken ct = default);
        Task<ResumeSubmissionEntity?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<ResumeSubmissionEntity?> GetNextPendingAsync(CancellationToken ct = default);
        Task<List<ResumeSubmissionEntity>> ClaimProcessableBatchAsync(int batchSize, DateTime utcNow, int maxRetryAttempts, CancellationToken ct = default);
        Task<bool> ExistsActiveApplicationAsync(Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default);
        Task SaveChangesAsync(CancellationToken ct = default);
    }
}
