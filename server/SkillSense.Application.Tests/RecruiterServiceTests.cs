using AutoMapper;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging.Abstractions;
using SkillSense.Application.Contracts.Notifications;
using SkillSense.Application.Contracts.Offers;
using SkillSense.Application.Contracts.Recruiter.Request;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Recruiter;
using SkillSense.Application.Services.Jobs;
using SkillSense.Application.Services.Recruiter;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Application.Tests;

public sealed class RecruiterServiceTests
{
    [Fact]
    public async Task DuplicateJobAsync_CreatesNewDraftCopy_WithCopiedFieldsAndFreshVacancies()
    {
        var companyId = Guid.NewGuid();
        var recruiterId = Guid.NewGuid();
        var originalJobId = Guid.NewGuid();

        var recruiterRepository = new StubRecruiterRepository(companyId, recruiterId);
        recruiterRepository.HiredCounts[originalJobId] = 2;

        var original = BuildJob(companyId, recruiterId, originalJobId);
        var jobRepository = new InMemoryJobRepository(original);
        var service = CreateService(recruiterRepository, jobRepository);

        var duplicated = await service.DuplicateJobAsync(companyId, recruiterId, originalJobId, CancellationToken.None);

        Assert.NotEqual(original.Id, duplicated.Id);
        Assert.Equal($"Copy of {original.Title}", duplicated.Title);
        Assert.Equal("Draft", duplicated.Status);
        Assert.Equal(original.Description, duplicated.Description);
        Assert.Equal(original.Location, duplicated.Location);
        Assert.Equal(original.Department, duplicated.Department);
        Assert.Equal(original.NumberOfVacancies, duplicated.NumberOfVacancies);
        Assert.Equal(original.NumberOfVacancies, duplicated.RemainingVacancies);
        Assert.Null(duplicated.PostedDateUtc);

        var storedDuplicate = await jobRepository.GetByIdForCompanyAsync(duplicated.Id, companyId, CancellationToken.None);
        Assert.NotNull(storedDuplicate);
        Assert.Equal(original.Description, storedDuplicate!.Description);
        Assert.Equal(
            "• Design APIs\r\n• Review architecture\r\n• Ship backend features",
            storedDuplicate.ResponsibilitiesText);
        Assert.Equal(original.RequiredSkillsJson, storedDuplicate.RequiredSkillsJson);
        Assert.Equal(original.PreferredSkillsJson, storedDuplicate.PreferredSkillsJson);
        Assert.Equal("• Healthcare\r\n• Remote stipend", storedDuplicate.Benefits);
        Assert.Equal(original.SalaryMinPerAnnum, storedDuplicate.SalaryMinPerAnnum);
        Assert.Equal(original.SalaryMaxPerAnnum, storedDuplicate.SalaryMaxPerAnnum);
        Assert.Equal(original.Location, storedDuplicate.Location);
        Assert.Equal(original.EmploymentType, storedDuplicate.EmploymentType);
        Assert.Equal(original.WorkSetup, storedDuplicate.WorkSetup);
        Assert.Equal(JobStatus.Draft, storedDuplicate.Status);
        Assert.Null(storedDuplicate.PostedDateUtc);
        Assert.NotEqual(original.CreatedAtUtc, storedDuplicate.CreatedAtUtc);

        var reloadedOriginal = await jobRepository.GetByIdForCompanyAsync(originalJobId, companyId, CancellationToken.None);
        Assert.NotNull(reloadedOriginal);
        Assert.Equal(original.Title, reloadedOriginal!.Title);
        Assert.Equal(JobStatus.Published, reloadedOriginal.Status);
    }

