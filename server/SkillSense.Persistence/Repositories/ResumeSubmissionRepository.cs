using Microsoft.EntityFrameworkCore;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Persistence.Repositories;

public sealed class ResumeSubmissionRepository(SkillSenseDbContext dbContext) : IResumeSubmissionRepository
{
    public async Task AddAsync(ResumeSubmissionEntity submission, CancellationToken ct = default)
    {
        dbContext.ResumeSubmissions.Add(submission);
        await dbContext.SaveChangesAsync(ct);
    }

    public Task<ResumeSubmissionEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => dbContext.ResumeSubmissions.FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<ResumeSubmissionEntity?> GetNextPendingAsync(CancellationToken ct = default)
        => dbContext.ResumeSubmissions
            .OrderBy(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync(x => x.Status == ResumeSubmissionStatus.Pending, ct);

    public async Task<List<ResumeSubmissionEntity>> ClaimProcessableBatchAsync(
        int batchSize,
        DateTime utcNow,
        int maxRetryAttempts,
        CancellationToken ct = default)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(batchSize);
        ArgumentOutOfRangeException.ThrowIfNegative(maxRetryAttempts);

        var claimed = new List<ResumeSubmissionEntity>(batchSize);

        while (claimed.Count < batchSize)
        {
            var candidate = await dbContext.ResumeSubmissions
                .AsNoTracking()
                .Where(IsProcessable(utcNow, maxRetryAttempts))
                .OrderBy(x => x.Status == ResumeSubmissionStatus.Pending ? 0 : 1)
                .ThenBy(x => x.NextRetryAtUtc ?? x.CreatedAtUtc)
                .ThenBy(x => x.CreatedAtUtc)
                .Select(x => new { x.Id })
                .FirstOrDefaultAsync(ct);

            if (candidate is null)
            {
                break;
            }

            var claimedRows = await dbContext.ResumeSubmissions
                .Where(x => x.Id == candidate.Id)
                .Where(IsProcessable(utcNow, maxRetryAttempts))
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(x => x.Status, ResumeSubmissionStatus.Processing)
                    .SetProperty(x => x.NextRetryAtUtc, (DateTime?)null)
                    .SetProperty(x => x.UpdatedAtUtc, utcNow), ct);

            if (claimedRows == 0)
            {
                continue;
            }

            var submission = await dbContext.ResumeSubmissions.FirstAsync(x => x.Id == candidate.Id, ct);
            claimed.Add(submission);
        }

        return claimed;
    }

    public Task<bool> ExistsActiveApplicationAsync(Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default)
        => dbContext.ResumeSubmissions.AsNoTracking().AnyAsync(
            x => x.JobId == jobId
                && x.JobSeekerUserId == jobSeekerUserId
                && (x.Status != ResumeSubmissionStatus.Failed || x.NextRetryAtUtc != null),
            ct);

    public Task<ResumeSubmissionEntity?> GetActiveApplicationAsync(Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default)
        => dbContext.ResumeSubmissions
            .AsNoTracking()
            .Where(x => x.JobId == jobId
                && x.JobSeekerUserId == jobSeekerUserId
                && (x.Status != ResumeSubmissionStatus.Failed || x.NextRetryAtUtc != null))
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => dbContext.SaveChangesAsync(ct);

    private static System.Linq.Expressions.Expression<Func<ResumeSubmissionEntity, bool>> IsProcessable(DateTime utcNow, int maxRetryAttempts)
        => x => x.Status == ResumeSubmissionStatus.Pending
            || (x.Status == ResumeSubmissionStatus.Failed
                && x.RetryCount < maxRetryAttempts
                && x.NextRetryAtUtc.HasValue
                && x.NextRetryAtUtc <= utcNow);
}
