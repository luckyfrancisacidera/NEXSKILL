using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using SkillSense.Application.Contracts.Auth;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Auth;
using SkillSense.Application.Services.Auth;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Application.Tests;

public sealed class AuthServiceTests
{
    [Fact]
    public async Task LoginAsync_BlocksInactiveRecruiter()
    {
        var recruiter = CreateUser("recruiter@company.com", lockoutEnd: DateTimeOffset.UtcNow.AddYears(1));
        var service = CreateService(
            userManager: CreateUserManager((recruiter, true, ["Recruiter"])),
            authRepository: new TestAuthRepository());

        var result = await service.LoginAsync(new LoginRequest { Email = recruiter.Email!, Password = "Password123!" }, CancellationToken.None);

        Assert.False(result.Succeeded);
        Assert.Equal("Authentication failed.", result.Message);
        Assert.Contains("Your account is inactive. Please contact your administrator.", result.Errors);
    }

    [Fact]
    public async Task LoginAsync_BlocksInactiveCompanyAdmin()
    {
        var admin = CreateUser("admin@company.com", lockoutEnd: DateTimeOffset.UtcNow.AddYears(1));
        var service = CreateService(
            userManager: CreateUserManager((admin, true, ["CompanyAdmin"])),
            authRepository: new TestAuthRepository());

        var result = await service.LoginAsync(new LoginRequest { Email = admin.Email!, Password = "Password123!" }, CancellationToken.None);

        Assert.False(result.Succeeded);
        Assert.Contains("Your account is inactive. Please contact your administrator.", result.Errors);
    }

    [Fact]
    public async Task LoginAsync_AllowsActiveRecruiterInActiveCompany()
    {
        var recruiter = CreateUser("active.recruiter@company.com");
        var service = CreateService(
            userManager: CreateUserManager((recruiter, true, ["Recruiter"])),
            authRepository: new TestAuthRepository
            {
                CompanyAccessByUserId =
                {
                    [recruiter.Id] = new AuthUserCompanyAccessData { CompanyId = Guid.NewGuid(), CompanyIsActive = true }
                }
            });

        var result = await service.LoginAsync(new LoginRequest { Email = recruiter.Email!, Password = "Password123!" }, CancellationToken.None);

        Assert.True(result.Succeeded);
        Assert.Equal("Login successful.", result.Message);
        Assert.Equal("access-token", result.Token);
        Assert.Equal("refresh-token", result.RefreshToken);
    }

    [Fact]
    public async Task LoginAsync_BlocksRecruiterWhenCompanyIsInactive()
    {
        var recruiter = CreateUser("recruiter@inactive-company.com");
        var service = CreateService(
            userManager: CreateUserManager((recruiter, true, ["Recruiter"])),
            authRepository: new TestAuthRepository
            {
                CompanyAccessByUserId =
                {
                    [recruiter.Id] = new AuthUserCompanyAccessData { CompanyId = Guid.NewGuid(), CompanyIsActive = false }
                }
            });

        var result = await service.LoginAsync(new LoginRequest { Email = recruiter.Email!, Password = "Password123!" }, CancellationToken.None);

        Assert.False(result.Succeeded);
        Assert.Contains("Your company account is inactive. Please contact your administrator.", result.Errors);
    }

    [Fact]
    public async Task LoginAsync_BlocksCompanyAdminWhenCompanyIsInactive()
    {
        var admin = CreateUser("admin@inactive-company.com");
        var service = CreateService(
            userManager: CreateUserManager((admin, true, ["CompanyAdmin"])),
            authRepository: new TestAuthRepository
            {
                CompanyAccessByUserId =
                {
                    [admin.Id] = new AuthUserCompanyAccessData { CompanyId = Guid.NewGuid(), CompanyIsActive = false }
                }
            });

        var result = await service.LoginAsync(new LoginRequest { Email = admin.Email!, Password = "Password123!" }, CancellationToken.None);

        Assert.False(result.Succeeded);
        Assert.Contains("Your company account is inactive. Please contact your administrator.", result.Errors);
    }

