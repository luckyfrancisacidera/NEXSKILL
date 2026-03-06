using SkillSense.Domain.Entities;

namespace SkillSense.Application.Interfaces.Auth;

public interface ITokenService
{
    Task<string> CreateTokenAsync(AppUser user, CancellationToken cancellationToken);
    Task<string> CreateRefreshTokenAsync(AppUser user, CancellationToken cancellationToken);
    Task<Guid?> ValidateRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken);
}
