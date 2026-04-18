namespace SkillSense.Application.Interfaces;

/// <summary>
/// Processes queued resume submissions and persists downstream parsing and scoring artifacts.
/// </summary>
public interface IResumeProcessingService
{
    /// <summary>
    /// Processes up to the requested number of pending submissions.
    /// </summary>
    Task<int> ProcessPendingBatchAsync(int batchSize, CancellationToken ct = default);

    /// <summary>
    /// Processes a previously claimed submission by id.
    /// </summary>
    Task<bool> ProcessClaimedSubmissionAsync(Guid submissionId, CancellationToken ct = default);
}
