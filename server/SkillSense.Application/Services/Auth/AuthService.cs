using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
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
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;

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
        var firstName = NullIfEmpty(_sanitizer.Sanitize(request.FirstName));
        var lastName = NullIfEmpty(_sanitizer.Sanitize(request.LastName));
        var email = _sanitizer.SanitizeEmail(request.Email);
        var password = _sanitizer.Sanitize(request.Password);

        if (firstName is null)
        {
            return AuthResult.Failure("Validation failed.", "First name is required.");
        }

        if (lastName is null)
        {
            return AuthResult.Failure("Validation failed.", "Last name is required.");
        }

        var existing = await _userManager.FindByEmailAsync(email);
        if (existing is not null) return AuthResult.Failure("Registration failed.", "Unable to create user with provided credentials.");

        var user = new AppUser
        {
            UserName = email,
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            NormalizedUserName = email.ToUpperInvariant(),
            EmailConfirmed = true,
            FirstName = firstName,
            LastName = lastName
        };
        var passwordValidation = await ValidatePasswordAsync(user, password);
        if (passwordValidation.Count > 0) return AuthResult.Failure("Validation failed.", passwordValidation.ToArray());

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded) return AuthResult.Failure("Registration failed.", result.Errors.Select(e => e.Description).ToArray());

        await EnsureRoleExistsAsync("JobSeeker");
        await _userManager.AddToRoleAsync(user, "JobSeeker");

        user.JobSeekerProfile = new JobSeekerProfileEntity { UserId = user.Id };
        SyncJobSeekerProfile(user, ["JobSeeker"]);
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

    public async Task RequestPasswordResetPinAsync(RequestPasswordResetPinRequest request, CancellationToken cancellationToken)
    {
        var email = _sanitizer.SanitizeEmail(request.Email);
        if (string.IsNullOrWhiteSpace(email))
        {
            return;
        }

        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
        {
            return;
        }

        var nowUtc = _dateTimeProvider.UtcNow;
        var activePins = await _authRepository.GetActivePinsAsync(
            user.Id,
            VerificationPinPurpose.PasswordReset,
            nowUtc,
            cancellationToken);

        _logger.LogInformation(
            "Preparing password reset PIN for user {UserId}. Active unused PIN count: {PinCount}.",
            user.Id,
            activePins.Count);

        if (activePins.Count > 0)
        {
            foreach (var existingPin in activePins)
            {
                existingPin.Used = true;
            }

            try
            {
                await _authRepository.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogWarning(
                    ex,
                    "Concurrency issue while invalidating existing password reset PINs for user {UserId}.",
                    user.Id);
                throw new InvalidOperationException("Could not prepare a new password reset PIN right now.");
            }
        }

        const int pinExpiryMinutes = 10;
        var rawPin = GeneratePin();
        var pin = CreateVerificationPin(
            user.Id,
            VerificationPinPurpose.PasswordReset,
            pendingEmail: null,
            rawPin,
            nowUtc.AddMinutes(pinExpiryMinutes));

        await _authRepository.AddPasswordResetPinAsync(pin, cancellationToken);

        try
        {
            await _authRepository.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(
                ex,
                "Concurrency issue while inserting a new password reset PIN for user {UserId}. New PIN id: {PinId}.",
                user.Id,
                pin.Id);
            throw new InvalidOperationException("Could not create a password reset PIN right now.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not persist password reset PIN for user {UserId}.", user.Id);
            return;
        }

        try
        {
            await _emailService.SendEmailAsync(new EmailMessage
            {
                ToEmail = email,
                Subject = "Password Reset PIN",
                Html = BuildPasswordResetPinHtml(rawPin, pinExpiryMinutes),
            }, cancellationToken);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset PIN email for user {UserId}.", user.Id);
        }
    }

    public async Task<CurrentUserResponse> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await LoadUserForProfileAsync(userId, cancellationToken);
        await EnsureStoredNamePartsAsync(user);
        var roles = await _userManager.GetRolesAsync(user);
        return AuthUserProfileMapper.ToCurrentUserResponse(user, roles);
    }

    public async Task<AccountProfileResponse> GetProfileAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await LoadUserForProfileAsync(userId, cancellationToken);
        await EnsureStoredNamePartsAsync(user);
        var roles = await _userManager.GetRolesAsync(user);
        return AuthUserProfileMapper.ToAccountProfileResponse(user, roles);
    }

    public async Task<AccountProfileResponse> UpdateProfileAsync(Guid userId, UpdateAccountProfileRequest request, CancellationToken cancellationToken)
    {
        var user = await LoadUserForProfileAsync(userId, cancellationToken);
        var roles = await _userManager.GetRolesAsync(user);

        user.FirstName = NullIfEmpty(_sanitizer.Sanitize(request.FirstName));
        user.LastName = NullIfEmpty(_sanitizer.Sanitize(request.LastName));

        SyncJobSeekerProfile(user, roles);

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new ArgumentException(result.Errors.FirstOrDefault()?.Description ?? "Could not update your profile.");
        }

        return AuthUserProfileMapper.ToAccountProfileResponse(user, roles);
    }

    public async Task RequestEmailChangePinAsync(Guid userId, RequestEmailChangePinRequest request, CancellationToken cancellationToken)
    {
        var user = await LoadUserForProfileAsync(userId, cancellationToken);
        var newEmail = _sanitizer.SanitizeEmail(request.NewEmail);
        var confirmEmail = _sanitizer.SanitizeEmail(request.ConfirmEmail);

        ValidateRequestedEmailChange(user, newEmail, confirmEmail);
        await EnsureEmailAvailableAsync(newEmail, userId);

        InvalidateActivePins(user, VerificationPinPurpose.EmailChange);

        var rawPin = GeneratePin();
        var pin = CreateVerificationPin(user.Id, VerificationPinPurpose.EmailChange, newEmail, rawPin, _dateTimeProvider.UtcNow.AddMinutes(10));

        user.PasswordResetPins.Add(pin);

        try
        {
            await _authRepository.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Could not persist email change PIN for user {UserId}.", user.Id);
            throw new ArgumentException("Could not start the email change flow.");
        }

        try
        {
            await _emailService.SendEmailAsync(new EmailMessage
            {
                ToEmail = newEmail,
                Subject = "Verify your Nexskill email change",
                Html = BuildEmailChangePinHtml(rawPin),
            }, cancellationToken);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email change PIN for user {UserId}.", user.Id);
            throw new InvalidOperationException("Could not send a verification PIN right now.");
        }
    }

    public async Task VerifyEmailChangePinAsync(Guid userId, VerifyEmailChangePinRequest request, CancellationToken cancellationToken)
    {
        var user = await LoadUserForProfileAsync(userId, cancellationToken);
        var email = _sanitizer.SanitizeEmail(request.NewEmail);
        var pinValue = _sanitizer.Sanitize(request.Pin);

        var pin = FindLatestMatchingPin(user, VerificationPinPurpose.EmailChange, email, pinValue);
        if (pin is null || pin.Used)
        {
            throw new ArgumentException("The verification PIN is invalid.");
        }

        if (pin.ExpiresAtUtc <= _dateTimeProvider.UtcNow)
        {
            throw new ArgumentException("The verification PIN has expired. Please request a new code.");
        }

        await EnsureEmailAvailableAsync(email, userId);

        if (!pin.VerifiedAtUtc.HasValue)
        {
            pin.VerifiedAtUtc = _dateTimeProvider.UtcNow;
            try
            {
                await _authRepository.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Could not persist email PIN verification for user {UserId}.", user.Id);
                throw new ArgumentException("Could not verify the email PIN.");
            }
        }
    }

    public async Task<AccountProfileResponse> FinalizeEmailChangeAsync(Guid userId, FinalizeEmailChangeRequest request, CancellationToken cancellationToken)
    {
        var user = await LoadUserForProfileAsync(userId, cancellationToken);
        var roles = await _userManager.GetRolesAsync(user);
        var email = _sanitizer.SanitizeEmail(request.NewEmail);
        var pinValue = _sanitizer.Sanitize(request.Pin);

        var pin = FindLatestMatchingPin(user, VerificationPinPurpose.EmailChange, email, pinValue);
        if (pin is null || pin.Used)
        {
            throw new ArgumentException("The verification PIN is invalid.");
        }

        if (pin.ExpiresAtUtc <= _dateTimeProvider.UtcNow)
        {
            throw new ArgumentException("The verification PIN has expired. Please request a new code.");
        }

        if (!pin.VerifiedAtUtc.HasValue)
        {
            throw new ArgumentException("Verify the PIN before updating your email.");
        }

        await EnsureEmailAvailableAsync(email, userId);

        user.Email = email;
        user.UserName = email;
        user.NormalizedEmail = email.ToUpperInvariant();
        user.NormalizedUserName = email.ToUpperInvariant();
        user.EmailConfirmed = true;

        pin.Used = true;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new ArgumentException(result.Errors.FirstOrDefault()?.Description ?? "Could not update your email address.");
        }

        return AuthUserProfileMapper.ToAccountProfileResponse(user, roles);
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

    public async Task VerifyResetPinAsync(VerifyResetPinRequest request, CancellationToken cancellationToken)
    {
        var email = _sanitizer.SanitizeEmail(request.Email);
        var pinValue = _sanitizer.Sanitize(request.Pin);
        var newPassword = _sanitizer.Sanitize(request.NewPassword);
        var confirmPassword = _sanitizer.Sanitize(request.ConfirmPassword);

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Enter a valid email address.");
        }

        if (string.IsNullOrWhiteSpace(pinValue))
        {
            throw new ArgumentException("Enter the PIN sent to your email.");
        }

        if (!string.Equals(newPassword, confirmPassword, StringComparison.Ordinal))
        {
            throw new ArgumentException("Your password confirmation does not match.");
        }

        var user = await LoadUserByEmailWithPinsAsync(email, cancellationToken)
            ?? throw new ArgumentException("The PIN is invalid or has expired.");

        var pin = FindLatestMatchingPin(user, VerificationPinPurpose.PasswordReset, pendingEmail: null, pinValue);
        if (pin is null || pin.Used || pin.ExpiresAtUtc <= _dateTimeProvider.UtcNow)
        {
            throw new ArgumentException("The PIN is invalid or has expired.");
        }

        var passwordValidation = await ValidatePasswordAsync(user, newPassword);
        if (passwordValidation.Count > 0)
        {
            throw new ArgumentException(passwordValidation[0]);
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        if (!result.Succeeded)
        {
            throw new ArgumentException(result.Errors.FirstOrDefault()?.Description ?? "Could not reset password.");
        }

        pin.Used = true;
        pin.VerifiedAtUtc = _dateTimeProvider.UtcNow;

        foreach (var existingPin in user.PasswordResetPins.Where(existingPin =>
                     existingPin.Id != pin.Id &&
                     existingPin.Purpose == VerificationPinPurpose.PasswordReset &&
                     !existingPin.Used))
        {
            existingPin.Used = true;
        }

        try
        {
            await _authRepository.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Could not finalize password reset PIN state for user {UserId}.", user.Id);
            throw new ArgumentException("Could not finalize password reset.");
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

        if (string.IsNullOrWhiteSpace(currentPassword))
        {
            throw new ArgumentException("Current password is required.");
        }

        if (string.IsNullOrWhiteSpace(newPassword))
        {
            throw new ArgumentException("New password is required.");
        }

        var passwordValidation = await ValidatePasswordAsync(user, newPassword);
        if (passwordValidation.Count > 0)
        {
            throw new ArgumentException(passwordValidation[0]);
        }

        var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        if (!result.Succeeded)
        {
            throw new ArgumentException(MapChangePasswordError(result));
        }
    }

    private async Task<AuthResult> CreateSuccessAuthResultAsync(AppUser user, string message, CancellationToken cancellationToken)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var token = await _tokenService.CreateTokenAsync(user, cancellationToken);
        var refreshToken = await _tokenService.CreateRefreshTokenAsync(user, cancellationToken);
        var profile = AuthUserProfileMapper.ToCurrentUserResponse(user, roles);

        return AuthResult.Success(
            message,
            token,
            refreshToken,
            user.Email,
            user.Id.ToString(),
            profile.FirstName,
            profile.LastName,
            roles.ToArray());
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

    private async Task<AppUser> LoadUserForProfileAsync(Guid userId, CancellationToken cancellationToken)
        => await _userManager.Users
            .Include(user => user.JobSeekerProfile)
            .Include(user => user.PasswordResetPins)
            .FirstOrDefaultAsync(user => user.Id == userId, cancellationToken)
           ?? throw new ArgumentException("Unable to find the current account.");

    private Task<AppUser?> LoadUserByEmailWithPinsAsync(string email, CancellationToken cancellationToken)
        => _userManager.Users
            .Include(user => user.PasswordResetPins)
            .FirstOrDefaultAsync(
                user => user.NormalizedEmail == email.ToUpperInvariant(),
                cancellationToken);

    private static string? NullIfEmpty(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static void ValidateRequestedEmailChange(AppUser user, string newEmail, string confirmEmail)
    {
        if (string.IsNullOrWhiteSpace(newEmail))
        {
            throw new ArgumentException("Enter a valid new email address.");
        }

        if (!new EmailAddressAttribute().IsValid(newEmail))
        {
            throw new ArgumentException("Enter a valid new email address.");
        }

        if (!string.Equals(newEmail, confirmEmail, StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Email confirmation does not match.");
        }

        if (string.Equals(user.Email, newEmail, StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Use a different email address from your current one.");
        }
    }

    private async Task EnsureEmailAvailableAsync(string email, Guid currentUserId)
    {
        var existing = await _userManager.FindByEmailAsync(email);
        if (existing is not null && existing.Id != currentUserId)
        {
            throw new ArgumentException("That email address is already in use.");
        }
    }

    private static PasswordResetPinEntity CreateVerificationPin(
        Guid userId,
        VerificationPinPurpose purpose,
        string? pendingEmail,
        string rawPin,
        DateTime expiresAtUtc)
    {
        var saltBytes = RandomNumberGenerator.GetBytes(32);

        return new PasswordResetPinEntity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PinHash = HashPin(rawPin, saltBytes),
            PinSalt = Convert.ToBase64String(saltBytes),
            PendingEmail = pendingEmail,
            Purpose = purpose,
            ExpiresAtUtc = expiresAtUtc,
            Used = false,
        };
    }

    private static void InvalidateActivePins(AppUser user, VerificationPinPurpose purpose)
    {
        foreach (var existingPin in user.PasswordResetPins.Where(pin => !pin.Used && pin.Purpose == purpose))
        {
            existingPin.Used = true;
        }
    }

    private static string GeneratePin()
        => RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");

    private static PasswordResetPinEntity? FindLatestMatchingPin(
        AppUser user,
        VerificationPinPurpose purpose,
        string? pendingEmail,
        string pin)
        => user.PasswordResetPins
            .Where(existingPin =>
                existingPin.Purpose == purpose &&
                (pendingEmail is null || string.Equals(existingPin.PendingEmail, pendingEmail, StringComparison.OrdinalIgnoreCase)) &&
                VerifyPin(existingPin, pin))
            .OrderByDescending(existingPin => existingPin.CreatedAtUtc)
            .FirstOrDefault();

    private static bool VerifyPin(PasswordResetPinEntity storedPin, string candidatePin)
    {
        if (string.IsNullOrWhiteSpace(candidatePin) || string.IsNullOrWhiteSpace(storedPin.PinHash) || string.IsNullOrWhiteSpace(storedPin.PinSalt))
        {
            return false;
        }

        byte[] saltBytes;
        try
        {
            saltBytes = Convert.FromBase64String(storedPin.PinSalt);
        }
        catch (FormatException)
        {
            return false;
        }

        var candidateHash = HashPin(candidatePin, saltBytes);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(candidateHash),
            Encoding.UTF8.GetBytes(storedPin.PinHash));
    }

    private static string HashPin(string pin, byte[] saltBytes)
    {
        var hashBytes = Rfc2898DeriveBytes.Pbkdf2(pin, saltBytes, 10_000, HashAlgorithmName.SHA256, 32);
        return Convert.ToBase64String(hashBytes);
    }

    private static string? CombineName(string? firstName, string? lastName)
    {
        var parts = new[] { NullIfEmpty(firstName), NullIfEmpty(lastName) }
            .Where(part => !string.IsNullOrWhiteSpace(part));

        var combined = string.Join(' ', parts);
        return string.IsNullOrWhiteSpace(combined) ? null : combined;
    }

    private static string BuildEmailChangePinHtml(string pin)
        => $"""
            <p>We received a request to update your Nexskill email address.</p>
            <p>Your verification PIN is <strong>{WebUtility.HtmlEncode(pin)}</strong>.</p>
            <p>This PIN expires in 10 minutes. If you did not request this change, you can ignore this email.</p>
            """;

    private static string BuildPasswordResetPinHtml(string pin, int expiresInMinutes)
        => $"""
            <p>We received a request to reset your Nexskill password.</p>
            <p>Your password reset PIN is <strong>{WebUtility.HtmlEncode(pin)}</strong>.</p>
            <p>This PIN expires in {expiresInMinutes} minutes. If you did not request this change, you can ignore this email.</p>
            """;

    private static void SyncJobSeekerProfile(AppUser user, IEnumerable<string> roles)
    {
        var isJobSeeker = roles.Any(role => role.Equals("JobSeeker", StringComparison.OrdinalIgnoreCase));
        if (!isJobSeeker)
        {
            return;
        }

        user.JobSeekerProfile ??= new JobSeekerProfileEntity
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
        };

        user.JobSeekerProfile.FullName = CombineName(user.FirstName, user.LastName);
        user.JobSeekerProfile.Location = user.Location;
        user.JobSeekerProfile.UpdatedAtUtc = DateTime.UtcNow;
    }

    private async Task EnsureStoredNamePartsAsync(AppUser user)
    {
        var profileFullName = NullIfEmpty(user.JobSeekerProfile?.FullName);
        if (profileFullName is null)
        {
            return;
        }

        var storedFirstName = NullIfEmpty(user.FirstName);
        var storedLastName = NullIfEmpty(user.LastName);
        if (storedFirstName is not null && storedLastName is not null)
        {
            return;
        }

        var (profileFirstName, profileLastName) = SplitFullName(profileFullName);
        var nextFirstName = storedFirstName ?? profileFirstName;
        var nextLastName = storedLastName ?? profileLastName;

        if (nextFirstName == storedFirstName && nextLastName == storedLastName)
        {
            return;
        }

        user.FirstName = nextFirstName;
        user.LastName = nextLastName;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new ArgumentException(result.Errors.FirstOrDefault()?.Description ?? "Could not sync your profile name.");
        }
    }

    private static (string? FirstName, string? LastName) SplitFullName(string? fullName)
    {
        var normalizedFullName = NullIfEmpty(fullName);
        if (normalizedFullName is null)
        {
            return (null, null);
        }

        var parts = normalizedFullName
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        if (parts.Length == 0)
        {
            return (null, null);
        }

        if (parts.Length == 1)
        {
            return (parts[0], null);
        }

        return (parts[0], string.Join(' ', parts.Skip(1)));
    }

    private static string MapChangePasswordError(IdentityResult result)
    {
        var invalidCurrentPasswordError = result.Errors.FirstOrDefault(error =>
            string.Equals(error.Code, "PasswordMismatch", StringComparison.OrdinalIgnoreCase));
        if (invalidCurrentPasswordError is not null)
        {
            return "Your current password is incorrect.";
        }

        var validationError = result.Errors.FirstOrDefault(error =>
            string.Equals(error.Code, "PasswordTooShort", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(error.Code, "PasswordRequiresNonAlphanumeric", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(error.Code, "PasswordRequiresDigit", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(error.Code, "PasswordRequiresLower", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(error.Code, "PasswordRequiresUpper", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(error.Code, "PasswordRequiresUniqueChars", StringComparison.OrdinalIgnoreCase));
        if (validationError is not null)
        {
            return validationError.Description;
        }

        return result.Errors.FirstOrDefault()?.Description ?? "Could not change password.";
    }
}
