using SkillSense.Infrastructure.BackgroundJobs;

namespace SkillSense.Application.Tests;

public sealed class ResumeProcessingMonitorTests
{
    [Fact]
    public void RecordSubmissionFailed_UsesFallbackMessageForWhitespaceErrors()
    {
        var monitor = new ResumeProcessingMonitor();

        monitor.RecordSubmissionFailed(Guid.NewGuid(), "parse", new InvalidOperationException("   "));

        var snapshot = monitor.GetSnapshot();

        Assert.True(snapshot.HasActiveFailure);
        Assert.Equal("parse", snapshot.LastFailureStage);
        Assert.Equal("InvalidOperationException: No error message provided", snapshot.LastFailureMessage);
    }

    [Fact]
    public void RecordSubmissionStage_ClearsPreviousActiveFailureWhileProcessingContinues()
    {
        var monitor = new ResumeProcessingMonitor();
        var failedSubmissionId = Guid.NewGuid();
        var currentSubmissionId = Guid.NewGuid();

        monitor.RecordSubmissionFailed(failedSubmissionId, "parse", new InvalidOperationException("parse failed"));
        monitor.RecordSubmissionStage(currentSubmissionId, "score");

        var snapshot = monitor.GetSnapshot();

        Assert.True(snapshot.IsProcessing);
        Assert.False(snapshot.HasActiveFailure);
        Assert.Equal(currentSubmissionId, snapshot.CurrentSubmissionId);
        Assert.Equal("score", snapshot.CurrentStage);
        Assert.Equal(failedSubmissionId, snapshot.LastFailedSubmissionId);
        Assert.Equal("parse failed", snapshot.LastFailureMessage);
    }

    [Fact]
    public void RecordSubmissionSucceeded_ResetsFailureStateAndTracksRecovery()
    {
        var monitor = new ResumeProcessingMonitor();
        var failedSubmissionId = Guid.NewGuid();
        var successfulSubmissionId = Guid.NewGuid();

        monitor.RecordSubmissionFailed(failedSubmissionId, "score", new InvalidOperationException("scoring failed"));
        monitor.RecordSubmissionStage(successfulSubmissionId, "persist");
        monitor.RecordSubmissionSucceeded(successfulSubmissionId);

        var snapshot = monitor.GetSnapshot();

        Assert.False(snapshot.IsProcessing);
        Assert.False(snapshot.HasActiveFailure);
        Assert.Equal(successfulSubmissionId, snapshot.LastSuccessfulSubmissionId);
        Assert.NotNull(snapshot.LastSuccessfulSubmissionUtc);
        Assert.Equal(0, snapshot.ConsecutiveFailureCount);
        Assert.Equal(failedSubmissionId, snapshot.LastFailedSubmissionId);
    }

    [Fact]
    public void RecordSubmissionRetryScheduled_TracksFailureWithoutMarkingWorkerUnhealthy()
    {
        var monitor = new ResumeProcessingMonitor();
        var submissionId = Guid.NewGuid();

        monitor.RecordSubmissionStage(submissionId, "parse");
        monitor.RecordSubmissionRetryScheduled(submissionId, "parse", new InvalidOperationException("rate limited"));

        var snapshot = monitor.GetSnapshot();

        Assert.False(snapshot.IsProcessing);
        Assert.False(snapshot.HasActiveFailure);
        Assert.Equal(submissionId, snapshot.LastFailedSubmissionId);
        Assert.Equal("parse", snapshot.LastFailureStage);
        Assert.Equal("rate limited", snapshot.LastFailureMessage);
    }
}
