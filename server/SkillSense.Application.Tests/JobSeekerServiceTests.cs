using SkillSense.Application.Contracts.Notifications;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Jobseeker;
using SkillSense.Application.Services.Jobseeker;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Application.Tests;

public sealed class JobSeekerServiceTests
{
    [Fact]
    public async Task WithdrawApplicationAsync_RejectsHiredApplications()
    {
        var userId = Guid.NewGuid();
        var applicationId = Guid.NewGuid();
        var repository = new StubJobSeekerRepository
        {
            VisibleApplicationEntity = new ResumeSubmissionEntity
            {
                Id = applicationId,
                JobSeekerUserId = userId,
                Status = ResumeSubmissionStatus.Hire,
            },
        };
        var service = CreateService(repository);

        var error = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.WithdrawApplicationAsync(userId, applicationId, CancellationToken.None));

        Assert.Equal("This application can no longer be withdrawn.", error.Message);
    }

    [Theory]
    [InlineData(ResumeSubmissionStatus.Failed)]
    [InlineData(ResumeSubmissionStatus.Hire)]
    public async Task HideApplicationFromHistoryAsync_AllowsWithdrawnAndHired(ResumeSubmissionStatus status)
    {
        var userId = Guid.NewGuid();
        var applicationId = Guid.NewGuid();
        var now = new DateTime(2026, 3, 26, 10, 30, 0, DateTimeKind.Utc);
        var entity = new ResumeSubmissionEntity
        {
            Id = applicationId,
            JobSeekerUserId = userId,
            Status = status,
            UpdatedAtUtc = now.AddDays(-1),
        };
        var repository = new StubJobSeekerRepository
        {
            VisibleApplicationEntity = entity,
        };
        var service = CreateService(repository, now);

        await service.HideApplicationFromHistoryAsync(userId, applicationId, CancellationToken.None);

        Assert.True(entity.IsHiddenFromJobSeekerHistory);
        Assert.Equal(now, entity.UpdatedAtUtc);
        Assert.Equal(1, repository.SaveChangesCallCount);
    }

    [Fact]
    public async Task HideApplicationFromHistoryAsync_RejectsActiveApplications()
    {
        var userId = Guid.NewGuid();
        var applicationId = Guid.NewGuid();
        var repository = new StubJobSeekerRepository
        {
            VisibleApplicationEntity = new ResumeSubmissionEntity
            {
                Id = applicationId,
                JobSeekerUserId = userId,
                Status = ResumeSubmissionStatus.Interview,
            },
        };
        var service = CreateService(repository);

        var error = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.HideApplicationFromHistoryAsync(userId, applicationId, CancellationToken.None));

        Assert.Equal("Only withdrawn or hired applications can be removed from your visible history.", error.Message);
        Assert.Equal(0, repository.SaveChangesCallCount);
    }

    private static JobSeekerService CreateService(
        StubJobSeekerRepository repository,
        DateTime? utcNow = null)
        => new(
            repository,
            new NoOpResumeUploadService(),
            new NoOpCacheService(),
            new StubDateTimeProvider(utcNow ?? new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc)),
            new NoOpNotificationService());

    private sealed class StubJobSeekerRepository : IJobSeekerRepository
    {
        public ResumeSubmissionEntity? VisibleApplicationEntity { get; set; }
        public int SaveChangesCallCount { get; private set; }

        public Task<PagedData<JobEntity>> GetPublishedJobsAsync(int pageNumber, int pageSize, string? search, string? sortBy, string? sortDir, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<JobEntity?> GetPublishedJobByIdAsync(Guid id, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<PagedData<ApplicationListItemData>> GetApplicationsByUserAsync(Guid userId, int pageNumber, int pageSize, string? search, string? status, DateTime? startDate, DateTime? endDate, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<ApplicationListItemData?> GetApplicationDetailAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<ResumeSubmissionEntity?> GetApplicationEntityAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
            => Task.FromResult(VisibleApplicationEntity);

        public Task<ResumeSubmissionEntity?> GetVisibleApplicationEntityAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
            => Task.FromResult(VisibleApplicationEntity);

        public Task<JobOfferEntity?> GetLatestOfferByApplicationIdAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task SaveChangesAsync(CancellationToken ct = default)
        {
            SaveChangesCallCount++;
            return Task.CompletedTask;
        }

        public Task<List<SavedJobData>> GetSavedJobsAsync(Guid userId, string? search, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<bool> IsJobSavedAsync(Guid userId, Guid jobId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task SaveJobAsync(SavedJobEntity entity, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task RemoveSavedJobAsync(Guid userId, Guid jobId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<JobSeekerProfileEntity?> GetProfileAsync(Guid userId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task UpsertProfileAsync(JobSeekerProfileEntity profile, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<List<(DateTime Date, int Count)>> GetApplicationAnalyticsAsync(Guid userId, DateTime start, DateTime end, string granularity, CancellationToken ct = default)
            => throw new NotImplementedException();
    }

    private sealed class NoOpResumeUploadService : IResumeUploadService
    {
        public Task<ResumeUploadResponse> EnqueueUploadAsync(Stream fileStream, string fileName, string contentType, Guid jobId, string appliedJobPosition, string? fullName = null, string? email = null, string? postalCode = null, string? location = null, Guid? jobSeekerUserId = null, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<bool> HasActiveApplicationAsync(Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default)
            => Task.FromResult(false);
    }

    private sealed class NoOpCacheService : IAppCacheService
    {
        public Task<T> GetOrCreateAsync<T>(string key, TimeSpan ttl, Func<Task<T>> factory) => factory();
        public void Remove(string key) { }
        public void RemoveByPrefix(string prefix) { }
    }

    private sealed class StubDateTimeProvider(DateTime utcNow) : IDateTimeProvider
    {
        public DateTime UtcNow { get; } = utcNow;
    }

    private sealed class NoOpNotificationService : INotificationService
    {
        public Task<NotificationDto> CreateNotificationAsync(CreateNotificationRequest request, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<IReadOnlyList<NotificationDto>> GetNotificationsByUserAsync(Guid userId, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyList<NotificationDto>>(Array.Empty<NotificationDto>());

        public Task MarkAsReadAsync(Guid userId, Guid notificationId, CancellationToken ct = default)
            => Task.CompletedTask;

        public Task MarkAllAsReadAsync(Guid userId, CancellationToken ct = default)
            => Task.CompletedTask;

        public Task<int> DeleteNotificationsAsync(Guid userId, IReadOnlyList<Guid> notificationIds, CancellationToken ct = default)
            => Task.FromResult(0);

        public Task<int> DeleteAllNotificationsAsync(Guid userId, CancellationToken ct = default)
            => Task.FromResult(0);
    }
}
