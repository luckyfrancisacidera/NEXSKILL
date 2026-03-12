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
    /// Verifies the latest password reset PIN for a user.
    /// </summary>
    Task<bool> VerifyResetPinAsync(VerifyResetPinRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Completes a password reset using a validated PIN.
    /// </summary>
    Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken);
}
