using Microsoft.EntityFrameworkCore.Storage;
using SkillSense.Application.Services.Company;
using SkillSense.Domain.Entities;
using SkillSense.Domain.Enums;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Tests;

public sealed class CompanySubscriptionUsageServiceTests
{
    [Fact]
    public async Task BuildSummaryAsync_PersistsExpiredStatus_WhenTrackedSubscriptionExpires()
    {
        var companyId = Guid.NewGuid();
        var tracked = new CompanySubscriptionEntity
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            PlanId = "basic",
            BillingCycle = CompanyBillingCycle.Monthly,
            Status = CompanySubscriptionStatus.Active,
            StartsAtUtc = DateTime.UtcNow.AddMonths(-2),
            EndsAtUtc = DateTime.UtcNow.AddDays(-1),
            UpdatedAtUtc = DateTime.UtcNow.AddMonths(-1),
        };

        var repository = new TestCompanyLifecycleRepository(tracked);
        var service = new CompanySubscriptionUsageService(repository);

        var summary = await service.BuildSummaryAsync(companyId, CancellationToken.None);

        Assert.True(summary.IsExpired);
        Assert.Equal(CompanySubscriptionStatus.Expired, tracked.Status);
        Assert.NotNull(tracked.LastEnforcedAtUtc);
        Assert.True(repository.SaveChangesCalled);
    }

    private sealed class TestCompanyLifecycleRepository(CompanySubscriptionEntity trackedSubscription) : ICompanyLifecycleRepository
    {
        public bool SaveChangesCalled { get; private set; }

        public Task AddRequestAsync(CompanyAccountRequestEntity request, CancellationToken ct = default) => Task.CompletedTask;
        public Task<CompanyAccountRequestEntity?> GetRequestByIdAsync(Guid requestId, CancellationToken ct = default) => Task.FromResult<CompanyAccountRequestEntity?>(null);
        public Task<CompanyAccountRequestEntity?> GetRequestByIdForUpdateAsync(Guid requestId, CancellationToken ct = default) => Task.FromResult<CompanyAccountRequestEntity?>(null);
        public Task<CompanyAccountRequestEntity?> GetLatestApprovedRequestByPrimaryAdminEmailAsync(string email, CancellationToken ct = default) => Task.FromResult<CompanyAccountRequestEntity?>(null);
        public Task<List<CompanyAccountRequestEntity>> GetRequestsAsync(CompanyAccountRequestStatus? status, CancellationToken ct = default) => Task.FromResult(new List<CompanyAccountRequestEntity>());
        public Task AddCompanyAsync(CompanyEntity company, CancellationToken ct = default) => Task.CompletedTask;
        public Task AddSubscriptionAsync(CompanySubscriptionEntity subscription, CancellationToken ct = default) => Task.CompletedTask;

        public Task<CompanySubscriptionEntity?> GetCurrentSubscriptionAsync(Guid companyId, CancellationToken ct = default)
            => Task.FromResult(companyId == trackedSubscription.CompanyId ? Clone(trackedSubscription) : null);

        public Task<CompanySubscriptionEntity?> GetCurrentSubscriptionForUpdateAsync(Guid companyId, CancellationToken ct = default)
            => Task.FromResult(companyId == trackedSubscription.CompanyId ? trackedSubscription : null);

        public Task<CompanySubscriptionEntity?> GetCompanyAdminSubscriptionAsync(Guid userId, CancellationToken ct = default) => Task.FromResult<CompanySubscriptionEntity?>(null);
        public Task AddInvitationAsync(CompanyInvitationEntity invitation, CancellationToken ct = default) => Task.CompletedTask;
        public Task<CompanyInvitationEntity?> GetInvitationByTokenHashAsync(string tokenHash, CancellationToken ct = default) => Task.FromResult<CompanyInvitationEntity?>(null);
        public Task<int> CountActiveJobsAsync(Guid companyId, CancellationToken ct = default) => Task.FromResult(0);
        public Task<int> CountResumeScreeningsAsync(Guid companyId, DateTime? startsAtUtc, DateTime? endsAtUtc, CancellationToken ct = default) => Task.FromResult(0);
        public Task<bool> EmailExistsAsync(string email, CancellationToken ct = default) => Task.FromResult(false);
        public Task<IDbContextTransaction> BeginSerializableTransactionAsync(CancellationToken ct = default) => throw new NotSupportedException();
        public Task SaveChangesAsync(CancellationToken ct = default)
        {
            SaveChangesCalled = true;
            return Task.CompletedTask;
        }

        private static CompanySubscriptionEntity Clone(CompanySubscriptionEntity entity) => new()
        {
            Id = entity.Id,
            CompanyId = entity.CompanyId,
            PlanId = entity.PlanId,
            BillingCycle = entity.BillingCycle,
            Status = entity.Status,
            StartsAtUtc = entity.StartsAtUtc,
            EndsAtUtc = entity.EndsAtUtc,
            TrialEndsAtUtc = entity.TrialEndsAtUtc,
            AutoRenews = entity.AutoRenews,
            LastEnforcedAtUtc = entity.LastEnforcedAtUtc,
            CreatedAtUtc = entity.CreatedAtUtc,
            UpdatedAtUtc = entity.UpdatedAtUtc,
        };
    }
}