    [Fact]
    public async Task LoginAsync_DoesNotAffectUserFromAnotherActiveCompany()
    {
        var blockedRecruiter = CreateUser("blocked@company-a.com");
        var allowedRecruiter = CreateUser("allowed@company-b.com");
        var authRepository = new TestAuthRepository
        {
            CompanyAccessByUserId =
            {
                [blockedRecruiter.Id] = new AuthUserCompanyAccessData { CompanyId = Guid.NewGuid(), CompanyIsActive = false },
                [allowedRecruiter.Id] = new AuthUserCompanyAccessData { CompanyId = Guid.NewGuid(), CompanyIsActive = true }
            }
        };

        var service = CreateService(
            userManager: CreateUserManager((blockedRecruiter, true, ["Recruiter"]), (allowedRecruiter, true, ["Recruiter"])),
            authRepository: authRepository);

        var result = await service.LoginAsync(new LoginRequest { Email = allowedRecruiter.Email!, Password = "Password123!" }, CancellationToken.None);

        Assert.True(result.Succeeded);
        Assert.Equal(allowedRecruiter.Email, result.Email);
    }

    [Fact]
    public async Task RefreshAsync_BlocksInactiveCompanyUserBeforeIssuingNewTokens()
    {
        var recruiter = CreateUser("refresh@inactive-company.com");
        var tokenService = new TestTokenService { ValidatedUserId = recruiter.Id };
        var service = CreateService(
            userManager: CreateUserManager((recruiter, true, ["Recruiter"])),
            tokenService: tokenService,
            authRepository: new TestAuthRepository
            {
                CompanyAccessByUserId =
                {
                    [recruiter.Id] = new AuthUserCompanyAccessData { CompanyId = Guid.NewGuid(), CompanyIsActive = false }
                }
            });

        var result = await service.RefreshAsync("refresh-token", CancellationToken.None);

        Assert.False(result.Succeeded);
        Assert.Contains("Your company account is inactive. Please contact your administrator.", result.Errors);
        Assert.Equal(0, tokenService.CreateTokenCalls);
        Assert.Equal(0, tokenService.CreateRefreshTokenCalls);
    }

    private static AuthService CreateService(
        TestUserManager? userManager = null,
        TestTokenService? tokenService = null,
        TestAuthRepository? authRepository = null)
    {
        return new AuthService(
            userManager ?? CreateUserManager(),
            new TestRoleManager(),
            tokenService ?? new TestTokenService(),
            new PassThroughSanitizer(),
            authRepository ?? new TestAuthRepository(),
            new FixedDateTimeProvider(),
            new NoOpResetPinEmailSender());
    }

    private static TestUserManager CreateUserManager(params (AppUser user, bool passwordValid, string[] roles)[] users)
    {
        var userManager = new TestUserManager();
        foreach (var (user, passwordValid, roles) in users)
        {
            userManager.AddUser(user, passwordValid, roles);
        }

        return userManager;
    }

    private static AppUser CreateUser(string email, DateTimeOffset? lockoutEnd = null)
        => new()
        {
            Id = Guid.NewGuid(),
            Email = email,
            UserName = email,
            NormalizedEmail = email.ToUpperInvariant(),
            NormalizedUserName = email.ToUpperInvariant(),
            LockoutEnd = lockoutEnd,
        };

    private sealed class TestUserManager : UserManager<AppUser>
    {
        private readonly Dictionary<string, AppUser> _usersByEmail = new(StringComparer.OrdinalIgnoreCase);
        private readonly Dictionary<Guid, AppUser> _usersById = [];
        private readonly Dictionary<Guid, bool> _passwordValidity = [];
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

        public void AddUser(AppUser user, bool passwordValid, params string[] roles)
        {
            _usersByEmail[user.Email ?? string.Empty] = user;
            _usersById[user.Id] = user;
            _passwordValidity[user.Id] = passwordValid;
            _rolesByUserId[user.Id] = roles.ToList();
        }

        public override Task<AppUser?> FindByEmailAsync(string email)
            => Task.FromResult(_usersByEmail.TryGetValue(email, out var user) ? user : null);

