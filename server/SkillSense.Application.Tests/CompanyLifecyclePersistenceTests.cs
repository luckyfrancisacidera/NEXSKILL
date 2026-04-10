using System.Security.Cryptography;
using System.Text;
using Microsoft.Data.Sqlite;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using SkillSense.Application.Contracts.Company;
using SkillSense.Application.Contracts.Email;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Options;
using SkillSense.Application.Services.Company;
using SkillSense.Domain.Entities;
using SkillSense.Domain.Enums;
using SkillSense.Domain.Subscriptions;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Tests;

public sealed class CompanyLifecyclePersistenceTests
{
    [Fact]
    public async Task SaveChanges_AdminProfileWithMissingCompany_ThrowsDbUpdateException()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AdminProfileIntegrityDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var dbContext = new AdminProfileIntegrityDbContext(options);
        await dbContext.Database.ExecuteSqlRawAsync(
            """
            CREATE TABLE users (
                "Id" TEXT NOT NULL CONSTRAINT "PK_users" PRIMARY KEY
            );

            CREATE TABLE companies (
                "Id" TEXT NOT NULL CONSTRAINT "PK_companies" PRIMARY KEY,
                "Name" TEXT NOT NULL
            );

            CREATE TABLE admin_profiles (
                "Id" TEXT NOT NULL CONSTRAINT "PK_admin_profiles" PRIMARY KEY,
                "UserId" TEXT NOT NULL,
                "CompanyId" TEXT NULL,
                "CreatedAtUtc" TEXT NOT NULL,
                CONSTRAINT "FK_admin_profiles_users_UserId" FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE CASCADE,
                CONSTRAINT "FK_admin_profiles_companies_CompanyId" FOREIGN KEY ("CompanyId") REFERENCES companies ("Id") ON DELETE RESTRICT
            );

            CREATE UNIQUE INDEX "IX_admin_profiles_UserId" ON admin_profiles ("UserId");
            CREATE INDEX "IX_admin_profiles_CompanyId" ON admin_profiles ("CompanyId");
            """);

        var userId = Guid.NewGuid();
        await dbContext.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO users (\"Id\") VALUES ({userId})");

