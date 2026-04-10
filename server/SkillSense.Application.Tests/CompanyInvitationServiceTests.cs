using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging.Abstractions;
using System.Security.Cryptography;
using System.Text;
using SkillSense.Application.Contracts.Company;
using SkillSense.Application.Services.Company;
using SkillSense.Domain.Entities;
using SkillSense.Domain.Enums;
using SkillSense.Domain.Subscriptions;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Tests;

public sealed class CompanyInvitationServiceTests
{
    [Fact]
    public async Task GetInvitationAsync_ReturnsApprovedRequestAndSubscriptionDetails()
    {
        var harness = CreateHarness();

        var invitation = await harness.Service.GetInvitationAsync(harness.Token, CancellationToken.None);

        Assert.NotNull(invitation);
        Assert.Equal("Northwind Labs", invitation!.CompanyName);
        Assert.Equal("Northwind Laboratories", invitation.BusinessName);
        Assert.Equal("Technology", invitation.Industry);
        Assert.Equal("51-200", invitation.CompanySize);
        Assert.Equal("1 Raffles Place", invitation.FullAddress);
        Assert.Equal("Alex Reviewer", invitation.PrimaryAdminFullName);
        Assert.Equal("owner@example.com", invitation.PrimaryAdminEmail);
        Assert.Equal(SubscriptionPlanCatalog.StandardPlanId, invitation.PlanId);
        Assert.Equal("Standard", invitation.PlanName);
        Assert.Equal(nameof(CompanyBillingCycle.Monthly), invitation.BillingLabel);
        Assert.Equal("monthly", invitation.BillingCycle);
        Assert.Equal("gcash", invitation.MockPaymentMethod);
        Assert.Equal("Approved after compliance review.", invitation.ReviewNotes);
        Assert.False(invitation.IsExpired);
        Assert.False(invitation.IsAccepted);
    }

    [Fact]
    public async Task AcceptAsync_SetsPassword_PersistsMockBillingSelection_ActivatesSubscription_AndMarksInvitationAccepted()
    {
        var harness = CreateHarness();

        await harness.Service.AcceptAsync(
            harness.Token,
            new AcceptCompanyInvitationDto
            {
                Password = "SecurePass123!",
                ConfirmPassword = "SecurePass123!",
                PlanId = SubscriptionPlanCatalog.PremiumPlanId,
                BillingCycle = "annual",
                PaymentMethod = "maya",
            },
            CancellationToken.None);

        var user = await harness.UserManager.FindByIdAsync(harness.User.Id.ToString());

        Assert.NotNull(user);
        Assert.NotNull(user!.PasswordHash);
        Assert.NotNull(harness.Invitation.AcceptedAtUtc);
        Assert.Equal(CompanyInvitationStatus.Accepted, harness.Invitation.Status);
        Assert.Equal(CompanySubscriptionStatus.Active, harness.Subscription.Status);
        Assert.Equal(SubscriptionPlanCatalog.PremiumPlanId, harness.Subscription.PlanId);
        Assert.Equal(CompanyBillingCycle.Annual, harness.Subscription.BillingCycle);
        Assert.Equal("maya", harness.Subscription.MockPaymentMethod);
        Assert.NotNull(harness.Subscription.StartsAtUtc);
        Assert.NotNull(harness.Subscription.EndsAtUtc);
        Assert.True(harness.Repository.SaveChangesCount >= 1);
    }

    [Fact]
    public async Task AcceptAsync_WithoutPaymentMethod_ThrowsFriendlyValidationError()
    {
        var harness = CreateHarness();

        var exception = await Assert.ThrowsAsync<ArgumentException>(() => harness.Service.AcceptAsync(
            harness.Token,
            new AcceptCompanyInvitationDto
            {
                Password = "SecurePass123!",
                ConfirmPassword = "SecurePass123!",
                PlanId = SubscriptionPlanCatalog.StandardPlanId,
                BillingCycle = "monthly",
                PaymentMethod = string.Empty,
            },
            CancellationToken.None));

        Assert.Equal("Select a payment method to continue.", exception.Message);
        Assert.Equal(CompanyInvitationStatus.Pending, harness.Invitation.Status);
        Assert.Equal(CompanySubscriptionStatus.PendingActivation, harness.Subscription.Status);
        Assert.Null(harness.Subscription.StartsAtUtc);
    }

    private static TestHarness CreateHarness()
    {
        var company = new CompanyEntity
        {
            Id = Guid.NewGuid(),
            Name = "Northwind Labs",
            BusinessName = "Northwind Laboratories",
            Industry = "Technology",
            CompanySize = "51-200",
            FullAddress = "1 Raffles Place",
            PrimaryAdminFullName = "Alex Reviewer",
            PrimaryEmail = "owner@example.com",
        };

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = "owner@example.com",
            UserName = "owner@example.com",
            NormalizedEmail = "OWNER@EXAMPLE.COM",
            NormalizedUserName = "OWNER@EXAMPLE.COM",
            AdminProfile = new AdminProfileEntity
            {
                Id = Guid.NewGuid(),
                CompanyId = company.Id,
            },
        };

