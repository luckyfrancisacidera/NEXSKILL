using SkillSense.Domain.Entities;

namespace SkillSense.Application.Interfaces.Auth;

public interface ITokenService
{
    Task<string> CreateTokenAsync(AppUser user, CancellationToken cancellationToken);
}