    [Fact]
    public async Task DuplicateJobAsync_CanCreateMultipleIndependentCopies()
    {
        var companyId = Guid.NewGuid();
        var recruiterId = Guid.NewGuid();
        var originalJobId = Guid.NewGuid();

        var recruiterRepository = new StubRecruiterRepository(companyId, recruiterId);
        var jobRepository = new InMemoryJobRepository(BuildJob(companyId, recruiterId, originalJobId));
        var service = CreateService(recruiterRepository, jobRepository);

        var firstCopy = await service.DuplicateJobAsync(companyId, recruiterId, originalJobId, CancellationToken.None);
        var secondCopy = await service.DuplicateJobAsync(companyId, recruiterId, originalJobId, CancellationToken.None);

        Assert.NotEqual(firstCopy.Id, secondCopy.Id);
        Assert.All(new[] { firstCopy, secondCopy }, copy =>
        {
            Assert.StartsWith("Copy of ", copy.Title, StringComparison.Ordinal);
            Assert.Equal("Draft", copy.Status);
        });
        Assert.Equal(3, jobRepository.Query().Count());
    }

    [Fact]
    public async Task DuplicateJobAsync_NormalizesExistingBulletPrefixes_OnCopiedListFields()
    {
        var companyId = Guid.NewGuid();
        var recruiterId = Guid.NewGuid();
        var originalJobId = Guid.NewGuid();

        var recruiterRepository = new StubRecruiterRepository(companyId, recruiterId);
        var original = BuildJob(companyId, recruiterId, originalJobId);
        original.ResponsibilitiesText = "• • Build APIs\n  - Optimize queries\n* Mentor teammates";
        original.Benefits = "• Remote setup\n- Health coverage";

        var jobRepository = new InMemoryJobRepository(original);
        var service = CreateService(recruiterRepository, jobRepository);

        var duplicated = await service.DuplicateJobAsync(companyId, recruiterId, originalJobId, CancellationToken.None);
        var storedDuplicate = await jobRepository.GetByIdForCompanyAsync(duplicated.Id, companyId, CancellationToken.None);

        Assert.NotNull(storedDuplicate);
        Assert.Equal("• Build APIs\r\n• Optimize queries\r\n• Mentor teammates", storedDuplicate!.ResponsibilitiesText);
        Assert.Equal("• Remote setup\r\n• Health coverage", storedDuplicate.Benefits);
    }

    [Fact]
    public async Task CreateJobAsync_InvalidatesRecruiterAndPublicJobCaches()
    {
        var companyId = Guid.NewGuid();
        var recruiterId = Guid.NewGuid();

        var recruiterRepository = new StubRecruiterRepository(companyId, recruiterId);
        var jobRepository = new InMemoryJobRepository();
        var cacheService = new RecordingCacheService();
        var service = CreateService(recruiterRepository, jobRepository, cacheService);

        await service.CreateJobAsync(companyId, recruiterId, new CreateJobRequest
        {
            Title = "Backend Engineer",
            Description = "Build APIs",
            Responsibilities = "Ship APIs",
            RequiredSkills = ["C#", "ASP.NET Core"],
            PreferredSkills = ["PostgreSQL"],
            Location = "Singapore",
            NumberOfVacancies = 2,
        }, CancellationToken.None);

        Assert.Contains(cacheService.RemovedPrefixes, prefix => prefix == $"jobs:recruiter:list:{recruiterId}:");
        Assert.Contains(cacheService.RemovedPrefixes, prefix => prefix == $"dashboard:recruiter:{recruiterId}:");
        Assert.Contains(cacheService.RemovedPrefixes, prefix => prefix == "jobs:public:list:");
        Assert.Single(cacheService.RemovedKeys, key => key.StartsWith("jobs:public:detail:", StringComparison.Ordinal));
    }

    [Fact]
    public async Task DuplicateAndDeleteJobAsync_InvalidateRecruiterAndPublicJobCaches()
    {
        var companyId = Guid.NewGuid();
        var recruiterId = Guid.NewGuid();
        var originalJobId = Guid.NewGuid();

        var recruiterRepository = new StubRecruiterRepository(companyId, recruiterId);
        var jobRepository = new InMemoryJobRepository(BuildJob(companyId, recruiterId, originalJobId));
        var cacheService = new RecordingCacheService();
        var service = CreateService(recruiterRepository, jobRepository, cacheService);

        var duplicate = await service.DuplicateJobAsync(companyId, recruiterId, originalJobId, CancellationToken.None);
        await service.DeleteJobAsync(companyId, recruiterId, originalJobId, CancellationToken.None);

        Assert.Contains(cacheService.RemovedPrefixes, prefix => prefix == $"jobs:recruiter:list:{recruiterId}:");
        Assert.Contains(cacheService.RemovedPrefixes, prefix => prefix == $"dashboard:recruiter:{recruiterId}:");
        Assert.Equal(2, cacheService.RemovedPrefixes.Count(prefix => prefix == "jobs:public:list:"));
        Assert.Contains(cacheService.RemovedKeys, key => key == $"jobs:public:detail:{duplicate.Id}");
        Assert.Contains(cacheService.RemovedKeys, key => key == $"jobs:public:detail:{originalJobId}");
    }

