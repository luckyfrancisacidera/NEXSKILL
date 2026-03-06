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
      public Task<string> CreateRefreshTokenAsync(AppUser user, CancellationToken cancellationToken)
    {
        var key = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Missing Jwt:Key");

        var issuer = _configuration["Jwt:Issuer"] ?? "SkillSense";
        var audience = _configuration["Jwt:Audience"] ?? "SkillSense.Client";
        var expiryDays = int.TryParse(
            _configuration["Jwt:RefreshTokenExpiryDays"],
            out var days) ? days : 7;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new("token_type", "refresh"),
        };

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Issuer = issuer,
            Audience = audience,
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(expiryDays),
            SigningCredentials = credentials
        };

        var handler = new JsonWebTokenHandler();
        var token = handler.CreateToken(tokenDescriptor);
        return Task.FromResult(token);
    }

    public async Task<Guid?> ValidateRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken)
    {
        var key = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Missing Jwt:Key");
        var issuer = _configuration["Jwt:Issuer"] ?? "SkillSense";
        var audience = _configuration["Jwt:Audience"] ?? "SkillSense.Client";

        var handler = new JsonWebTokenHandler();
        var validationResult = await handler.ValidateTokenAsync(refreshToken, new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateAudience = true,
            ValidAudience = audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
        });

        if (!validationResult.IsValid || validationResult.ClaimsIdentity is null)
        {
            return null;
        }

        var tokenType = validationResult.ClaimsIdentity.FindFirst("token_type")?.Value;
        if (!string.Equals(tokenType, "refresh", StringComparison.Ordinal))
        {
            return null;
        }

        var sub = validationResult.ClaimsIdentity.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (!Guid.TryParse(sub, out var userId))
        {
            return null;
        }

        return null;
    }
}
