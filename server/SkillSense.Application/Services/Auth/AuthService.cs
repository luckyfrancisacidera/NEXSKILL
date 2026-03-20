using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SkillSense.Application.Contracts.Auth;
using SkillSense.Application.Contracts.Email;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Auth;
using SkillSense.Application.Options;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;
using System.Text;
using System.Net;

namespace SkillSense.Application.Services.Auth;

/// <summary>
/// Coordinates authentication, registration, and password reset flows for application users.
/// </summary>
/// <remarks>
/// This service preserves the existing identity workflow while delegating persistence concerns to repositories.
/// It is responsible for sanitizing user input, creating identity users, issuing tokens, and managing password recovery state.
/// </remarks>
public sealed class AuthService(
    UserManager<AppUser> userManager,
    RoleManager<IdentityRole<Guid>> roleManager,
    ITokenService tokenService,
    IInputSanitizer sanitizer,
    IAuthRepository authRepository,
    IDateTimeProvider dateTimeProvider,
    IEmailService emailService,
    IOptions<PasswordResetOptions> passwordResetOptions,
    ILogger<AuthService> logger) : IAuthService
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
    private readonly IEmailService _emailService = emailService;
    private readonly PasswordResetOptions _passwordResetOptions = passwordResetOptions.Value;
    private readonly ILogger<AuthService> _logger = logger;

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
    /// Generates a password reset token and dispatches the email notification.
    /// </summary>
    public async Task RequestPasswordResetAsync(RequestPasswordResetRequest request, CancellationToken cancellationToken)
    {
        var email = _sanitizer.SanitizeEmail(request.Email);
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
        {
            return;
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
        var resetLink = BuildPasswordResetLink(_passwordResetOptions.FrontendBaseUrl, email, encodedToken);

        try
        {
            await _emailService.SendEmailAsync(new EmailMessage
            {
                ToEmail = email,
                Subject = "Reset your Nexskill password",
                Html = BuildPasswordResetEmailHtml(resetLink),
            }, cancellationToken);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email for user {UserId}.", user.Id);
        }
    }

    /// <summary>
    /// Validates whether a password reset token is still active and valid for the supplied user.
    /// </summary>
    public async Task<bool> ValidatePasswordResetTokenAsync(ValidatePasswordResetTokenRequest request, CancellationToken cancellationToken)
    {
        var email = _sanitizer.SanitizeEmail(request.Email);
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
        {
            return false;
        }

        var decodedToken = DecodePasswordResetToken(request.Token);
        if (decodedToken is null)
        {
            return false;
        }

        var tokenProvider = _userManager.Options.Tokens.PasswordResetTokenProvider;
        return await _userManager.VerifyUserTokenAsync(
            user,
            tokenProvider,
            UserManager<AppUser>.ResetPasswordTokenPurpose,
            decodedToken);
    }

    /// <summary>
    /// Resets the user's password after verifying the supplied token.
    /// </summary>
    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        var email = _sanitizer.SanitizeEmail(request.Email);
        var user = await _userManager.FindByEmailAsync(email)
            ?? throw new ArgumentException("The password reset link is invalid or has expired.");

        var decodedToken = DecodePasswordResetToken(request.Token)
            ?? throw new ArgumentException("The password reset link is invalid or has expired.");

        var tokenProvider = _userManager.Options.Tokens.PasswordResetTokenProvider;
        var isValidToken = await _userManager.VerifyUserTokenAsync(
            user,
            tokenProvider,
            UserManager<AppUser>.ResetPasswordTokenPurpose,
            decodedToken);

        if (!isValidToken)
        {
            throw new ArgumentException("The password reset link is invalid or has expired.");
        }

        var passwordValidation = await ValidatePasswordAsync(user, request.NewPassword);
        if (passwordValidation.Count > 0)
        {
            throw new ArgumentException(passwordValidation[0]);
        }

        var result = await _userManager.ResetPasswordAsync(user, decodedToken, request.NewPassword);
        if (!result.Succeeded)
        {
            var invalidTokenError = result.Errors.FirstOrDefault(error =>
                string.Equals(error.Code, "InvalidToken", StringComparison.OrdinalIgnoreCase));

            if (invalidTokenError is not null)
            {
                throw new ArgumentException("The password reset link is invalid or has expired.");
            }

            throw new ArgumentException(result.Errors.FirstOrDefault()?.Description ?? "Could not reset password.");
        }
    }

    /// <summary>
    /// Changes the password for an authenticated user after validating the current credentials.
    /// </summary>
    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new ArgumentException("Unable to find the current account.");

        var currentPassword = _sanitizer.Sanitize(request.CurrentPassword);
        var newPassword = _sanitizer.Sanitize(request.NewPassword);

        var passwordValidation = await ValidatePasswordAsync(user, newPassword);
        if (passwordValidation.Count > 0)
        {
            throw new ArgumentException(passwordValidation[0]);
        }

        var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        if (!result.Succeeded)
        {
            throw new ArgumentException(result.Errors.FirstOrDefault()?.Description ?? "Could not change password.");
        }
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

    private static string? DecodePasswordResetToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return null;
        }

        try
        {
            var bytes = WebEncoders.Base64UrlDecode(token.Trim());
            return Encoding.UTF8.GetString(bytes);
        }
        catch (FormatException)
        {
            return null;
        }
    }

    private static string BuildPasswordResetLink(string frontendBaseUrl, string email, string encodedToken)
    {
        var query = new Dictionary<string, string?>
        {
            ["email"] = email,
            ["token"] = encodedToken,
        };

        var normalizedBaseUrl = NormalizeFrontendBaseUrl(frontendBaseUrl);
        return QueryHelpers.AddQueryString($"{normalizedBaseUrl}/reset-password", query);
    }

    private static string BuildPasswordResetEmailHtml(string resetLink)
    {
        var encodedLink = WebUtility.HtmlEncode(resetLink);

        return $"""
            <p>We received a request to reset your Nexskill password.</p>
            <p><a href="{encodedLink}">Reset your password</a></p>
            <p>If you did not request this, you can safely ignore this email.</p>
            """;
    }

    private static string NormalizeFrontendBaseUrl(string frontendBaseUrl)
    {
        if (string.IsNullOrWhiteSpace(frontendBaseUrl))
        {
            return "http://localhost:5173";
        }

        return frontendBaseUrl.Trim().TrimEnd('/');
    }
}
