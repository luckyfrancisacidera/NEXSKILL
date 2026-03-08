using SkillSense.Application.Contracts.Auth;

namespace SkillSense.Application.Interfaces.Auth;

public interface IAuthService
{
    Task<AuthResult> RegisterJobSeekerAsync(RegisterJobSeekerRequest request, CancellationToken cancellationToken);
    Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<AuthResult> CreatePrivilegedUserAsync(CreatePrivilegedUserRequest request, CancellationToken cancellationToken);
    Task RequestPasswordResetAsync(RequestPasswordResetRequest request, CancellationToken cancellationToken);
    Task<bool> VerifyResetPinAsync(VerifyResetPinRequest request, CancellationToken cancellationToken);
    Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken);
}
