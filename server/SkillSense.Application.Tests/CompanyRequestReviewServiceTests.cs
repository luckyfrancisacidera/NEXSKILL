using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging.Abstractions;
using SkillSense.Application.Contracts.Company;
using SkillSense.Application.Contracts.Email;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Options;
using SkillSense.Application.Services.Company;
using SkillSense.Domain.Entities;
using SkillSense.Domain.Enums;
using SkillSense.Domain.Subscriptions;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Tests;

public sealed class CompanyRequestReviewServiceTests
{
    [Fact]
    public async Task ReviewAsync_Approve_CreatesRelatedEntities_AndMarksRequestApproved()
    {
        var harness = CreateHarness();
        var request = harness.Repository.AddRequest();
        var reviewerUserId = Guid.NewGuid();

        var result = await harness.Service.ReviewAsync(
            request.Id,
            reviewerUserId,
            new ReviewCompanyAccountRequestDto
            {
                Approve = true,
                ReviewNotes = "Looks good."
            },
            CancellationToken.None);

        var createdUser = await harness.UserManager.FindByEmailAsync(request.PrimaryAdminEmail);

        Assert.Equal("Approved", result.Status);
        Assert.Equal("Looks good.", result.ReviewNotes);
        Assert.Equal(CompanyAccountRequestStatus.Approved, request.Status);
        Assert.Equal(reviewerUserId, request.ReviewedByUserId);
        Assert.NotNull(request.ReviewedAtUtc);
        Assert.NotNull(createdUser);
        Assert.NotNull(createdUser!.AdminProfile);
        Assert.Single(harness.Repository.Companies);
        Assert.Equal(harness.Repository.Companies.Single().Id, createdUser.AdminProfile!.CompanyId);
        Assert.Single(harness.Repository.Subscriptions);
        Assert.Single(harness.Repository.Invitations);
        Assert.Equal(["CompanyAdmin"], await harness.UserManager.GetRolesAsync(createdUser));
        Assert.Single(harness.EmailService.SentMessages);
    }

    [Fact]
    public async Task ReviewAsync_Reject_MarksRequestRejected_WithoutCreatingApprovalEntities()
    {
        var harness = CreateHarness();
        var request = harness.Repository.AddRequest();

        var result = await harness.Service.ReviewAsync(
            request.Id,
            Guid.NewGuid(),
            new ReviewCompanyAccountRequestDto
            {
                Approve = false,
                ReviewNotes = "Missing registration details."
            },
            CancellationToken.None);

        Assert.Equal("Rejected", result.Status);
        Assert.Equal("Missing registration details.", result.ReviewNotes);
        Assert.Equal(CompanyAccountRequestStatus.Rejected, request.Status);
        Assert.Empty(harness.UserManager.UsersById);
        Assert.Empty(harness.Repository.Companies);
        Assert.Empty(harness.Repository.Subscriptions);
        Assert.Empty(harness.Repository.Invitations);
        Assert.Single(harness.EmailService.SentMessages);
    }

    [Fact]
    public async Task ReviewAsync_WhenRequestIsAlreadyReviewed_ThrowsBusinessConflict()
    {
        var harness = CreateHarness();
        var request = harness.Repository.AddRequest();
        request.Status = CompanyAccountRequestStatus.Approved;
        request.ReviewedAtUtc = DateTime.UtcNow;
        request.ReviewedByUserId = Guid.NewGuid();

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => harness.Service.ReviewAsync(
            request.Id,
            Guid.NewGuid(),
            new ReviewCompanyAccountRequestDto
            {
                Approve = true,
                ReviewNotes = "Retry"
            },
            CancellationToken.None));

