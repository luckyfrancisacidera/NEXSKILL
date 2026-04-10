using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Storage;
using SkillSense.Application.Contracts.Company;
using SkillSense.Application.Interfaces.Company;
using SkillSense.Application.Services.Company;
using SkillSense.Domain.Entities;
using SkillSense.Domain.Enums;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Tests;

public sealed class CompanyAccountRequestServiceTests
{
    [Fact]
    public async Task SubmitAsync_PersistsRequestFields_AndStoresDocuments()
    {
        var repository = new TestCompanyLifecycleRepository();
        var storage = new RecordingRequestDocumentStorageService();
        var service = new CompanyAccountRequestService(repository, storage);

        var result = await service.SubmitAsync(new CreateCompanyAccountRequestDto
        {
            CompanyName = "Northwind Labs",
            BusinessName = "Northwind Laboratories",
            Industry = "Technology",
            CompanySize = "51-200",
            WebsiteUrl = "https://northwind.example",
            Description = "A compliance-ready company request for SkillSense onboarding.",
            Country = "Singapore",
            CityProvince = "Singapore",
            FullAddress = "1 Raffles Place",
            PrimaryAdminFullName = "Alex Reviewer",
            PrimaryAdminEmail = "owner@example.com",
            PrimaryAdminPhone = "+65 5555 1234",
            PrimaryAdminRole = "Founder",
            BusinessRegistrationNumber = "BRN-123",
            TaxId = "TAX-456",
            BusinessPermitFile = CreateFormFile("permit.pdf", "application/pdf"),
            CertificateOfRegistrationFile = CreateFormFile("certificate.png", "image/png"),
        }, CancellationToken.None);

        Assert.Equal("PendingReview", result.Status);
        Assert.NotNull(repository.StoredRequest);
        Assert.Equal("Northwind Labs", repository.StoredRequest!.CompanyName);
        Assert.Equal("owner@example.com", repository.StoredRequest.PrimaryAdminEmail);
        Assert.Equal(string.Empty, repository.StoredRequest.RequestedPlanId);
        Assert.Null(repository.StoredRequest.BillingCycle);
        Assert.Equal(2, repository.StoredRequest.Documents.Count);
        Assert.Equal(2, storage.SaveCalls);
        Assert.True(repository.SaveChangesCalled);
    }

    [Theory]
    [InlineData("application/msword")]
    [InlineData("text/plain")]
    public async Task SubmitAsync_RejectsUnsupportedDocumentTypes(string contentType)
    {
        var service = new CompanyAccountRequestService(
            new TestCompanyLifecycleRepository(),
            new RecordingRequestDocumentStorageService());

        var exception = await Assert.ThrowsAsync<ArgumentException>(() => service.SubmitAsync(new CreateCompanyAccountRequestDto
        {
            CompanyName = "Northwind Labs",
            BusinessName = "Northwind Laboratories",
            Industry = "Technology",
            CompanySize = "51-200",
            Description = "A compliance-ready company request for SkillSense onboarding.",
            Country = "Singapore",
            CityProvince = "Singapore",
            FullAddress = "1 Raffles Place",
            PrimaryAdminFullName = "Alex Reviewer",
            PrimaryAdminEmail = "owner@example.com",
            PrimaryAdminPhone = "+65 5555 1234",
            PrimaryAdminRole = "Founder",
            BusinessPermitFile = CreateFormFile("permit.bin", contentType),
        }, CancellationToken.None));

        Assert.Contains("Business permit must be a PNG, JPG, JPEG, or PDF file.", exception.Message);
    }

    private static IFormFile CreateFormFile(string name, string contentType)
    {
        var bytes = new byte[] { 1, 2, 3, 4 };
        return new FormFile(new MemoryStream(bytes), 0, bytes.Length, name, name)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType,
        };
    }

    private sealed class TestCompanyLifecycleRepository : ICompanyLifecycleRepository
    {
        public CompanyAccountRequestEntity? StoredRequest { get; private set; }
        public bool SaveChangesCalled { get; private set; }

        public Task AddRequestAsync(CompanyAccountRequestEntity request, CancellationToken ct = default)
        {
            StoredRequest = request;
            return Task.CompletedTask;
        }

        public Task<CompanyAccountRequestEntity?> GetRequestByIdAsync(Guid requestId, CancellationToken ct = default)
            => Task.FromResult<CompanyAccountRequestEntity?>(null);

        public Task<CompanyAccountRequestEntity?> GetRequestByIdForUpdateAsync(Guid requestId, CancellationToken ct = default)
            => Task.FromResult<CompanyAccountRequestEntity?>(null);

        public Task<CompanyAccountRequestEntity?> GetLatestApprovedRequestByPrimaryAdminEmailAsync(string email, CancellationToken ct = default)
            => Task.FromResult<CompanyAccountRequestEntity?>(null);

        public Task<List<CompanyAccountRequestEntity>> GetRequestsAsync(CompanyAccountRequestStatus? status, CancellationToken ct = default)
            => Task.FromResult(new List<CompanyAccountRequestEntity>());

        public Task AddCompanyAsync(CompanyEntity company, CancellationToken ct = default)
            => Task.CompletedTask;

        public Task AddSubscriptionAsync(CompanySubscriptionEntity subscription, CancellationToken ct = default)
            => Task.CompletedTask;

        public Task<CompanySubscriptionEntity?> GetCurrentSubscriptionAsync(Guid companyId, CancellationToken ct = default)
            => Task.FromResult<CompanySubscriptionEntity?>(null);

        public Task<CompanySubscriptionEntity?> GetCurrentSubscriptionForUpdateAsync(Guid companyId, CancellationToken ct = default)
            => Task.FromResult<CompanySubscriptionEntity?>(null);

        public Task<CompanySubscriptionEntity?> GetCompanyAdminSubscriptionAsync(Guid userId, CancellationToken ct = default)
            => Task.FromResult<CompanySubscriptionEntity?>(null);

        public Task AddInvitationAsync(CompanyInvitationEntity invitation, CancellationToken ct = default)
            => Task.CompletedTask;

        public Task<CompanyInvitationEntity?> GetInvitationByTokenHashAsync(string tokenHash, CancellationToken ct = default)
            => Task.FromResult<CompanyInvitationEntity?>(null);

        public Task<int> CountActiveJobsAsync(Guid companyId, CancellationToken ct = default)
            => Task.FromResult(0);

        public Task<int> CountResumeScreeningsAsync(Guid companyId, DateTime? startsAtUtc, DateTime? endsAtUtc, CancellationToken ct = default)
            => Task.FromResult(0);

        public Task<bool> EmailExistsAsync(string email, CancellationToken ct = default)
            => Task.FromResult(false);

        public Task<IDbContextTransaction> BeginSerializableTransactionAsync(CancellationToken ct = default)
            => throw new NotSupportedException();

        public Task SaveChangesAsync(CancellationToken ct = default)
        {
            SaveChangesCalled = true;
            return Task.CompletedTask;
        }
    }

    private sealed class RecordingRequestDocumentStorageService : IRequestDocumentStorageService
    {
        public int SaveCalls { get; private set; }

        public Task<RequestDocumentStorageResult> SaveAsync(Stream stream, string fileName, string contentType, CancellationToken ct = default)
        {
            SaveCalls++;
            return Task.FromResult(new RequestDocumentStorageResult($"company-requests/{Guid.NewGuid():N}", "test"));
        }

        public Task<RequestDocumentDownloadResult> OpenReadAsync(string storageKey, CancellationToken ct = default)
            => throw new NotSupportedException();
    }
}
