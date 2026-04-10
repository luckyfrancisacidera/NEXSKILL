using SkillSense.Application.Contracts.Company;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Company;
using SkillSense.Application.Services.Jobseeker;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Tests;

public sealed class ResumeUploadServiceTests
{
    [Fact]
    public async Task EnqueueUploadAsync_RejectsWhenCompanyScreeningQuotaIsReached()
    {
        var service = new ResumeUploadService(
            new NoOpObjectStorageService(),
            new BlockingCompanySubscriptionAccessService("You cannot run more resume screenings because the company-wide screening quota has been reached."),
            new RecordingResumeSubmissionRepository());

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => service.EnqueueUploadAsync(
            new MemoryStream([1, 2, 3]),
            "resume.pdf",
            "application/pdf",
            Guid.NewGuid(),
            "Backend Engineer",
            Guid.NewGuid(),
            ct: CancellationToken.None));

        Assert.Equal("You cannot run more resume screenings because the company-wide screening quota has been reached.", exception.Message);
    }

    private sealed class BlockingCompanySubscriptionAccessService(string message) : ICompanySubscriptionAccessService
    {
        public Task<CompanySubscriptionSummaryDto> GetCompanyAdminSummaryAsync(Guid userId, CancellationToken ct = default)
            => Task.FromResult(new CompanySubscriptionSummaryDto());

        public Task<CompanySubscriptionGuardResultDto> CanCreateJobPostAsync(Guid companyId, CancellationToken ct = default)
            => Task.FromResult(new CompanySubscriptionGuardResultDto { Allowed = true, Summary = new CompanySubscriptionSummaryDto() });

        public Task<CompanySubscriptionGuardResultDto> CanActivateJobPostAsync(Guid companyId, Guid? currentJobId = null, CancellationToken ct = default)
            => Task.FromResult(new CompanySubscriptionGuardResultDto { Allowed = true, Summary = new CompanySubscriptionSummaryDto() });

        public Task<CompanySubscriptionGuardResultDto> CanRunScreeningAsync(Guid companyId, CancellationToken ct = default)
            => Task.FromResult(new CompanySubscriptionGuardResultDto
            {
                Allowed = false,
                RestrictionMessage = message,
                Summary = new CompanySubscriptionSummaryDto(),
            });
    }

    private sealed class NoOpObjectStorageService : IObjectStorageService
    {
        public Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default)
            => Task.FromResult("blob-key");

        public Task<Stream> DownloadAsync(string objectKey, CancellationToken ct = default)
            => throw new NotSupportedException();

        public Task DeleteAsync(string objectKey, CancellationToken ct = default)
            => Task.CompletedTask;

        public Task<bool> ExistsAsync(string objectKey, CancellationToken ct = default)
            => Task.FromResult(true);

        public Task<string?> GetDownloadUrlAsync(string objectKey, string downloadFileName, CancellationToken ct = default)
            => throw new NotSupportedException();
    }

    private sealed class RecordingResumeSubmissionRepository : IResumeSubmissionRepository
    {
        public Task AddAsync(ResumeSubmissionEntity submission, CancellationToken ct = default) => Task.CompletedTask;
        public Task<bool> ExistsActiveApplicationAsync(Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default) => Task.FromResult(false);
        public Task<ResumeSubmissionEntity?> GetByIdAsync(Guid submissionId, CancellationToken ct = default) => Task.FromResult<ResumeSubmissionEntity?>(null);
        public Task<ResumeSubmissionEntity?> GetNextPendingAsync(CancellationToken ct = default) => Task.FromResult<ResumeSubmissionEntity?>(null);
        public Task<List<ResumeSubmissionEntity>> GetPendingBatchAsync(int batchSize, CancellationToken ct = default) => Task.FromResult(new List<ResumeSubmissionEntity>());
        public Task SaveChangesAsync(CancellationToken ct = default) => Task.CompletedTask;
    }
}