        var token = "plain-text-invitation-token";
        var invitation = new CompanyInvitationEntity
        {
            Id = Guid.NewGuid(),
            CompanyId = company.Id,
            Company = company,
            Email = user.Email!,
            Role = "CompanyAdmin",
            UserId = user.Id,
            TokenHash = HashToken(token),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(7),
            Status = CompanyInvitationStatus.Pending,
        };

        var subscription = new CompanySubscriptionEntity
        {
            Id = Guid.NewGuid(),
            CompanyId = company.Id,
            Company = company,
            PlanId = SubscriptionPlanCatalog.StandardPlanId,
            BillingCycle = CompanyBillingCycle.Monthly,
            MockPaymentMethod = "gcash",
            Status = CompanySubscriptionStatus.PendingActivation,
        };

        var approvedRequest = new CompanyAccountRequestEntity
        {
            Id = Guid.NewGuid(),
            CompanyName = company.Name,
            BusinessName = company.BusinessName ?? string.Empty,
            Industry = company.Industry ?? string.Empty,
            CompanySize = company.CompanySize ?? string.Empty,
            Description = "Approved request",
            Country = "Singapore",
            CityProvince = "Singapore",
            FullAddress = company.FullAddress ?? string.Empty,
            PrimaryAdminFullName = company.PrimaryAdminFullName ?? string.Empty,
            PrimaryAdminEmail = company.PrimaryEmail ?? string.Empty,
            PrimaryAdminPhone = "+65 5555 1234",
            PrimaryAdminRole = "Founder",
            RequestedPlanId = SubscriptionPlanCatalog.StandardPlanId,
            BillingCycle = CompanyBillingCycle.Monthly,
            ReviewNotes = "Approved after compliance review.",
            ReviewedAtUtc = DateTime.UtcNow.AddMinutes(-5),
            Status = CompanyAccountRequestStatus.Approved,
        };

        var userManager = new TestUserManager(user);
        var repository = new TestCompanyLifecycleRepository(invitation, subscription, approvedRequest);
        var service = new CompanyInvitationService(repository, userManager);

