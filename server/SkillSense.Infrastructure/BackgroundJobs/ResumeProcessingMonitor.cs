using SkillSense.Application.Interfaces;

namespace SkillSense.Infrastructure.BackgroundJobs;

public sealed class ResumeProcessingMonitor : IResumeProcessingMonitor
{
    private readonly Lock _sync = new();
    private readonly DateTimeOffset _startedAtUtc = DateTimeOffset.UtcNow;
    private DateTimeOffset? _lastWorkerHeartbeatUtc;
    private DateTimeOffset? _lastSuccessfulSubmissionUtc;
    private DateTimeOffset? _lastFailureUtc;
    private Guid? _lastSubmissionId;
    private string? _lastStage;
    private string? _lastFailureMessage;
    private int _consecutiveWorkerFailures;

    public void RecordWorkerStarted()
    {
        lock (_sync)
        {
            _lastWorkerHeartbeatUtc = DateTimeOffset.UtcNow;
            _lastStage = "worker_started";
        }
    }

    public void RecordWorkerHeartbeat()
    {
        lock (_sync)
        {
            _lastWorkerHeartbeatUtc = DateTimeOffset.UtcNow;
            if (_consecutiveWorkerFailures > 0)
            {
                _consecutiveWorkerFailures = 0;
                _lastFailureMessage = null;
            }
        }
    }

    public void RecordWorkerFailure(Exception exception)
    {
        lock (_sync)
        {
            _lastWorkerHeartbeatUtc = DateTimeOffset.UtcNow;
            _lastFailureUtc = DateTimeOffset.UtcNow;
            _lastFailureMessage = exception.Message;
            _lastStage ??= "worker";
            _consecutiveWorkerFailures++;
        }
    }

    public void RecordSubmissionStage(Guid submissionId, string stage)
    {
        lock (_sync)
        {
            _lastWorkerHeartbeatUtc = DateTimeOffset.UtcNow;
            _lastSubmissionId = submissionId;
            _lastStage = stage;
        }
    }

    public void RecordSubmissionSucceeded(Guid submissionId)
    {
        lock (_sync)
        {
            _lastWorkerHeartbeatUtc = DateTimeOffset.UtcNow;
            _lastSuccessfulSubmissionUtc = DateTimeOffset.UtcNow;
            _lastSubmissionId = submissionId;
            _lastStage = "completed";
            _lastFailureMessage = null;
            _consecutiveWorkerFailures = 0;
        }
    }

    public void RecordSubmissionFailed(Guid submissionId, string stage, Exception exception)
    {
        lock (_sync)
        {
            _lastWorkerHeartbeatUtc = DateTimeOffset.UtcNow;
            _lastFailureUtc = DateTimeOffset.UtcNow;
            _lastSubmissionId = submissionId;
            _lastStage = stage;
            _lastFailureMessage = exception.Message;
            _consecutiveWorkerFailures++;
        }
    }

    public ResumeProcessingMonitorSnapshot GetSnapshot()
    {
        lock (_sync)
        {
            return new ResumeProcessingMonitorSnapshot(
                _startedAtUtc,
                _lastWorkerHeartbeatUtc,
                _lastSuccessfulSubmissionUtc,
                _lastFailureUtc,
                _lastSubmissionId,
                _lastStage,
                _lastFailureMessage,
                _consecutiveWorkerFailures);
        }
    }
}