        Assert.Equal("This company account request has already been reviewed.", exception.Message);
    }

    [Fact]
    public async Task ReviewAsync_WhenSecondAdminAttemptsReviewAfterApproval_ReturnsConflict()
    {
        var harness = CreateHarness();
        var request = harness.Repository.AddRequest("second-admin@example.com");

        await harness.Service.ReviewAsync(
            request.Id,
            Guid.NewGuid(),
            new ReviewCompanyAccountRequestDto
            {
                Approve = true,
                ReviewNotes = "Approved by admin 1."
            },
            CancellationToken.None);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => harness.Service.ReviewAsync(
            request.Id,
            Guid.NewGuid(),
            new ReviewCompanyAccountRequestDto
            {
                Approve = false,
                ReviewNotes = "Admin 2 retry."
            },
            CancellationToken.None));

        Assert.Equal("This company account request has already been reviewed.", exception.Message);
    }

    [Fact]
    public async Task ReviewAsync_WhenReviewIsRetried_DoesNotCreateDuplicateApprovalEntities()
    {
        var harness = CreateHarness();
        var request = harness.Repository.AddRequest("retry@example.com");

        await harness.Service.ReviewAsync(
            request.Id,
            Guid.NewGuid(),
            new ReviewCompanyAccountRequestDto
            {
                Approve = true,
                ReviewNotes = "Approved once."
            },
            CancellationToken.None);

        await Assert.ThrowsAsync<InvalidOperationException>(() => harness.Service.ReviewAsync(
            request.Id,
            Guid.NewGuid(),
            new ReviewCompanyAccountRequestDto
            {
                Approve = true,
                ReviewNotes = "Approved twice."
            },
            CancellationToken.None));

        Assert.Single(harness.UserManager.UsersById);
        Assert.Single(harness.Repository.Companies);
        Assert.Single(harness.Repository.Subscriptions);
        Assert.Single(harness.Repository.Invitations);
    }

    private static TestHarness CreateHarness()
    {
        var userManager = new TestUserManager();
        var roleManager = new TestRoleManager();
        var repository = new TestCompanyLifecycleRepository(userManager);
        var emailService = new RecordingEmailService();

        var service = new CompanyRequestReviewService(
            repository,
            userManager,
            roleManager,
            emailService,
            Microsoft.Extensions.Options.Options.Create(new PasswordResetOptions
            {
                FrontendBaseUrl = "https://frontend.test"
            }),
            NullLogger<CompanyRequestReviewService>.Instance);

        return new TestHarness(service, repository, userManager, emailService);
    }

    private sealed record TestHarness(
        CompanyRequestReviewService Service,
        TestCompanyLifecycleRepository Repository,
        TestUserManager UserManager,
        RecordingEmailService EmailService);

    private sealed class TestCompanyLifecycleRepository(TestUserManager userManager) : ICompanyLifecycleRepository
    {
        private readonly Dictionary<Guid, CompanyAccountRequestEntity> _requests = [];

        public List<CompanyEntity> Companies { get; } = [];
        public List<CompanySubscriptionEntity> Subscriptions { get; } = [];
        public List<CompanyInvitationEntity> Invitations { get; } = [];

        public CompanyAccountRequestEntity AddRequest(string primaryAdminEmail = "owner@example.com")
        {
            var request = new CompanyAccountRequestEntity
            {
                Id = Guid.NewGuid(),
                CompanyName = "Northwind Labs",
                BusinessName = "Northwind Laboratories",
                Industry = "Technology",
                CompanySize = "51-200",
                WebsiteUrl = "https://northwind.example",
                Description = "Testing company review approval.",
                Country = "Singapore",
                CityProvince = "Singapore",
                FullAddress = "1 Raffles Place",
                PrimaryAdminFullName = "Alex Reviewer",
                PrimaryAdminEmail = primaryAdminEmail,
                PrimaryAdminPhone = "+65 5555 1234",
                PrimaryAdminRole = "Founder",
                RequestedPlanId = string.Empty,
                BillingCycle = null,
                Status = CompanyAccountRequestStatus.PendingReview,
                SubmittedAtUtc = DateTime.UtcNow.AddMinutes(-15),
            };

            _requests[request.Id] = request;
            return request;
        }

        public Task AddRequestAsync(CompanyAccountRequestEntity request, CancellationToken ct = default)
        {
            _requests[request.Id] = request;
            return Task.CompletedTask;
        }

        public Task<CompanyAccountRequestEntity?> GetRequestByIdAsync(Guid requestId, CancellationToken ct = default)
            => Task.FromResult(_requests.TryGetValue(requestId, out var request) ? request : null);

        public Task<CompanyAccountRequestEntity?> GetRequestByIdForUpdateAsync(Guid requestId, CancellationToken ct = default)
            => GetRequestByIdAsync(requestId, ct);

        public Task<CompanyAccountRequestEntity?> GetLatestApprovedRequestByPrimaryAdminEmailAsync(string email, CancellationToken ct = default)
            => Task.FromResult(
                _requests.Values
                    .Where(x =>
                        string.Equals(x.PrimaryAdminEmail, email, StringComparison.OrdinalIgnoreCase)
                        && x.Status == CompanyAccountRequestStatus.Approved)
                    .OrderByDescending(x => x.ReviewedAtUtc ?? x.SubmittedAtUtc)
                    .FirstOrDefault());

        public Task<List<CompanyAccountRequestEntity>> GetRequestsAsync(CompanyAccountRequestStatus? status, CancellationToken ct = default)
            => Task.FromResult(
                _requests.Values
                    .Where(x => !status.HasValue || x.Status == status.Value)
                    .ToList());

        public Task AddCompanyAsync(CompanyEntity company, CancellationToken ct = default)
        {
            Companies.Add(company);
            return Task.CompletedTask;
        }

        public Task AddSubscriptionAsync(CompanySubscriptionEntity subscription, CancellationToken ct = default)
        {
            Subscriptions.Add(subscription);
            return Task.CompletedTask;
        }

        public Task<CompanySubscriptionEntity?> GetCurrentSubscriptionAsync(Guid companyId, CancellationToken ct = default)
            => Task.FromResult(Subscriptions.LastOrDefault(x => x.CompanyId == companyId));

        public Task<CompanySubscriptionEntity?> GetCurrentSubscriptionForUpdateAsync(Guid companyId, CancellationToken ct = default)
            => Task.FromResult(Subscriptions.LastOrDefault(x => x.CompanyId == companyId));

        public Task<CompanySubscriptionEntity?> GetCompanyAdminSubscriptionAsync(Guid userId, CancellationToken ct = default)
            => Task.FromResult<CompanySubscriptionEntity?>(null);

        public Task AddInvitationAsync(CompanyInvitationEntity invitation, CancellationToken ct = default)
        {
            Invitations.Add(invitation);
            return Task.CompletedTask;
        }

        public Task<CompanyInvitationEntity?> GetInvitationByTokenHashAsync(string tokenHash, CancellationToken ct = default)
            => Task.FromResult(Invitations.LastOrDefault(x => x.TokenHash == tokenHash));

        public Task<int> CountActiveJobsAsync(Guid companyId, CancellationToken ct = default)
            => Task.FromResult(0);

        public Task<int> CountResumeScreeningsAsync(Guid companyId, DateTime? startsAtUtc, DateTime? endsAtUtc, CancellationToken ct = default)
            => Task.FromResult(0);

        public Task<bool> EmailExistsAsync(string email, CancellationToken ct = default)
            => Task.FromResult(userManager.EmailExists(email));

        public Task<IDbContextTransaction> BeginSerializableTransactionAsync(CancellationToken ct = default)
            => Task.FromResult<IDbContextTransaction>(new NoOpDbContextTransaction());

        public Task SaveChangesAsync(CancellationToken ct = default)
            => Task.CompletedTask;
    }

    private sealed class RecordingEmailService : IEmailService
    {
        public List<EmailMessage> SentMessages { get; } = [];

        public Task SendEmailAsync(EmailMessage message, CancellationToken ct = default)
        {
            SentMessages.Add(message);
            return Task.CompletedTask;
        }
    }

    private sealed class TestUserManager : UserManager<AppUser>
    {
        public Dictionary<Guid, AppUser> UsersById { get; } = [];
        private readonly Dictionary<string, AppUser> _usersByEmail = new(StringComparer.OrdinalIgnoreCase);
        private readonly Dictionary<Guid, IList<string>> _rolesByUserId = [];

        public TestUserManager()
            : base(
                new TestUserStore(),
                Microsoft.Extensions.Options.Options.Create(new IdentityOptions()),
                new PasswordHasher<AppUser>(),
                [],
                [],
                new UpperInvariantLookupNormalizer(),
                new IdentityErrorDescriber(),
                new EmptyServiceProvider(),
                NullLogger<UserManager<AppUser>>.Instance)
        {
        }

        public bool EmailExists(string email) => _usersByEmail.ContainsKey(email);

        public override Task<IdentityResult> CreateAsync(AppUser user)
        {
            if (EmailExists(user.Email ?? string.Empty))
            {
                return Task.FromResult(IdentityResult.Failed(new IdentityError
                {
                    Description = "Duplicate email."
                }));
            }

            user.ConcurrencyStamp ??= Guid.NewGuid().ToString("N");
            UsersById[user.Id] = user;
            _usersByEmail[user.Email ?? string.Empty] = user;
            _rolesByUserId[user.Id] = [];
            return Task.FromResult(IdentityResult.Success);
        }

        public override Task<IdentityResult> AddToRoleAsync(AppUser user, string role)
        {
            if (!_rolesByUserId.TryGetValue(user.Id, out var roles))
            {
                roles = [];
                _rolesByUserId[user.Id] = roles;
            }

            if (!roles.Contains(role, StringComparer.OrdinalIgnoreCase))
            {
                roles.Add(role);
            }

            user.ConcurrencyStamp = Guid.NewGuid().ToString("N");
            return Task.FromResult(IdentityResult.Success);
        }

        public override Task<AppUser?> FindByEmailAsync(string email)
            => Task.FromResult(_usersByEmail.TryGetValue(email, out var user) ? user : null);

        public override Task<IList<string>> GetRolesAsync(AppUser user)
            => Task.FromResult(_rolesByUserId.TryGetValue(user.Id, out var roles) ? roles : (IList<string>)[]);
    }

    private sealed class TestRoleManager : RoleManager<IdentityRole<Guid>>
    {
        private readonly HashSet<string> _roles = new(StringComparer.OrdinalIgnoreCase);

        public TestRoleManager()
            : base(
                new TestRoleStore(),
                [],
                new UpperInvariantLookupNormalizer(),
                new IdentityErrorDescriber(),
                NullLogger<RoleManager<IdentityRole<Guid>>>.Instance)
        {
        }

        public override Task<bool> RoleExistsAsync(string roleName) => Task.FromResult(_roles.Contains(roleName));

        public override Task<IdentityResult> CreateAsync(IdentityRole<Guid> role)
        {
            _roles.Add(role.Name ?? string.Empty);
            return Task.FromResult(IdentityResult.Success);
        }
    }

    private sealed class TestUserStore : IUserStore<AppUser>
    {
        public void Dispose()
        {
        }

        public Task<string> GetUserIdAsync(AppUser user, CancellationToken cancellationToken) => Task.FromResult(user.Id.ToString());
        public Task<string?> GetUserNameAsync(AppUser user, CancellationToken cancellationToken) => Task.FromResult(user.UserName);
        public Task SetUserNameAsync(AppUser user, string? userName, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task<string?> GetNormalizedUserNameAsync(AppUser user, CancellationToken cancellationToken) => Task.FromResult(user.NormalizedUserName);
        public Task SetNormalizedUserNameAsync(AppUser user, string? normalizedName, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task<IdentityResult> CreateAsync(AppUser user, CancellationToken cancellationToken) => Task.FromResult(IdentityResult.Success);
        public Task<IdentityResult> UpdateAsync(AppUser user, CancellationToken cancellationToken) => Task.FromResult(IdentityResult.Success);
        public Task<IdentityResult> DeleteAsync(AppUser user, CancellationToken cancellationToken) => Task.FromResult(IdentityResult.Success);
        public Task<AppUser?> FindByIdAsync(string userId, CancellationToken cancellationToken) => Task.FromResult<AppUser?>(null);
        public Task<AppUser?> FindByNameAsync(string normalizedUserName, CancellationToken cancellationToken) => Task.FromResult<AppUser?>(null);
    }

    private sealed class TestRoleStore : IRoleStore<IdentityRole<Guid>>
    {
        public void Dispose()
        {
        }

        public Task<IdentityResult> CreateAsync(IdentityRole<Guid> role, CancellationToken cancellationToken) => Task.FromResult(IdentityResult.Success);
        public Task<IdentityResult> UpdateAsync(IdentityRole<Guid> role, CancellationToken cancellationToken) => Task.FromResult(IdentityResult.Success);
        public Task<IdentityResult> DeleteAsync(IdentityRole<Guid> role, CancellationToken cancellationToken) => Task.FromResult(IdentityResult.Success);
        public Task<string> GetRoleIdAsync(IdentityRole<Guid> role, CancellationToken cancellationToken) => Task.FromResult(role.Id.ToString());
        public Task<string?> GetRoleNameAsync(IdentityRole<Guid> role, CancellationToken cancellationToken) => Task.FromResult(role.Name);
        public Task SetRoleNameAsync(IdentityRole<Guid> role, string? roleName, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task<string?> GetNormalizedRoleNameAsync(IdentityRole<Guid> role, CancellationToken cancellationToken) => Task.FromResult(role.NormalizedName);
        public Task SetNormalizedRoleNameAsync(IdentityRole<Guid> role, string? normalizedName, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task<IdentityRole<Guid>?> FindByIdAsync(string roleId, CancellationToken cancellationToken) => Task.FromResult<IdentityRole<Guid>?>(null);
        public Task<IdentityRole<Guid>?> FindByNameAsync(string normalizedRoleName, CancellationToken cancellationToken) => Task.FromResult<IdentityRole<Guid>?>(null);
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
