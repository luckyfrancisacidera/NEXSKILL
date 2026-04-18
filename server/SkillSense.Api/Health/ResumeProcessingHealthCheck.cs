using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using SkillSense.Application.Interfaces;
using SkillSense.Infrastructure.Options;

namespace SkillSense.Api.Health;

public sealed class ResumeProcessingHealthCheck(
    IResumeProcessingMonitor processingMonitor,
    IOptions<ResumeProcessingWorkerOptions> workerOptions) : IHealthCheck
{
    private readonly ResumeProcessingWorkerOptions _workerOptions = workerOptions.Value;
    private static readonly TimeSpan ActiveProcessingTimeoutFloor = TimeSpan.FromMinutes(10);

    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var snapshot = processingMonitor.GetSnapshot();
        var now = DateTimeOffset.UtcNow;
        var heartbeatTolerance = TimeSpan.FromTicks(Math.Max(
            TimeSpan.FromSeconds(30).Ticks,
            _workerOptions.MaxBackoff.Ticks * 2));

        if (snapshot.LastWorkerHeartbeatUtc is null)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("Resume processing worker has not reported a heartbeat yet."));
        }

        if (!snapshot.IsProcessing && now - snapshot.LastWorkerHeartbeatUtc > heartbeatTolerance)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy(
                $"Resume processing worker heartbeat is stale. Last heartbeat was at {snapshot.LastWorkerHeartbeatUtc:O}."));
        }

        if (snapshot.IsProcessing)
        {
            if (!snapshot.CurrentStageStartedUtc.HasValue || string.IsNullOrWhiteSpace(snapshot.CurrentStage))
            {
                return Task.FromResult(HealthCheckResult.Unhealthy("Resume processing worker reported an inconsistent in-progress state."));
            }

            var processingTimeout = GetActiveProcessingTimeout(heartbeatTolerance);
            var currentStageElapsed = now - snapshot.CurrentStageStartedUtc.Value;
            if (currentStageElapsed > processingTimeout)
            {
                return Task.FromResult(HealthCheckResult.Unhealthy(
                    $"Resume processing appears stuck. SubmissionId={snapshot.CurrentSubmissionId}, Stage={snapshot.CurrentStage}, StageStartedUtc={snapshot.CurrentStageStartedUtc:O}, ElapsedMs={(long)currentStageElapsed.TotalMilliseconds}"));
            }
        }

        if (snapshot.HasActiveFailure)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy(
                $"Resume processing worker reported an active failure. SubmissionId={snapshot.LastFailedSubmissionId}, Stage={snapshot.LastFailureStage ?? "unknown"}, LastFailureUtc={snapshot.LastFailureUtc:O}, Error={snapshot.LastFailureMessage ?? "No error message provided"}"));
        }

        if (snapshot.IsProcessing)
        {
            return Task.FromResult(HealthCheckResult.Healthy(
                $"Resume processing worker is actively processing. CurrentSubmissionId={snapshot.CurrentSubmissionId}, CurrentStage={snapshot.CurrentStage}, CurrentStageStartedUtc={snapshot.CurrentStageStartedUtc:O}, LastHeartbeatUtc={snapshot.LastWorkerHeartbeatUtc:O}"));
        }

        return Task.FromResult(HealthCheckResult.Healthy(
            $"Resume processing worker is healthy. LastHeartbeatUtc={snapshot.LastWorkerHeartbeatUtc:O}, LastSuccessfulSubmissionUtc={snapshot.LastSuccessfulSubmissionUtc:O}"));
    }

    private TimeSpan GetActiveProcessingTimeout(TimeSpan heartbeatTolerance)
        => TimeSpan.FromTicks(Math.Max(
            ActiveProcessingTimeoutFloor.Ticks,
            Math.Max(_workerOptions.IdleTimeout.Ticks, heartbeatTolerance.Ticks)));
}