    private static RecruiterService CreateService(
        StubRecruiterRepository recruiterRepository,
        InMemoryJobRepository jobRepository,
        IAppCacheService? cacheService = null)
    {
        var mapper = new MapperConfiguration(config => config.AddProfile<JobsMappingProfile>(), NullLoggerFactory.Instance).CreateMapper();

        return new RecruiterService(
            recruiterRepository,
            jobRepository,
            new NoOpCandidateExplanationRepository(),
            new StaticEmbeddingService(),
            cacheService ?? new NoOpCacheService(),
            new NoOpCandidateExplanationService(),
            new NoOpObjectStorageService(),
            new NoOpNotificationService(),
            new StubDateTimeProvider(new DateTime(2026, 3, 25, 12, 0, 0, DateTimeKind.Utc)),
            mapper,
            NullLogger<RecruiterService>.Instance);
    }

    private static JobEntity BuildJob(Guid companyId, Guid recruiterId, Guid jobId) => new()
    {
        Id = jobId,
        CompanyId = companyId,
        RecruiterId = recruiterId,
        Title = "Senior Backend Engineer",
        Description = "Build robust APIs for customer-facing products.",
        DescriptionEmbeddingJson = "[0.1,0.2,0.3]",
        ResponsibilitiesText = "Design APIs\nReview architecture\nShip backend features",
        RequiredSkillsJson = "[\"C#\",\"ASP.NET Core\",\"PostgreSQL\"]",
        PreferredSkillsJson = "[\"Docker\",\"Azure\"]",
        ExperienceLevel = "Senior",
        MinYears = 5,
        Education = "Bachelor's Degree",
        Department = "Engineering",
        Benefits = "Healthcare\nRemote stipend",
        SalaryMinPerAnnum = 120000,
        SalaryMaxPerAnnum = 180000,
        Currency = "USD",
        Location = "Singapore",
        Schedule = "Mon-Fri",
        WorkSetup = WorkSetup.Hybrid,
        EmploymentType = EmploymentType.FullTime,
        PostedDateUtc = new DateTime(2026, 3, 20, 0, 0, 0, DateTimeKind.Utc),
        CompanyNameSnapshot = "NexSkill",
        CompanyEmailSnapshot = "talent@nexskill.test",
        JobDescriptionStructuredJson = "{}",
        NumberOfVacancies = 3,
        Status = JobStatus.Published,
        CreatedAtUtc = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc)
    };

    private sealed class InMemoryJobRepository(params JobEntity[] jobs) : IJobRepository
    {
        private readonly List<JobEntity> _jobs = jobs.ToList();

        public Task AddAsync(JobEntity job, CancellationToken ct = default)
        {
            _jobs.Add(job);
            return Task.CompletedTask;
        }

        public Task UpdateAsync(JobEntity job, CancellationToken ct = default) => Task.CompletedTask;

        public Task DeleteAsync(JobEntity job, CancellationToken ct = default)
        {
            _jobs.Remove(job);
            return Task.CompletedTask;
        }

        public Task<JobEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)
            => Task.FromResult(_jobs.FirstOrDefault(x => x.Id == id));

        public Task<JobEntity?> GetByIdForCompanyAsync(Guid id, Guid companyId, CancellationToken ct = default)
            => Task.FromResult(_jobs.FirstOrDefault(x => x.Id == id && x.CompanyId == companyId));

        public Task<JobEntity?> GetByIdForRecruiterAsync(Guid id, Guid recruiterId, CancellationToken ct = default)
            => Task.FromResult(_jobs.FirstOrDefault(x => x.Id == id && x.RecruiterId == recruiterId));

        public IQueryable<JobEntity> Query() => _jobs.AsQueryable();
    }

    private sealed class StubRecruiterRepository(Guid companyId, Guid recruiterId) : IRecruiterRepository
    {
        public Dictionary<Guid, int> HiredCounts { get; } = new();

        public Task<RecruiterProfileEntity?> GetProfileByUserIdAsync(Guid recruiterIdInput, CancellationToken ct = default)
            => Task.FromResult<RecruiterProfileEntity?>(new RecruiterProfileEntity
            {
                Id = Guid.NewGuid(),
                UserId = recruiterIdInput,
                CompanyId = companyId,
                Company = new CompanyEntity
                {
                    Id = companyId,
                    Name = "NexSkill",
                    PrimaryEmail = "talent@nexskill.test",
                },
                User = new AppUser
                {
                    Id = recruiterId,
                    Email = "recruiter@nexskill.test",
                    UserName = "Recruiter",
                },
            });

        public Task<RecruiterProfileEntity?> GetProfileByUserAndProfileIdAsync(Guid recruiterIdInput, Guid recruiterProfileId, CancellationToken ct = default)
            => GetProfileByUserIdAsync(recruiterIdInput, ct);

        public Task<IReadOnlyList<RecruiterProfileEntity>> GetProfilesByUserIdsAsync(IReadOnlyCollection<Guid> recruiterIds, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyList<RecruiterProfileEntity>>(Array.Empty<RecruiterProfileEntity>());

        public Task SaveChangesAsync(CancellationToken ct = default) => Task.CompletedTask;

        public Task<PagedData<JobEntity>> GetRecruiterJobsAsync(Guid recruiterIdInput, Guid companyIdInput, int pageNumber, int pageSize, string? search, string? department, string? sortBy, string? sortDir, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<Dictionary<Guid, int>> GetHiredCountsByJobIdsAsync(IReadOnlyCollection<Guid> jobIds, CancellationToken ct = default)
            => Task.FromResult(jobIds.ToDictionary(jobId => jobId, jobId => HiredCounts.TryGetValue(jobId, out var count) ? count : 0));

        public Task<int> GetHiredCountByJobIdAsync(Guid jobId, CancellationToken ct = default)
            => Task.FromResult(HiredCounts.TryGetValue(jobId, out var count) ? count : 0);

        public Task<RecruiterDashboardFilterData> GetDashboardFilterDataAsync(Guid recruiterIdInput, Guid companyIdInput, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<List<Guid>> GetDashboardJobIdsAsync(Guid recruiterIdInput, Guid companyIdInput, string? department, string? jobRole, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<List<ResumeSubmissionEntity>> GetDashboardApplicationsAsync(IReadOnlyCollection<Guid> jobIds, DateTime? startUtc, DateTime? endExclusiveUtc, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<Dictionary<Guid, (string Title, string Department)>> GetJobLookupAsync(Guid recruiterIdInput, Guid companyIdInput, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<List<ApplicantScoreData>> GetApplicantScoreDataAsync(Guid recruiterIdInput, Guid companyIdInput, string? department, string? search, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<ApplicantScoreData?> GetApplicantScoreBySubmissionIdAsync(Guid recruiterIdInput, Guid companyIdInput, Guid submissionId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<List<JobFilterData>> GetJobFiltersAsync(Guid recruiterIdInput, Guid companyIdInput, string? department, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<string?> GetParsedResumeJsonAsync(Guid recruiterIdInput, Guid companyIdInput, Guid submissionId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<ApplicantStageContextData?> GetApplicantStageContextAsync(Guid recruiterIdInput, Guid companyIdInput, Guid submissionId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<IReadOnlyList<ShortlistedCandidateData>> GetShortlistedCandidatesByJobAsync(Guid jobId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<ResumeSubmissionEntity?> GetSubmissionForInterviewAsync(Guid recruiterIdInput, Guid companyIdInput, Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<ResumeSubmissionEntity?> GetSubmissionByIdForRecruiterAsync(Guid recruiterIdInput, Guid companyIdInput, Guid submissionId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<JobOfferEntity?> GetLatestOfferByApplicationIdAsync(Guid applicationId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task AddOfferAsync(JobOfferEntity offer, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<IDbContextTransaction> BeginSerializableTransactionAsync(CancellationToken ct = default)
            => throw new NotImplementedException();
    }

    private sealed class StaticEmbeddingService : ITextEmbeddingService
    {
        public Task<IReadOnlyList<float>> EmbedAsync(string text, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyList<float>>([0.4f, 0.2f, text.Length / 100f]);
    }

    private sealed class NoOpCacheService : IAppCacheService
    {
        public Task<T> GetOrCreateAsync<T>(string key, TimeSpan ttl, Func<Task<T>> factory) => factory();
        public void Remove(string key) { }
        public void RemoveByPrefix(string prefix) { }
    }

    private sealed class RecordingCacheService : IAppCacheService
    {
        public List<string> RemovedKeys { get; } = [];
        public List<string> RemovedPrefixes { get; } = [];

        public Task<T> GetOrCreateAsync<T>(string key, TimeSpan ttl, Func<Task<T>> factory) => factory();
        public void Remove(string key) => RemovedKeys.Add(key);
        public void RemoveByPrefix(string prefix) => RemovedPrefixes.Add(prefix);
    }

    private sealed class NoOpCandidateExplanationRepository : ICandidateExplanationRepository
    {
        public Task<CandidateExplanationEntity?> GetBySubmissionIdAsync(Guid submissionId, CancellationToken ct = default) => Task.FromResult<CandidateExplanationEntity?>(null);
        public Task<CandidateExplanationPayloadData?> GetExplanationPayloadAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default) => Task.FromResult<CandidateExplanationPayloadData?>(null);
        public Task<CandidateExplanationEntity?> GetSucceededExplanationAsync(Guid submissionId, CancellationToken ct = default) => Task.FromResult<CandidateExplanationEntity?>(null);
        public Task AddAsync(CandidateExplanationEntity entity, CancellationToken ct = default) => Task.CompletedTask;
        public Task SaveChangesAsync(CancellationToken ct = default) => Task.CompletedTask;
    }

    private sealed class NoOpCandidateExplanationService : ICandidateExplanationService
    {
        public Task GenerateForShortlistedAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default) => Task.CompletedTask;
    }

    private sealed class NoOpObjectStorageService : IObjectStorageService
    {
        public Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<Stream> DownloadAsync(string objectKey, CancellationToken ct = default) => throw new NotImplementedException();
        public Task DeleteAsync(string objectKey, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<bool> ExistsAsync(string objectKey, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<string?> GetDownloadUrlAsync(string objectKey, string downloadFileName, CancellationToken ct = default) => throw new NotImplementedException();
    }

    private sealed class NoOpNotificationService : INotificationService
    {
        public Task<NotificationDto> CreateNotificationAsync(CreateNotificationRequest request, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<IReadOnlyList<NotificationDto>> GetNotificationsByUserAsync(Guid userId, CancellationToken ct = default) => Task.FromResult<IReadOnlyList<NotificationDto>>(Array.Empty<NotificationDto>());
        public Task MarkAsReadAsync(Guid userId, Guid notificationId, CancellationToken ct = default) => Task.CompletedTask;
        public Task MarkAllAsReadAsync(Guid userId, CancellationToken ct = default) => Task.CompletedTask;
        public Task<int> DeleteNotificationsAsync(Guid userId, IReadOnlyList<Guid> notificationIds, CancellationToken ct = default) => Task.FromResult(0);
        public Task<int> DeleteAllNotificationsAsync(Guid userId, CancellationToken ct = default) => Task.FromResult(0);
    }

    private sealed class StubDateTimeProvider(DateTime utcNow) : IDateTimeProvider
    {
        public DateTime UtcNow { get; } = utcNow;
    }
}