        dbContext.AdminProfiles.Add(new AdminProfileEntity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CompanyId = Guid.NewGuid(),
            CreatedAtUtc = DateTime.UtcNow
        });

        await Assert.ThrowsAsync<DbUpdateException>(() => dbContext.SaveChangesAsync());
    }

    [Fact]
    public async Task ReviewAsync_Approve_PersistsCompanyAdminUserInUsersTableBeforeInvitationAcceptance()
    {
        await using var harness = await TestHarness.CreateAsync();
        var request = harness.CreatePendingRequest();

        await harness.ReviewService.ReviewAsync(
            request.Id,
            Guid.NewGuid(),
            new ReviewCompanyAccountRequestDto
            {
                Approve = true,
                ReviewNotes = "Approved for onboarding."
            },
            CancellationToken.None);

        var persistedUser = await harness.DbContext.Users
            .Include(x => x.AdminProfile)
            .SingleAsync(x => x.Email == request.PrimaryAdminEmail);
        var persistedCompany = await harness.DbContext.Companies
            .SingleAsync(x => x.PrimaryEmail == request.PrimaryAdminEmail);
        var persistedInvitation = await harness.DbContext.CompanyInvitations
            .SingleAsync(x => x.Email == request.PrimaryAdminEmail);

        Assert.Equal("users", harness.DbContext.Model.FindEntityType(typeof(AppUser))!.GetTableName());
        Assert.Equal(persistedUser.Id, persistedInvitation.UserId);
        Assert.NotNull(persistedUser.AdminProfile);
        Assert.Equal(persistedCompany.Id, persistedUser.AdminProfile!.CompanyId);
        Assert.Null(persistedUser.PasswordHash);
        Assert.Equal(CompanyAccountRequestStatus.Approved, request.Status);
    }

    [Fact]
    public async Task AcceptAsync_UsesExistingPersistedUser_AndOnlyActivatesInvitationAndSubscription()
    {
        await using var harness = await TestHarness.CreateAsync();
        var user = await harness.CreateApprovedCompanyAdminAsync();
        var usersBeforeAcceptance = await harness.DbContext.Users.CountAsync();

        await harness.InvitationService.AcceptAsync(
            harness.RawInvitationToken,
            new AcceptCompanyInvitationDto
            {
                Password = "SecurePass123!",
                ConfirmPassword = "SecurePass123!",
                PlanId = SubscriptionPlanCatalog.PremiumPlanId,
                BillingCycle = "annual",
                PaymentMethod = "card",
            },
            CancellationToken.None);

        var usersAfterAcceptance = await harness.DbContext.Users.CountAsync();
        var persistedUser = await harness.DbContext.Users.SingleAsync(x => x.Id == user.Id);
        var invitation = await harness.DbContext.CompanyInvitations.SingleAsync();
        var subscription = await harness.DbContext.CompanySubscriptions.SingleAsync();

        Assert.Equal(usersBeforeAcceptance, usersAfterAcceptance);
        Assert.NotNull(persistedUser.PasswordHash);
        Assert.Equal(CompanyInvitationStatus.Accepted, invitation.Status);
        Assert.NotNull(invitation.AcceptedAtUtc);
        Assert.Equal(CompanySubscriptionStatus.Active, subscription.Status);
        Assert.Equal(SubscriptionPlanCatalog.PremiumPlanId, subscription.PlanId);
        Assert.Equal(CompanyBillingCycle.Annual, subscription.BillingCycle);
        Assert.Equal("card", subscription.MockPaymentMethod);
    }

    [Fact]
    public async Task AcceptAsync_WithInvalidPaymentMethod_FailsWithoutPersistingSubscriptionActivation()
    {
        await using var harness = await TestHarness.CreateAsync();
        var user = await harness.CreateApprovedCompanyAdminAsync();

        var exception = await Assert.ThrowsAsync<ArgumentException>(() => harness.InvitationService.AcceptAsync(
            harness.RawInvitationToken,
            new AcceptCompanyInvitationDto
            {
                Password = "SecurePass123!",
                ConfirmPassword = "SecurePass123!",
                PlanId = SubscriptionPlanCatalog.StandardPlanId,
                BillingCycle = "monthly",
                PaymentMethod = "wire",
            },
            CancellationToken.None));

        var invitation = await harness.DbContext.CompanyInvitations.SingleAsync();
        var subscription = await harness.DbContext.CompanySubscriptions.SingleAsync();
        var persistedUser = await harness.DbContext.Users.SingleAsync(x => x.Id == user.Id);

        Assert.Equal("Select a valid payment method to continue.", exception.Message);
        Assert.Null(persistedUser.PasswordHash);
        Assert.Equal(CompanyInvitationStatus.Pending, invitation.Status);
        Assert.Null(invitation.AcceptedAtUtc);
        Assert.Equal(CompanySubscriptionStatus.PendingActivation, subscription.Status);
        Assert.Null(subscription.StartsAtUtc);
        Assert.Equal("gcash", subscription.MockPaymentMethod);
    }

    private sealed class TestHarness : IAsyncDisposable
    {
        private readonly ServiceProvider _serviceProvider;

        private TestHarness(ServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
            DbContext = serviceProvider.GetRequiredService<SkillSenseDbContext>();
            UserManager = serviceProvider.GetRequiredService<UserManager<AppUser>>();
            RoleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
            Repository = new TestCompanyLifecycleRepository(DbContext);
            ReviewService = new CompanyRequestReviewService(
                Repository,
                UserManager,
                RoleManager,
                new RecordingEmailService(),
                Microsoft.Extensions.Options.Options.Create(new PasswordResetOptions
                {
                    FrontendBaseUrl = "https://frontend.test"
                }),
                NullLogger<CompanyRequestReviewService>.Instance);
            InvitationService = new CompanyInvitationService(Repository, UserManager);
        }

        public SkillSenseDbContext DbContext { get; }
        public UserManager<AppUser> UserManager { get; }
        public RoleManager<IdentityRole<Guid>> RoleManager { get; }
        public TestCompanyLifecycleRepository Repository { get; }
        public CompanyRequestReviewService ReviewService { get; }
        public CompanyInvitationService InvitationService { get; }
        public string RawInvitationToken { get; } = "known-company-invitation-token";

        public static async Task<TestHarness> CreateAsync()
        {
            var services = new ServiceCollection();
            var databaseName = $"company-lifecycle-{Guid.NewGuid():N}";

            services.AddLogging();
            services.AddDataProtection();
            services.AddDbContext<SkillSenseDbContext>(options => options.UseInMemoryDatabase(databaseName));
            services.AddIdentityCore<AppUser>(options =>
                {
                    options.User.RequireUniqueEmail = true;
                    options.Password.RequiredLength = 8;
                    options.Password.RequireDigit = true;
                    options.Password.RequireLowercase = true;
                    options.Password.RequireUppercase = true;
                    options.Password.RequireNonAlphanumeric = true;
                })
                .AddRoles<IdentityRole<Guid>>()
                .AddEntityFrameworkStores<SkillSenseDbContext>();

            var provider = services.BuildServiceProvider();
            var dbContext = provider.GetRequiredService<SkillSenseDbContext>();
            await dbContext.Database.EnsureCreatedAsync();

            return new TestHarness(provider);
        }

        public CompanyAccountRequestEntity CreatePendingRequest()
        {
            var request = new CompanyAccountRequestEntity
            {
                Id = Guid.NewGuid(),
                CompanyName = "Northwind Labs",
                BusinessName = "Northwind Laboratories",
                Industry = "Technology",
                CompanySize = "51-200",
                WebsiteUrl = "https://northwind.example",
                Description = "Testing persistence.",
                Country = "Singapore",
                CityProvince = "Singapore",
                FullAddress = "1 Raffles Place",
                PrimaryAdminFullName = "Alex Reviewer",
                PrimaryAdminEmail = "owner@example.com",
                PrimaryAdminPhone = "+65 5555 1234",
                PrimaryAdminRole = "Founder",
                RequestedPlanId = SubscriptionPlanCatalog.StandardPlanId,
                BillingCycle = CompanyBillingCycle.Monthly,
                Status = CompanyAccountRequestStatus.PendingReview,
                SubmittedAtUtc = DateTime.UtcNow
            };

            DbContext.CompanyAccountRequests.Add(request);
            DbContext.SaveChanges();
            return request;
        }

        public async Task<AppUser> CreateApprovedCompanyAdminAsync()
        {
            var company = new CompanyEntity
            {
                Id = Guid.NewGuid(),
                Name = "Northwind Labs",
                PrimaryEmail = "owner@example.com",
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow,
                IsActive = true
            };

            var user = new AppUser
            {
                Id = Guid.NewGuid(),
                Email = "owner@example.com",
                UserName = "owner@example.com",
                NormalizedEmail = "OWNER@EXAMPLE.COM",
                NormalizedUserName = "OWNER@EXAMPLE.COM",
                EmailConfirmed = true,
                IsActive = true,
                LockoutEnabled = false,
                FirstName = "Alex",
                LastName = "Reviewer",
                AdminProfile = new AdminProfileEntity
                {
                    Id = Guid.NewGuid(),
                    CompanyId = company.Id,
                    CreatedAtUtc = DateTime.UtcNow
                }
            };

            DbContext.Companies.Add(company);
            await DbContext.SaveChangesAsync();

            var createResult = await UserManager.CreateAsync(user);
            Assert.True(createResult.Succeeded, string.Join("; ", createResult.Errors.Select(x => x.Description)));

            if (!await RoleManager.RoleExistsAsync("CompanyAdmin"))
            {
                var createRoleResult = await RoleManager.CreateAsync(new IdentityRole<Guid>("CompanyAdmin"));
                Assert.True(createRoleResult.Succeeded, string.Join("; ", createRoleResult.Errors.Select(x => x.Description)));
            }

            var addRoleResult = await UserManager.AddToRoleAsync(user, "CompanyAdmin");
            Assert.True(addRoleResult.Succeeded, string.Join("; ", addRoleResult.Errors.Select(x => x.Description)));

            DbContext.CompanySubscriptions.Add(new CompanySubscriptionEntity
            {
                Id = Guid.NewGuid(),
                CompanyId = company.Id,
                PlanId = SubscriptionPlanCatalog.StandardPlanId,
                BillingCycle = CompanyBillingCycle.Monthly,
                MockPaymentMethod = "gcash",
                Status = CompanySubscriptionStatus.PendingActivation,
                AutoRenews = true,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            });

            DbContext.CompanyInvitations.Add(new CompanyInvitationEntity
            {
                Id = Guid.NewGuid(),
                CompanyId = company.Id,
                Company = company,
                Email = user.Email!,
                Role = "CompanyAdmin",
                UserId = user.Id,
                TokenHash = HashToken(RawInvitationToken),
                ExpiresAtUtc = DateTime.UtcNow.AddDays(7),
                Status = CompanyInvitationStatus.Pending,
                CreatedAtUtc = DateTime.UtcNow
            });

            DbContext.CompanyAccountRequests.Add(new CompanyAccountRequestEntity
            {
                Id = Guid.NewGuid(),
                CompanyName = company.Name,
                BusinessName = "Northwind Laboratories",
                Industry = "Technology",
                CompanySize = "51-200",
                Description = "Approved request",
                Country = "Singapore",
                CityProvince = "Singapore",
                FullAddress = "1 Raffles Place",
                PrimaryAdminFullName = "Alex Reviewer",
                PrimaryAdminEmail = user.Email!,
                PrimaryAdminPhone = "+65 5555 1234",
                PrimaryAdminRole = "Founder",
                RequestedPlanId = SubscriptionPlanCatalog.StandardPlanId,
                BillingCycle = CompanyBillingCycle.Monthly,
                Status = CompanyAccountRequestStatus.Approved,
                ReviewedAtUtc = DateTime.UtcNow,
                SubmittedAtUtc = DateTime.UtcNow.AddMinutes(-10)
            });

            await DbContext.SaveChangesAsync();
            return user;
        }

        public async ValueTask DisposeAsync()
        {
            await DbContext.DisposeAsync();
            await _serviceProvider.DisposeAsync();
        }

        private static string HashToken(string token)
            => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token.Trim())));
    }

    private sealed class RecordingEmailService : IEmailService
    {
        public Task SendEmailAsync(EmailMessage message, CancellationToken ct = default) => Task.CompletedTask;
    }

    private sealed class AdminProfileIntegrityDbContext(DbContextOptions<AdminProfileIntegrityDbContext> options)
        : DbContext(options)
    {
        public DbSet<AppUser> Users => Set<AppUser>();
        public DbSet<CompanyEntity> Companies => Set<CompanyEntity>();
        public DbSet<AdminProfileEntity> AdminProfiles => Set<AdminProfileEntity>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AppUser>(builder =>
            {
                builder.ToTable("users");
                builder.HasKey(x => x.Id);
                builder.HasOne(x => x.AdminProfile)
                    .WithOne(x => x.User)
                    .HasForeignKey<AdminProfileEntity>(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<CompanyEntity>(builder =>
            {
                builder.ToTable("companies");
                builder.HasKey(x => x.Id);
                builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
            });

            modelBuilder.Entity<AdminProfileEntity>(builder =>
            {
                builder.ToTable("admin_profiles");
                builder.HasKey(x => x.Id);
                builder.Property(x => x.CreatedAtUtc).IsRequired();
                builder.HasIndex(x => x.UserId).IsUnique();
                builder.HasIndex(x => x.CompanyId);
                builder.HasOne(x => x.Company)
                    .WithMany(x => x.AdminProfiles)
                    .HasForeignKey(x => x.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }

    private sealed class TestCompanyLifecycleRepository(SkillSenseDbContext dbContext) : ICompanyLifecycleRepository
    {
        public Task AddRequestAsync(CompanyAccountRequestEntity request, CancellationToken ct = default)
            => dbContext.CompanyAccountRequests.AddAsync(request, ct).AsTask();

        public Task<CompanyAccountRequestEntity?> GetRequestByIdAsync(Guid requestId, CancellationToken ct = default)
            => dbContext.CompanyAccountRequests
                .Include(x => x.Documents)
                .FirstOrDefaultAsync(x => x.Id == requestId, ct);

        public Task<CompanyAccountRequestEntity?> GetRequestByIdForUpdateAsync(Guid requestId, CancellationToken ct = default)
            => dbContext.CompanyAccountRequests
                .Include(x => x.Documents)
                .FirstOrDefaultAsync(x => x.Id == requestId, ct);

        public Task<CompanyAccountRequestEntity?> GetLatestApprovedRequestByPrimaryAdminEmailAsync(string email, CancellationToken ct = default)
            => dbContext.CompanyAccountRequests
                .AsNoTracking()
                .Where(x => x.PrimaryAdminEmail == email && x.Status == CompanyAccountRequestStatus.Approved)
                .OrderByDescending(x => x.ReviewedAtUtc ?? x.SubmittedAtUtc)
                .FirstOrDefaultAsync(ct);

        public Task<List<CompanyAccountRequestEntity>> GetRequestsAsync(CompanyAccountRequestStatus? status, CancellationToken ct = default)
            => dbContext.CompanyAccountRequests
                .Where(x => !status.HasValue || x.Status == status.Value)
                .ToListAsync(ct);

        public Task AddCompanyAsync(CompanyEntity company, CancellationToken ct = default)
            => dbContext.Companies.AddAsync(company, ct).AsTask();

        public Task AddSubscriptionAsync(CompanySubscriptionEntity subscription, CancellationToken ct = default)
            => dbContext.CompanySubscriptions.AddAsync(subscription, ct).AsTask();

        public Task<CompanySubscriptionEntity?> GetCurrentSubscriptionAsync(Guid companyId, CancellationToken ct = default)
            => dbContext.CompanySubscriptions
                .AsNoTracking()
                .Where(x => x.CompanyId == companyId)
                .OrderByDescending(x => x.CreatedAtUtc)
                .FirstOrDefaultAsync(ct);

        public Task<CompanySubscriptionEntity?> GetCurrentSubscriptionForUpdateAsync(Guid companyId, CancellationToken ct = default)
            => dbContext.CompanySubscriptions
                .Where(x => x.CompanyId == companyId)
                .OrderByDescending(x => x.CreatedAtUtc)
                .FirstOrDefaultAsync(ct);

        public Task<CompanySubscriptionEntity?> GetCompanyAdminSubscriptionAsync(Guid userId, CancellationToken ct = default)
            => dbContext.AdminProfiles
                .AsNoTracking()
                .Where(x => x.UserId == userId && x.CompanyId.HasValue)
                .Join(
                    dbContext.CompanySubscriptions.AsNoTracking(),
                    profile => profile.CompanyId!.Value,
                    subscription => subscription.CompanyId,
                    (_, subscription) => subscription)
                .OrderByDescending(x => x.CreatedAtUtc)
                .FirstOrDefaultAsync(ct);

        public Task AddInvitationAsync(CompanyInvitationEntity invitation, CancellationToken ct = default)
            => dbContext.CompanyInvitations.AddAsync(invitation, ct).AsTask();

        public Task<CompanyInvitationEntity?> GetInvitationByTokenHashAsync(string tokenHash, CancellationToken ct = default)
            => dbContext.CompanyInvitations
                .Include(x => x.Company)
                .Where(x => x.TokenHash == tokenHash)
                .OrderByDescending(x => x.CreatedAtUtc)
                .FirstOrDefaultAsync(ct);

        public Task<int> CountActiveJobsAsync(Guid companyId, CancellationToken ct = default)
            => Task.FromResult(0);

        public Task<int> CountResumeScreeningsAsync(Guid companyId, DateTime? startsAtUtc, DateTime? endsAtUtc, CancellationToken ct = default)
            => Task.FromResult(0);

        public Task<bool> EmailExistsAsync(string email, CancellationToken ct = default)
            => dbContext.Users.AnyAsync(x => x.NormalizedEmail == email.ToUpperInvariant(), ct);

        public Task<IDbContextTransaction> BeginSerializableTransactionAsync(CancellationToken ct = default)
            => Task.FromResult<IDbContextTransaction>(new NoOpDbContextTransaction());

        public Task SaveChangesAsync(CancellationToken ct = default)
            => dbContext.SaveChangesAsync(ct);
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