        public override Task<AppUser?> FindByIdAsync(string userId)
            => Task.FromResult(Guid.TryParse(userId, out var parsedUserId) && _usersById.TryGetValue(parsedUserId, out var user) ? user : null);

        public override Task<bool> CheckPasswordAsync(AppUser user, string password)
            => Task.FromResult(_passwordValidity.TryGetValue(user.Id, out var isValid) && isValid);

        public override Task<IList<string>> GetRolesAsync(AppUser user)
            => Task.FromResult(_rolesByUserId.TryGetValue(user.Id, out var roles) ? roles : (IList<string>)[]);
    }

    private sealed class TestRoleManager()
        : RoleManager<IdentityRole<Guid>>(
            new TestRoleStore(),
            [],
            new UpperInvariantLookupNormalizer(),
            new IdentityErrorDescriber(),
            NullLogger<RoleManager<IdentityRole<Guid>>>.Instance)
    {
        public override Task<bool> RoleExistsAsync(string roleName) => Task.FromResult(true);
    }

    private sealed class TestTokenService : ITokenService
    {
        public int CreateTokenCalls { get; private set; }
        public int CreateRefreshTokenCalls { get; private set; }
        public Guid? ValidatedUserId { get; set; }

        public Task<string> CreateTokenAsync(AppUser user, CancellationToken cancellationToken)
        {
            CreateTokenCalls++;
            return Task.FromResult("access-token");
        }

        public Task<string> CreateRefreshTokenAsync(AppUser user, CancellationToken cancellationToken)
        {
            CreateRefreshTokenCalls++;
            return Task.FromResult("refresh-token");
        }

        public Task<Guid?> ValidateRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken)
            => Task.FromResult(ValidatedUserId);
    }

    private sealed class TestAuthRepository : IAuthRepository
    {
        public Dictionary<Guid, AuthUserCompanyAccessData> CompanyAccessByUserId { get; } = [];

        public Task<AuthUserCompanyAccessData?> GetUserCompanyAccessAsync(Guid userId, CancellationToken ct = default)
            => Task.FromResult(CompanyAccessByUserId.TryGetValue(userId, out var access) ? access : null);

        public Task<List<PasswordResetPinEntity>> GetUnusedPasswordResetPinsAsync(Guid userId, CancellationToken ct = default)
            => Task.FromResult(new List<PasswordResetPinEntity>());

        public Task<PasswordResetPinEntity?> GetLatestPasswordResetPinAsync(Guid userId, CancellationToken ct = default)
            => Task.FromResult<PasswordResetPinEntity?>(null);

        public Task AddPasswordResetPinAsync(PasswordResetPinEntity entity, CancellationToken ct = default)
            => Task.CompletedTask;

        public Task SaveChangesAsync(CancellationToken ct = default)
            => Task.CompletedTask;
    }

    private sealed class PassThroughSanitizer : IInputSanitizer
    {
        public string Sanitize(string? value) => value?.Trim() ?? string.Empty;
        public string SanitizeEmail(string? value) => value?.Trim().ToLowerInvariant() ?? string.Empty;
    }

    private sealed class FixedDateTimeProvider : IDateTimeProvider
    {
        public DateTime UtcNow { get; } = new(2026, 3, 13, 0, 0, 0, DateTimeKind.Utc);
    }

    private sealed class NoOpResetPinEmailSender : IResetPinEmailSender
    {
        public Task SendResetPinAsync(string toEmail, string pin, CancellationToken ct = default)
            => Task.CompletedTask;
    }

    private sealed class EmptyServiceProvider : IServiceProvider
    {
        public object? GetService(Type serviceType) => null;
    }

    private sealed class TestUserStore : IUserPasswordStore<AppUser>
    {
        public void Dispose() { }
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
        public Task SetPasswordHashAsync(AppUser user, string? passwordHash, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task<string?> GetPasswordHashAsync(AppUser user, CancellationToken cancellationToken) => Task.FromResult<string?>(null);
        public Task<bool> HasPasswordAsync(AppUser user, CancellationToken cancellationToken) => Task.FromResult(true);
    }

    private sealed class TestRoleStore : IRoleStore<IdentityRole<Guid>>
    {
        public void Dispose() { }
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
}