        return new TestHarness(service, repository, userManager, invitation, subscription, user, token);
    }

    private static string HashToken(string token)
        => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token.Trim())));

    private sealed record TestHarness(
        CompanyInvitationService Service,
        TestCompanyLifecycleRepository Repository,
        TestUserManager UserManager,
        CompanyInvitationEntity Invitation,
        CompanySubscriptionEntity Subscription,
        AppUser User,
        string Token);

    private sealed class TestCompanyLifecycleRepository(
        CompanyInvitationEntity invitation,
        CompanySubscriptionEntity subscription,
        CompanyAccountRequestEntity approvedRequest) : ICompanyLifecycleRepository
    {
        public int SaveChangesCount { get; private set; }

        public Task AddRequestAsync(CompanyAccountRequestEntity request, CancellationToken ct = default)
            => Task.CompletedTask;

        public Task<CompanyAccountRequestEntity?> GetRequestByIdAsync(Guid requestId, CancellationToken ct = default)
            => Task.FromResult<CompanyAccountRequestEntity?>(null);

        public Task<CompanyAccountRequestEntity?> GetRequestByIdForUpdateAsync(Guid requestId, CancellationToken ct = default)
            => Task.FromResult<CompanyAccountRequestEntity?>(null);

        public Task<CompanyAccountRequestEntity?> GetLatestApprovedRequestByPrimaryAdminEmailAsync(string email, CancellationToken ct = default)
            => Task.FromResult(
                string.Equals(email, approvedRequest.PrimaryAdminEmail, StringComparison.OrdinalIgnoreCase)
                    ? approvedRequest
                    : null);

        public Task<List<CompanyAccountRequestEntity>> GetRequestsAsync(CompanyAccountRequestStatus? status, CancellationToken ct = default)
            => Task.FromResult(new List<CompanyAccountRequestEntity>());

        public Task AddCompanyAsync(CompanyEntity company, CancellationToken ct = default)
            => Task.CompletedTask;

        public Task AddSubscriptionAsync(CompanySubscriptionEntity subscription, CancellationToken ct = default)
            => Task.CompletedTask;

        public Task<CompanySubscriptionEntity?> GetCurrentSubscriptionAsync(Guid companyId, CancellationToken ct = default)
            => Task.FromResult(subscription.CompanyId == companyId ? subscription : null);

        public Task<CompanySubscriptionEntity?> GetCurrentSubscriptionForUpdateAsync(Guid companyId, CancellationToken ct = default)
            => Task.FromResult(subscription.CompanyId == companyId ? subscription : null);

        public Task<CompanySubscriptionEntity?> GetCompanyAdminSubscriptionAsync(Guid userId, CancellationToken ct = default)
            => Task.FromResult<CompanySubscriptionEntity?>(null);

        public Task AddInvitationAsync(CompanyInvitationEntity invitation, CancellationToken ct = default)
            => Task.CompletedTask;

        public Task<CompanyInvitationEntity?> GetInvitationByTokenHashAsync(string tokenHash, CancellationToken ct = default)
            => Task.FromResult(invitation.TokenHash == tokenHash ? invitation : null);

        public Task<int> CountActiveJobsAsync(Guid companyId, CancellationToken ct = default)
            => Task.FromResult(0);

        public Task<int> CountResumeScreeningsAsync(Guid companyId, DateTime? startsAtUtc, DateTime? endsAtUtc, CancellationToken ct = default)
            => Task.FromResult(0);

        public Task<bool> EmailExistsAsync(string email, CancellationToken ct = default)
            => Task.FromResult(false);

        public Task<IDbContextTransaction> BeginSerializableTransactionAsync(CancellationToken ct = default)
            => Task.FromResult<IDbContextTransaction>(new NoOpDbContextTransaction());

        public Task SaveChangesAsync(CancellationToken ct = default)
        {
            SaveChangesCount++;
            return Task.CompletedTask;
        }
    }

    private sealed class TestUserManager(AppUser user) : UserManager<AppUser>(
        new TestUserStore(user),
        Microsoft.Extensions.Options.Options.Create(new IdentityOptions()),
        new PasswordHasher<AppUser>(),
        [],
        [],
        new UpperInvariantLookupNormalizer(),
        new IdentityErrorDescriber(),
        new EmptyServiceProvider(),
        NullLogger<UserManager<AppUser>>.Instance)
    {
        private readonly PasswordHasher<AppUser> _passwordHasher = new();
        private readonly AppUser _user = user;

        public override Task<AppUser?> FindByIdAsync(string userId)
            => Task.FromResult(
                Guid.TryParse(userId, out var parsedId) && parsedId == _user.Id
                    ? _user
                    : null);

        public override Task<IdentityResult> AddPasswordAsync(AppUser user, string password)
        {
            user.PasswordHash = _passwordHasher.HashPassword(user, password);
            user.SecurityStamp = Guid.NewGuid().ToString("N");
            return Task.FromResult(IdentityResult.Success);
        }
    }

    private sealed class TestUserStore(AppUser user) : IUserPasswordStore<AppUser>
    {
        private readonly AppUser _user = user;

        public void Dispose()
        {
        }

        public Task<string> GetUserIdAsync(AppUser user, CancellationToken cancellationToken) => Task.FromResult(user.Id.ToString());
        public Task<string?> GetUserNameAsync(AppUser user, CancellationToken cancellationToken) => Task.FromResult(user.UserName);
        public Task SetUserNameAsync(AppUser user, string? userName, CancellationToken cancellationToken)
        {
            user.UserName = userName;
            return Task.CompletedTask;
        }

        public Task<string?> GetNormalizedUserNameAsync(AppUser user, CancellationToken cancellationToken) => Task.FromResult(user.NormalizedUserName);
        public Task SetNormalizedUserNameAsync(AppUser user, string? normalizedName, CancellationToken cancellationToken)
        {
            user.NormalizedUserName = normalizedName;
            return Task.CompletedTask;
        }

        public Task<IdentityResult> CreateAsync(AppUser user, CancellationToken cancellationToken) => Task.FromResult(IdentityResult.Success);
        public Task<IdentityResult> UpdateAsync(AppUser user, CancellationToken cancellationToken) => Task.FromResult(IdentityResult.Success);
        public Task<IdentityResult> DeleteAsync(AppUser user, CancellationToken cancellationToken) => Task.FromResult(IdentityResult.Success);
        public Task<AppUser?> FindByIdAsync(string userId, CancellationToken cancellationToken)
            => Task.FromResult(Guid.TryParse(userId, out var parsedId) && parsedId == _user.Id ? _user : null);

        public Task<AppUser?> FindByNameAsync(string normalizedUserName, CancellationToken cancellationToken)
            => Task.FromResult(
                string.Equals(normalizedUserName, _user.NormalizedUserName, StringComparison.Ordinal)
                    ? _user
                    : null);

        public Task SetPasswordHashAsync(AppUser user, string? passwordHash, CancellationToken cancellationToken)
        {
            user.PasswordHash = passwordHash;
            return Task.CompletedTask;
        }

        public Task<string?> GetPasswordHashAsync(AppUser user, CancellationToken cancellationToken)
            => Task.FromResult(user.PasswordHash);

        public Task<bool> HasPasswordAsync(AppUser user, CancellationToken cancellationToken)
            => Task.FromResult(!string.IsNullOrWhiteSpace(user.PasswordHash));
    }

    private sealed class EmptyServiceProvider : IServiceProvider
    {
        public object? GetService(Type serviceType) => null;
    }

    private sealed class NoOpDbContextTransaction : IDbContextTransaction
    {
        public Guid TransactionId { get; } = Guid.NewGuid();

        public void Dispose()
        {
        }

        public ValueTask DisposeAsync() => ValueTask.CompletedTask;
        public void Commit() { }
        public Task CommitAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
        public void Rollback() { }
        public Task RollbackAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
        public void CreateSavepoint(string name) { }
        public Task CreateSavepointAsync(string name, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public void RollbackToSavepoint(string name) { }
        public Task RollbackToSavepointAsync(string name, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public void ReleaseSavepoint(string name) { }
        public Task ReleaseSavepointAsync(string name, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }
}
