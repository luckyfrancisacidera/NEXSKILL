using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using SkillSense.Application.Interfaces;
using SkillSense.Domain.Entities;
using SkillSense.Infrastructure.Options;
using SkillSense.Persistence.Data;

namespace SkillSense.Api.Health;

public sealed class ResumeProcessingHealthCheck(
    SkillSenseDbContext dbContext,
    IResumeProcessingMonitor processingMonitor,
    IOptions<ResumeProcessingWorkerOptions> workerOptions) : IHealthCheck
{
    private readonly ResumeProcessingWorkerOptions _workerOptions = workerOptions.Value;
    private static readonly TimeSpan ActiveProcessingTimeoutFloor = TimeSpan.FromMinutes(10);

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var snapshot = processingMonitor.GetSnapshot();
        var now = DateTimeOffset.UtcNow;
        var heartbeatTolerance = TimeSpan.FromTicks(Math.Max(
            TimeSpan.FromSeconds(30).Ticks,
            _workerOptions.MaxBackoff.Ticks * 2));
        var failureWindowStart = now.UtcDateTime - TimeSpan.FromMinutes(15);

        if (snapshot.LastWorkerHeartbeatUtc is null)
        {
            return HealthCheckResult.Unhealthy("Resume processing worker has not reported a heartbeat yet.");
        }

        if (!snapshot.IsProcessing && now - snapshot.LastWorkerHeartbeatUtc > heartbeatTolerance)
        {
            return HealthCheckResult.Unhealthy(
                $"Resume processing worker heartbeat is stale. Last heartbeat was at {snapshot.LastWorkerHeartbeatUtc:O}.");
        }

        if (snapshot.IsProcessing)
        {
            if (!snapshot.CurrentStageStartedUtc.HasValue || string.IsNullOrWhiteSpace(snapshot.CurrentStage))
            {
                return HealthCheckResult.Unhealthy("Resume processing worker reported an inconsistent in-progress state.");
            }

            var processingTimeout = GetActiveProcessingTimeout(heartbeatTolerance);
            var currentStageElapsed = now - snapshot.CurrentStageStartedUtc.Value;
            if (currentStageElapsed > processingTimeout)
            {
                return HealthCheckResult.Unhealthy(
                    $"Resume processing appears stuck. SubmissionId={snapshot.CurrentSubmissionId}, Stage={snapshot.CurrentStage}, StageStartedUtc={snapshot.CurrentStageStartedUtc:O}, ElapsedMs={(long)currentStageElapsed.TotalMilliseconds}");
            }
        }

        if (snapshot.HasActiveFailure)
        {
            return HealthCheckResult.Unhealthy(
                $"Resume processing worker reported an active failure. SubmissionId={snapshot.LastFailedSubmissionId}, Stage={snapshot.LastFailureStage ?? "unknown"}, LastFailureUtc={snapshot.LastFailureUtc:O}, Error={snapshot.LastFailureMessage ?? "No error message provided"}");
        }

        var recentFailedSubmissions = await dbContext.ResumeSubmissions
            .AsNoTracking()
            .Where(submission =>
                submission.Status == ResumeSubmissionStatus.Failed
                && submission.UpdatedAtUtc >= failureWindowStart)
            .OrderByDescending(submission => submission.UpdatedAtUtc)
            .Take(5)
            .Select(submission => new
            {
                submission.Id,
                submission.UpdatedAtUtc,
            })
            .ToListAsync(cancellationToken);

        var unresolvedRecentFailures = recentFailedSubmissions
            .Where(submission =>
                !snapshot.LastSuccessfulSubmissionUtc.HasValue
                || submission.UpdatedAtUtc > snapshot.LastSuccessfulSubmissionUtc.Value.UtcDateTime)
            .ToList();

        if (unresolvedRecentFailures.Count > 0)
        {
            var lastFailedSubmission = unresolvedRecentFailures[0];
            var failureMessage = snapshot.LastFailureMessage ?? "No error message provided";
            var failureStage = snapshot.LastFailureStage ?? "unknown";

            if (snapshot.IsProcessing)
            {
                return HealthCheckResult.Degraded(
                    $"Resume processing is actively progressing. CurrentSubmissionId={snapshot.CurrentSubmissionId}, CurrentStage={snapshot.CurrentStage}, CurrentStageStartedUtc={snapshot.CurrentStageStartedUtc:O}, PreviousFailureCount={unresolvedRecentFailures.Count}, LastFailedSubmissionId={lastFailedSubmission.Id}, LastFailureUtc={lastFailedSubmission.UpdatedAtUtc:O}, PreviousFailureStage={failureStage}, PreviousFailureError={failureMessage}");
            }

            return HealthCheckResult.Unhealthy(
                $"Recent resume processing failures detected. Count={unresolvedRecentFailures.Count}, LastSubmissionId={lastFailedSubmission.Id}, LastFailureUtc={lastFailedSubmission.UpdatedAtUtc:O}, Stage={failureStage}, Error={failureMessage}");
        }

        if (snapshot.IsProcessing)
        {
            return HealthCheckResult.Healthy(
                $"Resume processing worker is actively processing. CurrentSubmissionId={snapshot.CurrentSubmissionId}, CurrentStage={snapshot.CurrentStage}, CurrentStageStartedUtc={snapshot.CurrentStageStartedUtc:O}, LastHeartbeatUtc={snapshot.LastWorkerHeartbeatUtc:O}");
        }

        return HealthCheckResult.Healthy(
            $"Resume processing worker is healthy. LastHeartbeatUtc={snapshot.LastWorkerHeartbeatUtc:O}, LastSuccessfulSubmissionUtc={snapshot.LastSuccessfulSubmissionUtc:O}");
    }

    private TimeSpan GetActiveProcessingTimeout(TimeSpan heartbeatTolerance)
        => TimeSpan.FromTicks(Math.Max(
            ActiveProcessingTimeoutFloor.Ticks,
            Math.Max(_workerOptions.IdleTimeout.Ticks, heartbeatTolerance.Ticks)));
}
