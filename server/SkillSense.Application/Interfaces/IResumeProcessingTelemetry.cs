namespace SkillSense.Application.Interfaces;

public interface IResumeProcessingTelemetry
{
    void RecordSubmissionSucceeded(long parseDurationMs, long scoreDurationMs);
    void RecordSubmissionFailed(long parseDurationMs, long scoreDurationMs, bool isTimeout);
    ResumeProcessingTelemetrySnapshot GetSnapshot();
}

public sealed record ResumeProcessingTelemetrySnapshot(
    long SucceededCount,
    long FailedCount,
    long TimeoutCount,
    long ParseDurationTotalMs,
    long ScoreDurationTotalMs,
    long ParseSampleCount,
    long ScoreSampleCount,
    DateTimeOffset CapturedAtUtc);
