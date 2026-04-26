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
    public async Task ApplyAsync_WhenApplicationAlreadyExists_ReturnsExistingSubmissionWithoutThrowing()
    {
        var userId = Guid.NewGuid();
        var jobId = Guid.NewGuid();
        var existingSubmissionId = Guid.NewGuid();

        var repository = new StubJobSeekerRepository
        {
            PublishedJob = new JobEntity
            {
                Id = jobId,
                CompanyId = Guid.NewGuid(),
                RecruiterId = Guid.NewGuid(),
                Title = "Backend Engineer",
                Description = "Build APIs",
                ResponsibilitiesText = "Build APIs",
                RequiredSkillsJson = "[]",
                PreferredSkillsJson = "[]",
                CreatedAtUtc = DateTime.UtcNow,
            },
        };

        var resumeUploadService = new StubResumeUploadService
        {
            HasActiveApplication = true,
            ExistingResponse = new ResumeUploadResponse
            {
                SubmissionId = existingSubmissionId,
                Status = ResumeSubmissionStatus.Pending.ToString(),
                Message = "Application already submitted and is being processed.",
            },
        };

        var service = CreateService(repository, resumeUploadService: resumeUploadService);

        var response = await service.ApplyAsync(
            jobId,
            new SkillSense.Application.Contracts.Jobseeker.Request.ApplyToJobRequest
            {
                FullName = "Jane Doe",
                Email = "jane@example.com",
                PostalCode = "1000",
                Location = "Manila",
            },
            new MemoryStream([1, 2, 3]),
            "resume.pdf",
            "application/pdf",
            userId,
            CancellationToken.None);

        Assert.Equal(existingSubmissionId, response.SubmissionId);
        Assert.Equal(0, resumeUploadService.EnqueueCalls);
    }

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
                Status = ResumeSubmissionStatus.Hired,
            },
        };
        var service = CreateService(repository);

        var error = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.WithdrawApplicationAsync(userId, applicationId, CancellationToken.None));

        Assert.Equal("This application can no longer be withdrawn.", error.Message);
    }

    [Theory]
    [InlineData(ResumeSubmissionStatus.Failed)]
    [InlineData(ResumeSubmissionStatus.Hired)]
    public async Task ArchiveApplicationHistoryAsync_HidesVisibleHistoryEntries(ResumeSubmissionStatus status)
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

        await service.ArchiveApplicationHistoryAsync(userId, applicationId, CancellationToken.None);

        Assert.True(entity.IsHiddenFromJobSeekerHistory);
        Assert.Equal(now, entity.JobSeekerHistoryArchivedAtUtc);
        Assert.Null(entity.JobSeekerHistoryDeletedAtUtc);
        Assert.Equal(now, entity.UpdatedAtUtc);
        Assert.Equal(1, repository.SaveChangesCallCount);
    }

    [Fact]
    public async Task UnarchiveApplicationHistoryAsync_RestoresArchivedEntry()
    {
        var userId = Guid.NewGuid();
        var applicationId = Guid.NewGuid();
        var now = new DateTime(2026, 3, 26, 10, 30, 0, DateTimeKind.Utc);
        var entity = new ResumeSubmissionEntity
        {
            Id = applicationId,
            JobSeekerUserId = userId,
            Status = ResumeSubmissionStatus.Hired,
            IsHiddenFromJobSeekerHistory = true,
            JobSeekerHistoryArchivedAtUtc = now.AddDays(-2),
        };
        var repository = new StubJobSeekerRepository
        {
            ArchivedApplicationEntity = entity,
        };
        var service = CreateService(repository, now);

        await service.UnarchiveApplicationHistoryAsync(userId, applicationId, CancellationToken.None);

        Assert.False(entity.IsHiddenFromJobSeekerHistory);
        Assert.Null(entity.JobSeekerHistoryArchivedAtUtc);
        Assert.Equal(now, entity.UpdatedAtUtc);
        Assert.Equal(1, repository.SaveChangesCallCount);
    }

    [Fact]
    public async Task DeleteApplicationHistoryAsync_SoftDeletesHistoryEntry()
    {
        var userId = Guid.NewGuid();
        var applicationId = Guid.NewGuid();
        var now = new DateTime(2026, 3, 26, 10, 30, 0, DateTimeKind.Utc);
        var entity = new ResumeSubmissionEntity
        {
            Id = applicationId,
            JobSeekerUserId = userId,
            Status = ResumeSubmissionStatus.Interview,
        };
        var repository = new StubJobSeekerRepository
        {
            VisibleApplicationEntity = entity,
        };
        var service = CreateService(repository, now);

        await service.DeleteApplicationHistoryAsync(userId, applicationId, CancellationToken.None);

        Assert.True(entity.IsHiddenFromJobSeekerHistory);
        Assert.Equal(now, entity.JobSeekerHistoryDeletedAtUtc);
        Assert.Equal(now, entity.UpdatedAtUtc);
        Assert.Equal(1, repository.SaveChangesCallCount);
    }

    [Fact]
    public async Task AcceptOfferAsync_CreatesHireRecord_WhenOfferIsAccepted()
    {
        var userId = Guid.NewGuid();
        var applicationId = Guid.NewGuid();
        var offerId = Guid.NewGuid();
        var recruiterId = Guid.NewGuid();
        var companyId = Guid.NewGuid();
        var jobId = Guid.NewGuid();
        var now = new DateTime(2026, 3, 26, 10, 30, 0, DateTimeKind.Utc);
        var entity = new ResumeSubmissionEntity
        {
            Id = applicationId,
            CompanyId = companyId,
            JobId = jobId,
            JobSeekerUserId = userId,
            Status = ResumeSubmissionStatus.Offer,
        };
        var offer = new JobOfferEntity
        {
            Id = offerId,
            ApplicationId = applicationId,
            SentByUserId = recruiterId,
            Title = "Backend Engineer Offer",
            Message = "Welcome aboard",
            SalaryText = "PHP 80,000 / month",
            SalaryAmount = 80000,
            SalaryType = "Monthly",
            Currency = "PHP",
            EmploymentType = "Full-time",
            WorkSetup = "Hybrid",
            Status = JobOfferStatus.Pending,
            SentAtUtc = now.AddDays(-1),
            CreatedAtUtc = now.AddDays(-1),
            UpdatedAtUtc = now.AddDays(-1),
        };

        var repository = new StubJobSeekerRepository
        {
            VisibleApplicationEntity = entity,
            LatestOffer = offer,
        };
        var service = CreateService(repository, now);

        await service.AcceptOfferAsync(userId, applicationId, CancellationToken.None);

        Assert.Equal(JobOfferStatus.Accepted, offer.Status);
        Assert.Equal(ResumeSubmissionStatus.Hired, entity.Status);
        Assert.Single(repository.AddedHires);
        Assert.Equal(offerId, repository.AddedHires[0].OfferId);
        Assert.Equal(applicationId, repository.AddedHires[0].ApplicationId);
        Assert.Equal(recruiterId, repository.AddedHires[0].RecruiterId);
    }

    private static JobSeekerService CreateService(
        StubJobSeekerRepository repository,
        DateTime? utcNow = null,
        IResumeUploadService? resumeUploadService = null)
        => new(
            repository,
            resumeUploadService ?? new NoOpResumeUploadService(),
            new NoOpCacheService(),
            new StubDateTimeProvider(utcNow ?? new DateTime(2026, 3, 26, 0, 0, 0, DateTimeKind.Utc)),
            new NoOpNotificationService());

    private sealed class StubJobSeekerRepository : IJobSeekerRepository
    {
        public JobEntity? PublishedJob { get; set; }
        public ResumeSubmissionEntity? VisibleApplicationEntity { get; set; }
        public ResumeSubmissionEntity? ArchivedApplicationEntity { get; set; }
        public JobOfferEntity? LatestOffer { get; set; }
        public Guid? ApplicationCompanyId { get; set; }
        public List<HireEntity> AddedHires { get; } = [];
        public int SaveChangesCallCount { get; private set; }

        public Task<PagedData<JobEntity>> GetPublishedJobsAsync(int pageNumber, int pageSize, string? search, string? sortBy, string? sortDir, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<JobEntity?> GetPublishedJobByIdAsync(Guid id, CancellationToken ct = default)
            => Task.FromResult(PublishedJob);

        public Task<PagedData<ApplicationListItemData>> GetApplicationsByUserAsync(Guid userId, int pageNumber, int pageSize, string? search, string? status, DateTime? startDate, DateTime? endDate, bool archivedOnly = false, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<ApplicationListItemData?> GetApplicationDetailAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction> BeginSerializableTransactionAsync(CancellationToken ct = default)
            => Task.FromResult<Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction>(new NoOpTransaction());

        public Task<ResumeSubmissionEntity?> GetApplicationEntityAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
            => Task.FromResult(VisibleApplicationEntity);

        public Task<ResumeSubmissionEntity?> GetVisibleApplicationEntityAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
            => Task.FromResult(VisibleApplicationEntity);

        public Task<ResumeSubmissionEntity?> GetArchivedApplicationEntityAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
            => Task.FromResult(ArchivedApplicationEntity);

        public Task<Guid?> GetApplicationCompanyIdAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
            => Task.FromResult(ApplicationCompanyId ?? VisibleApplicationEntity?.CompanyId);

        public Task<JobOfferEntity?> GetLatestOfferByApplicationIdAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
            => Task.FromResult(LatestOffer);

        public Task<HireEntity?> GetHireByApplicationIdAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
            => Task.FromResult(AddedHires.FirstOrDefault(hire => hire.ApplicationId == applicationId && hire.JobSeekerId == userId));

        public Task<HireEntity?> GetHireByOfferIdAsync(Guid offerId, CancellationToken ct = default)
            => Task.FromResult(AddedHires.FirstOrDefault(hire => hire.OfferId == offerId));

        public Task AddHireAsync(HireEntity hire, CancellationToken ct = default)
        {
            AddedHires.Add(hire);
            return Task.CompletedTask;
        }

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
        public Task<ResumeUploadResponse> EnqueueUploadAsync(Stream fileStream, string fileName, string contentType, Guid jobId, string appliedJobPosition, Guid companyId = default, string? fullName = null, string? email = null, string? postalCode = null, string? location = null, Guid? jobSeekerUserId = null, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<bool> HasActiveApplicationAsync(Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default)
            => Task.FromResult(false);

        public Task<ResumeUploadResponse?> GetActiveApplicationResponseAsync(Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default)
            => Task.FromResult<ResumeUploadResponse?>(null);
    }

    private sealed class StubResumeUploadService : IResumeUploadService
    {
        public bool HasActiveApplication { get; set; }
        public ResumeUploadResponse? ExistingResponse { get; set; }
        public int EnqueueCalls { get; private set; }

        public Task<ResumeUploadResponse> EnqueueUploadAsync(Stream fileStream, string fileName, string contentType, Guid jobId, string appliedJobPosition, Guid companyId = default, string? fullName = null, string? email = null, string? postalCode = null, string? location = null, Guid? jobSeekerUserId = null, CancellationToken ct = default)
        {
            EnqueueCalls++;
            return Task.FromResult(new ResumeUploadResponse { SubmissionId = Guid.NewGuid(), Status = ResumeSubmissionStatus.Pending.ToString(), Message = "queued" });
        }

        public Task<bool> HasActiveApplicationAsync(Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default)
            => Task.FromResult(HasActiveApplication);

        public Task<ResumeUploadResponse?> GetActiveApplicationResponseAsync(Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default)
            => Task.FromResult(ExistingResponse);
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
            => Task.FromResult(new NotificationDto
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Title = request.Title,
                Message = request.Message,
                Type = request.Type,
                CreatedAtUtc = DateTime.UtcNow,
            });

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

    private sealed class NoOpTransaction : Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction
    {
        public Guid TransactionId { get; } = Guid.NewGuid();

        public void Dispose() { }
        public ValueTask DisposeAsync() => ValueTask.CompletedTask;
        public void Commit() { }
        public Task CommitAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
        public void Rollback() { }
        public Task RollbackAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
        public System.Data.Common.DbTransaction GetDbTransaction() => throw new NotSupportedException();
    }
}
