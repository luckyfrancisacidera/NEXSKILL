using Microsoft.AspNetCore.Identity;
using SkillSense.Application.Contracts.Auth;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Auth;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services.Auth;

/// <summary>
/// Coordinates authentication, registration, and password reset flows for application users.
/// </summary>
/// <remarks>
/// This service preserves the existing identity workflow while delegating persistence concerns to repositories.
/// It is responsible for sanitizing user input, creating identity users, issuing tokens, and managing reset PIN lifecycle state.
/// </remarks>
public sealed class AuthService(
    UserManager<AppUser> userManager,
    RoleManager<IdentityRole<Guid>> roleManager,
    ITokenService tokenService,
    IInputSanitizer sanitizer,
    IAuthRepository authRepository,
    IDateTimeProvider dateTimeProvider,
    IResetPinEmailSender resetPinEmailSender) : IAuthService
{
    private const string AuthenticationFailedMessage = "Authentication failed.";
    private const string InvalidCredentialsError = "Invalid email or password.";
    private const string InactiveAccountError = "Your account is inactive. Please contact your administrator.";
    private const string InactiveCompanyError = "Your company account is inactive. Please contact your administrator.";

    private readonly UserManager<AppUser> _userManager = userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager = roleManager;
    private readonly ITokenService _tokenService = tokenService;
    private readonly IInputSanitizer _sanitizer = sanitizer;
    private readonly IAuthRepository _authRepository = authRepository;
    private readonly IDateTimeProvider _dateTimeProvider = dateTimeProvider;
    private readonly IResetPinEmailSender _resetPinEmailSender = resetPinEmailSender;

    /// <summary>
    /// Registers a new job seeker account and returns the generated authentication tokens.
    /// </summary>
    public async Task<AuthResult> RegisterJobSeekerAsync(RegisterJobSeekerRequest request, CancellationToken cancellationToken)
    {
        var email = _sanitizer.SanitizeEmail(request.Email);
        var password = _sanitizer.Sanitize(request.Password);

        var existing = await _userManager.FindByEmailAsync(email);
        if (existing is not null) return AuthResult.Failure("Registration failed.", "Unable to create user with provided credentials.");

        var user = new AppUser { UserName = email, Email = email, NormalizedEmail = email.ToUpperInvariant(), NormalizedUserName = email.ToUpperInvariant(), EmailConfirmed = true };
        var passwordValidation = await ValidatePasswordAsync(user, password);
        if (passwordValidation.Count > 0) return AuthResult.Failure("Validation failed.", passwordValidation.ToArray());

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded) return AuthResult.Failure("Registration failed.", result.Errors.Select(e => e.Description).ToArray());

        await EnsureRoleExistsAsync("JobSeeker");
        await _userManager.AddToRoleAsync(user, "JobSeeker");

        user.JobSeekerProfile = new JobSeekerProfileEntity { UserId = user.Id, FullName = email.Split('@')[0] };
        await _userManager.UpdateAsync(user);

        return await CreateSuccessAuthResultAsync(user, "Registration successful.", cancellationToken);
    }

    /// <summary>
    /// Authenticates an existing user and issues a fresh access token and refresh token pair.
    /// </summary>
    public async Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = _sanitizer.SanitizeEmail(request.Email);
        var password = _sanitizer.Sanitize(request.Password);

        var user = await _userManager.FindByEmailAsync(email);
        if (user is null) return AuthResult.Failure(AuthenticationFailedMessage, InvalidCredentialsError);

        var valid = await _userManager.CheckPasswordAsync(user, password);
        if (!valid) return AuthResult.Failure(AuthenticationFailedMessage, InvalidCredentialsError);

        var blockedResult = await GetBlockedAuthenticationResultAsync(user, cancellationToken);
        if (blockedResult is not null)
        {
            return blockedResult;
        }

        return await CreateSuccessAuthResultAsync(user, "Login successful.", cancellationToken);
    }

    /// <summary>
    /// Refreshes an authenticated session after revalidating account eligibility.
    /// </summary>
    public async Task<AuthResult> RefreshAsync(string refreshToken, CancellationToken cancellationToken)
    {
        var userId = await _tokenService.ValidateRefreshTokenAsync(refreshToken, cancellationToken);
        if (!userId.HasValue)
        {
            return AuthResult.Failure("Invalid refresh token.");
        }

        var user = await _userManager.FindByIdAsync(userId.Value.ToString());
        if (user is null)
        {
            return AuthResult.Failure("Invalid refresh token.");
        }

        var blockedResult = await GetBlockedAuthenticationResultAsync(user, cancellationToken);
        if (blockedResult is not null)
        {
            return blockedResult;
        }

        return await CreateSuccessAuthResultAsync(user, "Token refreshed.", cancellationToken);
    }

    public async Task<bool> IsSessionActiveAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
        {
            return false;
        }

        return await GetBlockedAuthenticationResultAsync(user, cancellationToken) is null;
    }

    /// <summary>
    /// Creates a privileged account for recruiter, company admin, or super admin roles.
    /// </summary>
    public async Task<AuthResult> CreatePrivilegedUserAsync(CreatePrivilegedUserRequest request, CancellationToken cancellationToken)
    {
        var email = _sanitizer.SanitizeEmail(request.Email);
        var password = _sanitizer.Sanitize(request.Password);
        var role = _sanitizer.Sanitize(request.Role);

        var existing = await _userManager.FindByEmailAsync(email);
        if (existing is not null) return AuthResult.Failure("Create user failed.", "Unable to create user with provided credentials.");

        var user = new AppUser { UserName = email, Email = email, NormalizedEmail = email.ToUpperInvariant(), NormalizedUserName = email.ToUpperInvariant(), EmailConfirmed = true };
        var passwordValidation = await ValidatePasswordAsync(user, password);
        if (passwordValidation.Count > 0) return AuthResult.Failure("Validation failed.", passwordValidation.ToArray());

        var createResult = await _userManager.CreateAsync(user, password);
        if (!createResult.Succeeded) return AuthResult.Failure("Create user failed.", createResult.Errors.Select(e => e.Description).ToArray());

        await EnsureRoleExistsAsync(role);
        await _userManager.AddToRoleAsync(user, role);

        if (role.Equals("Recruiter", StringComparison.OrdinalIgnoreCase))
        {
            user.RecruiterProfile = new RecruiterProfileEntity
            {
                UserId = user.Id,
                CompanyId = request.CompanyId ?? Guid.Empty
            };
        }
        else
        {
            user.AdminProfile = new AdminProfileEntity
            {
                UserId = user.Id,
                CompanyId = role.Equals("CompanyAdmin", StringComparison.OrdinalIgnoreCase) ? request.CompanyId : null
            };
        }

        await _userManager.UpdateAsync(user);
        var roles = await _userManager.GetRolesAsync(user);
        return AuthResult.Success("User created successfully.", token: null, refreshToken: null, email: user.Email, userId: user.Id.ToString(), roles: roles.ToArray());
    }

    /// <summary>
    /// Generates a one-time reset PIN, invalidates previously unused PINs, and dispatches the email notification.
    /// </summary>
    public async Task RequestPasswordResetAsync(RequestPasswordResetRequest request, CancellationToken cancellationToken)
    {
        var email = _sanitizer.SanitizeEmail(request.Email);
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null) return;

        var pin = Random.Shared.Next(0, 1_000_000).ToString("D6");
        var now = _dateTimeProvider.UtcNow;

        var existingPins = await _authRepository.GetUnusedPasswordResetPinsAsync(user.Id, cancellationToken);
        foreach (var existing in existingPins) existing.Used = true;

        await _authRepository.AddPasswordResetPinAsync(new PasswordResetPinEntity
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Pin = pin,
            ExpiresAtUtc = now.AddMinutes(15),
            Used = false,
            CreatedAtUtc = now,
        }, cancellationToken);

        if (existingPins.Count > 0)
        {
            await _authRepository.SaveChangesAsync(cancellationToken);
        }

        await _resetPinEmailSender.SendResetPinAsync(email, pin, cancellationToken);
    }

    /// <summary>
    /// Validates whether the latest reset PIN for the supplied user is still active and matches the request.
    /// </summary>
    public async Task<bool> VerifyResetPinAsync(VerifyResetPinRequest request, CancellationToken cancellationToken)
    {
        var email = _sanitizer.SanitizeEmail(request.Email);
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null) return false;

        var pin = await _authRepository.GetLatestPasswordResetPinAsync(user.Id, cancellationToken);
        return pin is not null && !pin.Used && pin.Pin == request.Pin && pin.ExpiresAtUtc >= _dateTimeProvider.UtcNow;
    }

    /// <summary>
    /// Resets the user's password after verifying the latest PIN and marks the PIN as consumed.
    /// </summary>
    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        var email = _sanitizer.SanitizeEmail(request.Email);
        var user = await _userManager.FindByEmailAsync(email) ?? throw new InvalidOperationException("Invalid reset request.");

        var pin = await _authRepository.GetLatestPasswordResetPinAsync(user.Id, cancellationToken);
        if (pin is null || pin.Used || pin.Pin != request.Pin || pin.ExpiresAtUtc < _dateTimeProvider.UtcNow)
            throw new InvalidOperationException("Invalid or expired reset PIN.");

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);
        if (!result.Succeeded) throw new InvalidOperationException(result.Errors.FirstOrDefault()?.Description ?? "Could not reset password.");

        pin.Used = true;
        await _authRepository.SaveChangesAsync(cancellationToken);
    }

    private async Task<AuthResult> CreateSuccessAuthResultAsync(AppUser user, string message, CancellationToken cancellationToken)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var token = await _tokenService.CreateTokenAsync(user, cancellationToken);
        var refreshToken = await _tokenService.CreateRefreshTokenAsync(user, cancellationToken);

        return AuthResult.Success(message, token, refreshToken, user.Email, user.Id.ToString(), roles.ToArray());
    }

    private async Task<AuthResult?> GetBlockedAuthenticationResultAsync(AppUser user, CancellationToken cancellationToken)
    {
        if (IsIdentityAccountInactive(user))
        {
            return AuthResult.Failure(AuthenticationFailedMessage, InactiveAccountError);
        }

        var companyAccess = await _authRepository.GetUserCompanyAccessAsync(user.Id, cancellationToken);
        if (companyAccess is not null && !companyAccess.CompanyIsActive)
        {
            return AuthResult.Failure(AuthenticationFailedMessage, InactiveCompanyError);
        }

        return null;
    }

    private bool IsIdentityAccountInactive(AppUser user)
    {
        var now = new DateTimeOffset(DateTime.SpecifyKind(_dateTimeProvider.UtcNow, DateTimeKind.Utc));
        return user.LockoutEnd.HasValue && user.LockoutEnd > now;
    }

    private async Task<IReadOnlyList<string>> ValidatePasswordAsync(AppUser user, string password)
    {
        var errors = new List<string>();
        foreach (var validator in _userManager.PasswordValidators)
        {
            var result = await validator.ValidateAsync(_userManager, user, password);
            if (!result.Succeeded) errors.AddRange(result.Errors.Select(e => e.Description));
        }

        return errors.Distinct().ToArray();
    }

    private async Task EnsureRoleExistsAsync(string role)
    {
        if (!await _roleManager.RoleExistsAsync(role)) await _roleManager.CreateAsync(new IdentityRole<Guid>(role));
    }
}
