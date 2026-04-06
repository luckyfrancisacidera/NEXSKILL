using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using SkillSense.Api.Health;
using SkillSense.Application.Interfaces;
using SkillSense.Domain.Entities;
using SkillSense.Infrastructure.Options;
using SkillSense.Persistence.Data;

namespace SkillSense.Application.Tests;

public sealed class ResumeProcessingHealthCheckTests
{
    [Fact]
    public async Task PreviousFailure_WhileNewSubmissionIsScoring_IsNotReportedAsUnhealthy()
    {
        await using var dbContext = CreateDbContext();
        var previousFailureId = Guid.NewGuid();
        dbContext.ResumeSubmissions.Add(CreateFailedSubmission(previousFailureId, DateTime.UtcNow.AddMinutes(-1)));
        await dbContext.SaveChangesAsync();

        var monitor = new StubResumeProcessingMonitor(new ResumeProcessingMonitorSnapshot(
            StartedAtUtc: DateTimeOffset.UtcNow.AddHours(-1),
            LastWorkerHeartbeatUtc: DateTimeOffset.UtcNow.AddSeconds(-5),
            IsProcessing: true,
            CurrentSubmissionId: Guid.NewGuid(),
            CurrentStage: "score",
            CurrentStageStartedUtc: DateTimeOffset.UtcNow.AddMinutes(-3),
            LastSuccessfulSubmissionUtc: null,
            LastSuccessfulSubmissionId: null,
            LastFailureUtc: DateTimeOffset.UtcNow.AddMinutes(-6),
            LastFailedSubmissionId: previousFailureId,
            LastFailureStage: "parse",
            LastFailureMessage: "No error message provided",
            HasActiveFailure: false,
            ConsecutiveFailureCount: 1));

        var healthCheck = CreateHealthCheck(dbContext, monitor);

        var result = await healthCheck.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(HealthStatus.Degraded, result.Status);
        Assert.Contains("actively progressing", result.Description);
        Assert.DoesNotContain("active failure", result.Description, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task SubmissionFailureAtParse_IsUnhealthyWithNonEmptyErrorMessage()
    {
        await using var dbContext = CreateDbContext();
        var submissionId = Guid.NewGuid();
        dbContext.ResumeSubmissions.Add(CreateFailedSubmission(submissionId, DateTime.UtcNow));
        await dbContext.SaveChangesAsync();

        var monitor = new StubResumeProcessingMonitor(new ResumeProcessingMonitorSnapshot(
            StartedAtUtc: DateTimeOffset.UtcNow.AddHours(-1),
            LastWorkerHeartbeatUtc: DateTimeOffset.UtcNow,
            IsProcessing: false,
            CurrentSubmissionId: null,
            CurrentStage: null,
            CurrentStageStartedUtc: null,
            LastSuccessfulSubmissionUtc: null,
            LastSuccessfulSubmissionId: null,
            LastFailureUtc: DateTimeOffset.UtcNow,
            LastFailedSubmissionId: submissionId,
            LastFailureStage: "parse",
            LastFailureMessage: "InvalidOperationException: No error message provided",
            HasActiveFailure: true,
            ConsecutiveFailureCount: 1));

        var healthCheck = CreateHealthCheck(dbContext, monitor);

        var result = await healthCheck.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(HealthStatus.Unhealthy, result.Status);
        Assert.Contains("Stage=parse", result.Description);
        Assert.Contains("InvalidOperationException: No error message provided", result.Description);
    }

    [Fact]
    public async Task SubmissionLaterSucceeds_HealthRecovers()
    {
        await using var dbContext = CreateDbContext();
        var failedSubmissionId = Guid.NewGuid();
        dbContext.ResumeSubmissions.Add(CreateFailedSubmission(failedSubmissionId, DateTime.UtcNow.AddMinutes(-10)));
        await dbContext.SaveChangesAsync();

        var monitor = new StubResumeProcessingMonitor(new ResumeProcessingMonitorSnapshot(
            StartedAtUtc: DateTimeOffset.UtcNow.AddHours(-1),
            LastWorkerHeartbeatUtc: DateTimeOffset.UtcNow,
            IsProcessing: false,
            CurrentSubmissionId: null,
            CurrentStage: null,
            CurrentStageStartedUtc: null,
            LastSuccessfulSubmissionUtc: DateTimeOffset.UtcNow.AddMinutes(-1),
            LastSuccessfulSubmissionId: Guid.NewGuid(),
            LastFailureUtc: DateTimeOffset.UtcNow.AddMinutes(-10),
            LastFailedSubmissionId: failedSubmissionId,
            LastFailureStage: "score",
            LastFailureMessage: "transient scoring failure",
            HasActiveFailure: false,
            ConsecutiveFailureCount: 0));

        var healthCheck = CreateHealthCheck(dbContext, monitor);

        var result = await healthCheck.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(HealthStatus.Healthy, result.Status);
        Assert.Contains("healthy", result.Description, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task LongRunningScoreStepWithinTimeout_IsHealthy()
    {
        await using var dbContext = CreateDbContext();
        var monitor = new StubResumeProcessingMonitor(new ResumeProcessingMonitorSnapshot(
            StartedAtUtc: DateTimeOffset.UtcNow.AddHours(-1),
            LastWorkerHeartbeatUtc: DateTimeOffset.UtcNow.AddMinutes(-5),
            IsProcessing: true,
            CurrentSubmissionId: Guid.NewGuid(),
            CurrentStage: "score",
            CurrentStageStartedUtc: DateTimeOffset.UtcNow.AddMinutes(-5),
            LastSuccessfulSubmissionUtc: DateTimeOffset.UtcNow.AddHours(-1),
            LastSuccessfulSubmissionId: Guid.NewGuid(),
            LastFailureUtc: DateTimeOffset.UtcNow.AddHours(-2),
            LastFailedSubmissionId: Guid.NewGuid(),
            LastFailureStage: "parse",
            LastFailureMessage: "previous failure",
            HasActiveFailure: false,
            ConsecutiveFailureCount: 0));

        var healthCheck = CreateHealthCheck(dbContext, monitor);

        var result = await healthCheck.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(HealthStatus.Healthy, result.Status);
        Assert.Contains("actively processing", result.Description, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task LongRunningScoreStepBeyondTimeout_IsUnhealthy()
    {
        await using var dbContext = CreateDbContext();
        var monitor = new StubResumeProcessingMonitor(new ResumeProcessingMonitorSnapshot(
            StartedAtUtc: DateTimeOffset.UtcNow.AddHours(-1),
            LastWorkerHeartbeatUtc: DateTimeOffset.UtcNow.AddMinutes(-12),
            IsProcessing: true,
            CurrentSubmissionId: Guid.NewGuid(),
            CurrentStage: "score",
            CurrentStageStartedUtc: DateTimeOffset.UtcNow.AddMinutes(-12),
            LastSuccessfulSubmissionUtc: DateTimeOffset.UtcNow.AddHours(-1),
            LastSuccessfulSubmissionId: Guid.NewGuid(),
            LastFailureUtc: null,
            LastFailedSubmissionId: null,
            LastFailureStage: null,
            LastFailureMessage: null,
            HasActiveFailure: false,
            ConsecutiveFailureCount: 0));

        var healthCheck = CreateHealthCheck(dbContext, monitor);

        var result = await healthCheck.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(HealthStatus.Unhealthy, result.Status);
        Assert.Contains("appears stuck", result.Description, StringComparison.OrdinalIgnoreCase);
    }

    private static ResumeProcessingHealthCheck CreateHealthCheck(
        SkillSenseDbContext dbContext,
        IResumeProcessingMonitor monitor)
        => new(
            dbContext,
            monitor,
            Microsoft.Extensions.Options.Options.Create(new ResumeProcessingWorkerOptions
            {
                BatchSize = 5,
                IdleTimeout = TimeSpan.FromMinutes(2),
                InitialBackoff = TimeSpan.FromSeconds(1),
                MaxBackoff = TimeSpan.FromSeconds(30),
            }));

    private static SkillSenseDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<SkillSenseDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new SkillSenseDbContext(options);
    }

    private static ResumeSubmissionEntity CreateFailedSubmission(Guid id, DateTime updatedAtUtc)
        => new()
        {
            Id = id,
            CompanyId = Guid.NewGuid(),
            JobId = Guid.NewGuid(),
            FileName = "resume.pdf",
            ContentType = "application/pdf",
            BlobObjectKey = "resume/blob",
            AppliedJobPosition = "Engineer",
            Status = ResumeSubmissionStatus.Failed,
            CreatedAtUtc = updatedAtUtc.AddMinutes(-1),
            UpdatedAtUtc = updatedAtUtc,
        };

    private sealed class StubResumeProcessingMonitor(ResumeProcessingMonitorSnapshot snapshot) : IResumeProcessingMonitor
    {
        public void RecordWorkerStarted() => throw new NotSupportedException();
        public void RecordWorkerHeartbeat() => throw new NotSupportedException();
        public void RecordWorkerFailure(Exception exception) => throw new NotSupportedException();
        public void RecordSubmissionStage(Guid submissionId, string stage) => throw new NotSupportedException();
        public void RecordSubmissionSucceeded(Guid submissionId) => throw new NotSupportedException();
        public void RecordSubmissionFailed(Guid submissionId, string stage, Exception exception) => throw new NotSupportedException();
        public ResumeProcessingMonitorSnapshot GetSnapshot() => snapshot;
    }
}
