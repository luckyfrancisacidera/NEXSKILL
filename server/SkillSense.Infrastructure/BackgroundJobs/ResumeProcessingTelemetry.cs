using SkillSense.Application.Interfaces;

namespace SkillSense.Infrastructure.BackgroundJobs;

public sealed class ResumeProcessingTelemetry : IResumeProcessingTelemetry
{
    private readonly System.Threading.Lock _sync = new();
    private long _succeededCount;
    private long _failedCount;
    private long _timeoutCount;
    private long _parseDurationTotalMs;
    private long _scoreDurationTotalMs;
    private long _parseSampleCount;
    private long _scoreSampleCount;

    public void RecordSubmissionSucceeded(long parseDurationMs, long scoreDurationMs)
    {
        lock (_sync)
        {
            _succeededCount++;
            AddStepSamples(parseDurationMs, scoreDurationMs);
        }
    }

    public void RecordSubmissionFailed(long parseDurationMs, long scoreDurationMs, bool isTimeout)
    {
        lock (_sync)
        {
            _failedCount++;
            if (isTimeout)
            {
                _timeoutCount++;
            }

            AddStepSamples(parseDurationMs, scoreDurationMs);
        }
    }

    public ResumeProcessingTelemetrySnapshot GetSnapshot()
    {
        lock (_sync)
        {
            return new ResumeProcessingTelemetrySnapshot(
                _succeededCount,
                _failedCount,
                _timeoutCount,
                _parseDurationTotalMs,
                _scoreDurationTotalMs,
                _parseSampleCount,
                _scoreSampleCount,
                DateTimeOffset.UtcNow);
        }
    }

    private void AddStepSamples(long parseDurationMs, long scoreDurationMs)
    {
        if (parseDurationMs > 0)
        {
            _parseDurationTotalMs += parseDurationMs;
            _parseSampleCount++;
        }

        if (scoreDurationMs > 0)
        {
            _scoreDurationTotalMs += scoreDurationMs;
            _scoreSampleCount++;
        }
    }
}
