using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using SkillSense.Application.Interfaces.Auth;
using SkillSense.Domain.Entities;

namespace SkillSense.Infrastructure.Auth;

public sealed class JwtTokenService(
    IConfiguration configuration,
    UserManager<AppUser> userManager) : ITokenService
{
    private readonly IConfiguration _configuration = configuration;
    private readonly UserManager<AppUser> _userManager = userManager;

    public async Task<string> CreateTokenAsync(AppUser user, CancellationToken cancellationToken)
    {
        var key = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Missing Jwt:Key");

        var issuer = _configuration["Jwt:Issuer"] ?? "SkillSense";
        var audience = _configuration["Jwt:Audience"] ?? "SkillSense.Client";
        var expiryMinutes = int.TryParse(
            _configuration["Jwt:AccessTokenExpiryMinutes"],
            out var minutes) ? minutes : 30;

        var roles = await _userManager.GetRolesAsync(user);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new("userId", user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Issuer = issuer,
            Audience = audience,
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
            SigningCredentials = credentials
        };

        var handler = new JsonWebTokenHandler();
        var token = handler.CreateToken(tokenDescriptor);

        return token;
    }
}