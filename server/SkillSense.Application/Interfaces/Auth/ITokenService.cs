using SkillSense.Domain.Entities;

namespace SkillSense.Application.Interfaces.Auth;

public interface ITokenService
{
    Task<string> CreateTokenAsync(AppUser user, CancellationToken cancellationToken);
    Task<string> CreateRefreshTokenAsync(AppUser user, bool isPersistent, CancellationToken cancellationToken);
    Task<RefreshTokenValidationResult?> ValidateRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken);
}

public sealed record RefreshTokenValidationResult(Guid UserId, bool IsPersistent);
