using Microsoft.EntityFrameworkCore;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Repositories;

/// <summary>
/// Provides persistence operations for recruiter candidate explanation records.
/// </summary>
public sealed class CandidateExplanationRepository(SkillSenseDbContext dbContext) : ICandidateExplanationRepository
{
    /// <summary>
    /// Returns the explanation entity associated with the submission when one exists.
    /// </summary>
    public Task<CandidateExplanationEntity?> GetBySubmissionIdAsync(Guid submissionId, CancellationToken ct = default)
        => dbContext.CandidateExplanations.FirstOrDefaultAsync(x => x.ResumeSubmissionId == submissionId, ct);

    /// <summary>
    /// Returns the joined payload required to generate an explanation.
    /// </summary>
    public Task<CandidateExplanationPayloadData?> GetExplanationPayloadAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default)
        => dbContext.ResumeSubmissions
            .AsNoTracking()
            .Join(
                dbContext.Jobs.AsNoTracking(),
                submission => submission.JobId,
                job => job.Id,
                (submission, job) => new { submission, job })
            .Join(
                dbContext.ResumeScores.AsNoTracking(),
                x => x.submission.Id,
                score => score.ResumeSubmissionId,
                (x, score) => new CandidateExplanationPayloadData
                {
                    Submission = x.submission,
                    Job = x.job,
                    Score = score,
                })
            .Where(x => x.Submission.Id == submissionId && x.Job.RecruiterId == recruiterId)
            .FirstOrDefaultAsync(ct);

    /// <summary>
    /// Returns the succeeded explanation record for a submission.
    /// </summary>
    public Task<CandidateExplanationEntity?> GetSucceededExplanationAsync(Guid submissionId, CancellationToken ct = default)
        => dbContext.CandidateExplanations
            .AsNoTracking()
            .Where(x => x.ResumeSubmissionId == submissionId && x.Status == ExplanationStatus.Succeeded)
            .FirstOrDefaultAsync(ct);

    /// <summary>
    /// Persists a newly created explanation entity.
    /// </summary>
    public async Task AddAsync(CandidateExplanationEntity entity, CancellationToken ct = default)
    {
        dbContext.CandidateExplanations.Add(entity);
        await dbContext.SaveChangesAsync(ct);
    }

    /// <summary>
    /// Commits pending explanation changes.
    /// </summary>
    public Task SaveChangesAsync(CancellationToken ct = default)
        => dbContext.SaveChangesAsync(ct);
}
