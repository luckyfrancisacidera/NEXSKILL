using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Exceptions;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Options;
using SkillSense.Application.Services.Resume;
using SkillSense.Domain.Entities;
using SkillSense.Infrastructure.BackgroundJobs;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Tests;

public sealed class ResumeProcessingServiceTests
{
    [Fact]
    public async Task ProcessPendingBatchAsync_WhenParserIsRateLimited_SchedulesRetryWithBackoff()
    {
        var submission = CreateSubmission();
        var repository = new RecordingResumeSubmissionRepository([submission]);
        var monitor = new ResumeProcessingMonitor();
        var service = CreateService(
            repository,
            new RateLimitedResumeParserClient(),
            monitor,
            maxRetryAttempts: 5);

        var processedCount = await service.ProcessPendingBatchAsync(5, CancellationToken.None);

        Assert.Equal(1, processedCount);
        Assert.Equal(ResumeSubmissionStatus.Failed, submission.Status);
        Assert.Equal(1, submission.RetryCount);
        Assert.NotNull(submission.NextRetryAtUtc);
        Assert.True(submission.NextRetryAtUtc > DateTime.UtcNow.AddSeconds(30));

        var snapshot = monitor.GetSnapshot();
        Assert.False(snapshot.HasActiveFailure);
        Assert.Equal(submission.Id, snapshot.LastFailedSubmissionId);
        Assert.Equal("parse", snapshot.LastFailureStage);
    }

    [Fact]
    public async Task ProcessPendingBatchAsync_WhenParserRetriesAreExhausted_LeavesSubmissionFailedWithoutNextRetry()
    {
        var submission = CreateSubmission();
        submission.RetryCount = 4;

        var repository = new RecordingResumeSubmissionRepository([submission]);
        var monitor = new ResumeProcessingMonitor();
        var service = CreateService(
            repository,
            new RateLimitedResumeParserClient(),
            monitor,
            maxRetryAttempts: 5);

        var processedCount = await service.ProcessPendingBatchAsync(1, CancellationToken.None);

        Assert.Equal(1, processedCount);
        Assert.Equal(ResumeSubmissionStatus.Failed, submission.Status);
        Assert.Equal(5, submission.RetryCount);
        Assert.Null(submission.NextRetryAtUtc);

        var snapshot = monitor.GetSnapshot();
        Assert.True(snapshot.HasActiveFailure);
        Assert.Equal(submission.Id, snapshot.LastFailedSubmissionId);
        Assert.Equal("parse", snapshot.LastFailureStage);
    }

    private static ResumeProcessingService CreateService(
        IResumeSubmissionRepository repository,
        IResumeParserClient parserClient,
        IResumeProcessingMonitor monitor,
        int maxRetryAttempts)
        => new(
            new InMemoryObjectStorageService(),
            repository,
            new StubJobRepository(),
            parserClient,
            new NoOpResumeScoreRepository(),
            new NoOpResumeEmbeddingRepository(),
            new NoOpResumeScoringOrchestrator(),
            new PassthroughCacheService(),
            monitor,
            Microsoft.Extensions.Options.Options.Create(new ResumeProcessingOptions
            {
                MaxRetryAttempts = maxRetryAttempts,
                BaseRetryDelay = TimeSpan.FromMinutes(1),
                MaxRetryDelay = TimeSpan.FromMinutes(30),
            }),
            NullLogger<ResumeProcessingService>.Instance);

    private static ResumeSubmissionEntity CreateSubmission()
        => new()
        {
            Id = Guid.NewGuid(),
            CompanyId = Guid.NewGuid(),
            JobId = Guid.NewGuid(),
            FileName = "resume.pdf",
            ContentType = "application/pdf",
            BlobObjectKey = "resume/blob",
            AppliedJobPosition = "Backend Engineer",
            Status = ResumeSubmissionStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow.AddMinutes(-5),
            UpdatedAtUtc = DateTime.UtcNow.AddMinutes(-5),
        };

    private sealed class RecordingResumeSubmissionRepository(List<ResumeSubmissionEntity> batch) : IResumeSubmissionRepository
    {
        public Task AddAsync(ResumeSubmissionEntity submission, CancellationToken ct = default) => Task.CompletedTask;

        public Task<List<ResumeSubmissionEntity>> ClaimProcessableBatchAsync(int batchSize, DateTime utcNow, int maxRetryAttempts, CancellationToken ct = default)
            => Task.FromResult(batch.Take(batchSize).ToList());

