using SkillSense.Application.Contracts.Auth;

namespace SkillSense.Application.Interfaces.Auth;

/// <summary>
/// Defines authentication, registration, refresh, and password reset operations.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Registers a new job seeker account.
    /// </summary>
    Task<AuthResult> RegisterJobSeekerAsync(RegisterJobSeekerRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Authenticates an existing user.
    /// </summary>
    Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Refreshes an existing authenticated session.
    /// </summary>
    Task<AuthResult> RefreshAsync(string refreshToken, CancellationToken cancellationToken);

    /// <summary>
    /// Determines whether the current authenticated session is still allowed to access protected resources.
    /// </summary>
    Task<bool> IsSessionActiveAsync(Guid userId, CancellationToken cancellationToken);

    /// <summary>
    /// Creates an administrator or recruiter account.
    /// </summary>
    Task<AuthResult> CreatePrivilegedUserAsync(CreatePrivilegedUserRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Starts the password reset flow for an existing account.
    /// </summary>
    Task RequestPasswordResetAsync(RequestPasswordResetRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Starts the PIN-based password reset flow for an existing account.
    /// </summary>
    Task RequestPasswordResetPinAsync(RequestPasswordResetPinRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Returns the authenticated session bootstrap payload for the current user.
    /// </summary>
    Task<CurrentUserResponse> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken);

    /// <summary>
    /// Returns the editable account profile for the authenticated user.
    /// </summary>
    Task<AccountProfileResponse> GetProfileAsync(Guid userId, CancellationToken cancellationToken);

    /// <summary>
    /// Updates editable account profile fields that do not require PIN confirmation.
    /// </summary>
    Task<AccountProfileResponse> UpdateProfileAsync(Guid userId, UpdateAccountProfileRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Sends a verification PIN to the requested new email address.
    /// </summary>
    Task RequestEmailChangePinAsync(Guid userId, RequestEmailChangePinRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Verifies the email-change PIN without finalizing the email update.
    /// </summary>
    Task VerifyEmailChangePinAsync(Guid userId, VerifyEmailChangePinRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Finalizes the email update after the PIN has been verified.
    /// </summary>
    Task<AccountProfileResponse> FinalizeEmailChangeAsync(Guid userId, FinalizeEmailChangeRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Validates a password reset token for a user.
    /// </summary>
    Task<bool> ValidatePasswordResetTokenAsync(ValidatePasswordResetTokenRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Completes a password reset using a validated token.
    /// </summary>
    Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Verifies a password reset PIN and updates the password.
    /// </summary>
    Task VerifyResetPinAsync(VerifyResetPinRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Changes the password for an authenticated user.
    /// </summary>
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken);
}
