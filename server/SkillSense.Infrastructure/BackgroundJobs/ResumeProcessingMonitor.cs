using SkillSense.Application.Interfaces;

namespace SkillSense.Infrastructure.BackgroundJobs;

public sealed class ResumeProcessingMonitor : IResumeProcessingMonitor
{
    private readonly Lock _sync = new();
    private readonly DateTimeOffset _startedAtUtc = DateTimeOffset.UtcNow;
    private DateTimeOffset? _lastWorkerHeartbeatUtc;
    private bool _isProcessing;
    private Guid? _currentSubmissionId;
    private string? _currentStage;
    private DateTimeOffset? _currentStageStartedUtc;
    private DateTimeOffset? _lastSuccessfulSubmissionUtc;
    private Guid? _lastSuccessfulSubmissionId;
    private DateTimeOffset? _lastFailureUtc;
    private Guid? _lastFailedSubmissionId;
    private string? _lastFailureStage;
    private string? _lastFailureMessage;
    private bool _hasActiveFailure;
    private int _consecutiveFailureCount;

    public void RecordWorkerStarted()
    {
        lock (_sync)
        {
            _lastWorkerHeartbeatUtc = DateTimeOffset.UtcNow;
        }
    }

    public void RecordWorkerHeartbeat()
    {
        lock (_sync)
        {
            _lastWorkerHeartbeatUtc = DateTimeOffset.UtcNow;
            if (_hasActiveFailure && _lastFailedSubmissionId is null)
            {
                _hasActiveFailure = false;
                _consecutiveFailureCount = 0;
            }
        }
    }

    public void RecordWorkerFailure(Exception exception)
    {
        lock (_sync)
        {
            var now = DateTimeOffset.UtcNow;
            _lastWorkerHeartbeatUtc = now;

            if (_hasActiveFailure && _lastFailedSubmissionId is not null)
            {
                return;
            }

            _isProcessing = false;
            _currentSubmissionId = null;
            _currentStage = null;
            _currentStageStartedUtc = null;
            _lastFailureUtc = now;
            _lastFailedSubmissionId = null;
            _lastFailureStage = "worker";
            _lastFailureMessage = NormalizeFailureMessage(exception);
            _hasActiveFailure = true;
            _consecutiveFailureCount++;
        }
    }

    public void RecordSubmissionStage(Guid submissionId, string stage)
    {
        lock (_sync)
        {
            var now = DateTimeOffset.UtcNow;
            _lastWorkerHeartbeatUtc = now;
            _isProcessing = true;
            _currentSubmissionId = submissionId;
            _currentStage = stage;
            _currentStageStartedUtc = now;
            _hasActiveFailure = false;
        }
    }

    public void RecordSubmissionSucceeded(Guid submissionId)
    {
        lock (_sync)
        {
            var now = DateTimeOffset.UtcNow;
            _lastWorkerHeartbeatUtc = now;
            _isProcessing = false;
            _currentSubmissionId = null;
            _currentStage = null;
            _currentStageStartedUtc = null;
            _lastSuccessfulSubmissionUtc = now;
            _lastSuccessfulSubmissionId = submissionId;
            _hasActiveFailure = false;
            _consecutiveFailureCount = 0;
        }
    }

    public void RecordSubmissionFailed(Guid submissionId, string stage, Exception exception)
    {
        lock (_sync)
        {
            var now = DateTimeOffset.UtcNow;
            _lastWorkerHeartbeatUtc = now;
            _isProcessing = false;
            _currentSubmissionId = null;
            _currentStage = null;
            _currentStageStartedUtc = null;
            _lastFailureUtc = now;
            _lastFailedSubmissionId = submissionId;
            _lastFailureStage = stage;
            _lastFailureMessage = NormalizeFailureMessage(exception);
            _hasActiveFailure = true;
            _consecutiveFailureCount++;
        }
    }

    public ResumeProcessingMonitorSnapshot GetSnapshot()
    {
        lock (_sync)
        {
            return new ResumeProcessingMonitorSnapshot(
                _startedAtUtc,
                _lastWorkerHeartbeatUtc,
                _isProcessing,
                _currentSubmissionId,
                _currentStage,
                _currentStageStartedUtc,
                _lastSuccessfulSubmissionUtc,
                _lastSuccessfulSubmissionId,
                _lastFailureUtc,
                _lastFailedSubmissionId,
                _lastFailureStage,
                _lastFailureMessage,
                _hasActiveFailure,
                _consecutiveFailureCount);
        }
    }

    private static string NormalizeFailureMessage(Exception exception)
    {
        ArgumentNullException.ThrowIfNull(exception);

        var message = exception.Message?.Trim();
        if (!string.IsNullOrWhiteSpace(message))
        {
            return message;
        }

        var innerMessage = exception.InnerException?.Message?.Trim();
        if (!string.IsNullOrWhiteSpace(innerMessage))
        {
            return $"{exception.GetType().Name}: {innerMessage}";
        }

        return $"{exception.GetType().Name}: No error message provided";
    }
}
