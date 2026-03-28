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

        if (now - snapshot.LastWorkerHeartbeatUtc > heartbeatTolerance)
        {
            return HealthCheckResult.Unhealthy(
                $"Resume processing worker heartbeat is stale. Last heartbeat was at {snapshot.LastWorkerHeartbeatUtc:O}.");
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
            return HealthCheckResult.Unhealthy(
                $"Recent resume processing failures detected. Count={unresolvedRecentFailures.Count}, LastSubmissionId={lastFailedSubmission.Id}, LastFailureUtc={lastFailedSubmission.UpdatedAtUtc:O}, Stage={snapshot.LastStage}, Error={snapshot.LastFailureMessage}");
        }

        if (snapshot.LastFailureUtc.HasValue
            && (!snapshot.LastSuccessfulSubmissionUtc.HasValue || snapshot.LastFailureUtc > snapshot.LastSuccessfulSubmissionUtc))
        {
            return HealthCheckResult.Unhealthy(
                $"Resume processing worker reported a recent failure at stage '{snapshot.LastStage}'. Error={snapshot.LastFailureMessage}");
        }

        return HealthCheckResult.Healthy(
            $"Resume processing worker is healthy. LastHeartbeatUtc={snapshot.LastWorkerHeartbeatUtc:O}, LastSuccessfulSubmissionUtc={snapshot.LastSuccessfulSubmissionUtc:O}");
    }
}