        public Task<bool> ExistsActiveApplicationAsync(Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default)
            => Task.FromResult(false);

        public Task<ResumeSubmissionEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)
            => Task.FromResult(batch.FirstOrDefault(x => x.Id == id));

        public Task<ResumeSubmissionEntity?> GetNextPendingAsync(CancellationToken ct = default)
            => Task.FromResult(batch.FirstOrDefault(x => x.Status == ResumeSubmissionStatus.Pending));

        public Task SaveChangesAsync(CancellationToken ct = default) => Task.CompletedTask;
    }

    private sealed class InMemoryObjectStorageService : IObjectStorageService
    {
        public Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default)
            => Task.FromResult("blob");

        public Task<Stream> DownloadAsync(string objectKey, CancellationToken ct = default)
            => Task.FromResult<Stream>(new MemoryStream([1, 2, 3]));

        public Task DeleteAsync(string objectKey, CancellationToken ct = default) => Task.CompletedTask;
        public Task<bool> ExistsAsync(string objectKey, CancellationToken ct = default) => Task.FromResult(true);
        public Task<string?> GetDownloadUrlAsync(string objectKey, string downloadFileName, CancellationToken ct = default) => Task.FromResult<string?>(null);
    }

    private sealed class StubJobRepository : IJobRepository
    {
        public Task AddAsync(JobEntity job, CancellationToken ct = default) => throw new NotSupportedException();
        public Task UpdateAsync(JobEntity job, CancellationToken ct = default) => throw new NotSupportedException();
        public Task DeleteAsync(JobEntity job, CancellationToken ct = default) => throw new NotSupportedException();
        public Task<JobEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)
            => Task.FromResult<JobEntity?>(new JobEntity
            {
                Id = id,
                CompanyId = Guid.NewGuid(),
                RecruiterId = Guid.NewGuid(),
                Title = "Backend Engineer",
                Description = "Build APIs",
                ResponsibilitiesText = "Build APIs",
                RequiredSkillsJson = "[]",
                PreferredSkillsJson = "[]",
                CreatedAtUtc = DateTime.UtcNow.AddDays(-1),
            });

        public Task<JobEntity?> GetByIdForCompanyAsync(Guid id, Guid companyId, CancellationToken ct = default) => throw new NotSupportedException();
        public Task<JobEntity?> GetByIdForRecruiterAsync(Guid id, Guid recruiterId, CancellationToken ct = default) => throw new NotSupportedException();
        public IQueryable<JobEntity> Query() => Array.Empty<JobEntity>().AsQueryable();
    }

    private sealed class RateLimitedResumeParserClient : IResumeParserClient
    {
        public Task<SkillSense.Application.Contracts.Response.ResumeParseEnvelope> ParseAsync(
            Stream fileStream,
            string fileName,
            string contentType,
            string? parserVersion = null,
            CancellationToken ct = default)
            => throw new ResumeParserRateLimitException("Resume parser rate limited the request: Too Many Requests");
    }

    private sealed class NoOpResumeScoreRepository : IResumeScoreRepository
    {
        public Task AddAsync(ResumeScoreEntity score, bool saveChanges = true, CancellationToken ct = default) => Task.CompletedTask;
    }

    private sealed class NoOpResumeEmbeddingRepository : IResumeEmbeddingRepository
    {
        public Task AddRangeAsync(IEnumerable<ResumeEmbeddingEntity> embeddings, bool saveChanges = true, CancellationToken ct = default) => Task.CompletedTask;
        public Task<List<ResumeEmbeddingEntity>> GetBySubmissionIdAsync(Guid submissionId, CancellationToken ct = default) => Task.FromResult(new List<ResumeEmbeddingEntity>());
    }

    private sealed class NoOpResumeScoringOrchestrator : IResumeScoringOrchestrator
    {
        public Task<(List<ResumeEmbeddingEntity> Embeddings, SkillSense.Application.Contracts.Response.FinalMatchScore Score)> BuildAsync(
            Guid submissionId,
            SkillSense.Application.Contracts.Response.ParsedResume resume,
            NormalizedJobDescription jobDescription,
            CancellationToken ct)
            => Task.FromResult((new List<ResumeEmbeddingEntity>(), new SkillSense.Application.Contracts.Response.FinalMatchScore()));
    }

    private sealed class PassthroughCacheService : IAppCacheService
    {
        public Task<T> GetOrCreateAsync<T>(string key, TimeSpan ttl, Func<Task<T>> factory) => factory();
        public void Remove(string key) { }
        public void RemoveByPrefix(string prefix) { }
    }
}
