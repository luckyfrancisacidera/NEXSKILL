namespace SkillSense.Application.Interfaces;

public interface IResumeProcessingMonitor
{
    void RecordWorkerStarted();
    void RecordWorkerHeartbeat();
    void RecordWorkerFailure(Exception exception);
    void RecordSubmissionStage(Guid submissionId, string stage);
    void RecordSubmissionSucceeded(Guid submissionId);
    void RecordSubmissionFailed(Guid submissionId, string stage, Exception exception);
    ResumeProcessingMonitorSnapshot GetSnapshot();
}

public sealed record ResumeProcessingMonitorSnapshot(
    DateTimeOffset StartedAtUtc,
    DateTimeOffset? LastWorkerHeartbeatUtc,
    DateTimeOffset? LastSuccessfulSubmissionUtc,
    DateTimeOffset? LastFailureUtc,
    Guid? LastSubmissionId,
    string? LastStage,
    string? LastFailureMessage,
    int ConsecutiveWorkerFailures);
