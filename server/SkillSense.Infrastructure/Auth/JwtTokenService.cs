using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using SkillSense.Application.Common;
using SkillSense.Application.Interfaces.Auth;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;

namespace SkillSense.Infrastructure.Auth;

public sealed class JwtTokenService(
    IConfiguration configuration,
    UserManager<AppUser> userManager,
    SkillSenseDbContext dbContext) : ITokenService
{
    private readonly IConfiguration _configuration = configuration;
    private readonly UserManager<AppUser> _userManager = userManager;
    private readonly SkillSenseDbContext _dbContext = dbContext;

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
            new(SkillSenseClaimTypes.UserId, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        claims.AddRange(await BuildContextClaimsAsync(user, roles.ToArray(), cancellationToken));

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

    private async Task<IReadOnlyCollection<Claim>> BuildContextClaimsAsync(
        AppUser user,
        IReadOnlyCollection<string> roles,
        CancellationToken cancellationToken)
    {
        var recruiterProfiles = await _dbContext.RecruiterProfiles
            .AsNoTracking()
            .Where(profile => profile.UserId == user.Id)
            .Select(profile => new { profile.Id, profile.CompanyId })
            .ToListAsync(cancellationToken);

        var adminCompanyIds = await _dbContext.AdminProfiles
            .AsNoTracking()
            .Where(profile => profile.UserId == user.Id && profile.CompanyId.HasValue && profile.CompanyId != Guid.Empty)
            .Select(profile => profile.CompanyId!.Value)
            .Distinct()
            .ToListAsync(cancellationToken);

        var recruiterCompanyIds = recruiterProfiles
            .Where(profile => profile.CompanyId != Guid.Empty)
            .Select(profile => profile.CompanyId);

        var companyIds = recruiterCompanyIds
            .Concat(adminCompanyIds)
            .Distinct()
            .ToList();

        Guid? activeRecruiterProfileId = recruiterProfiles
            .Select(profile => (Guid?)profile.Id)
            .FirstOrDefault();

        Guid? activeCompanyId = null;
        if (roles.Any(role => string.Equals(role, "Recruiter", StringComparison.OrdinalIgnoreCase)))
        {
            activeCompanyId = recruiterProfiles
                .Where(profile => profile.CompanyId != Guid.Empty)
                .Select(profile => (Guid?)profile.CompanyId)
                .FirstOrDefault();
        }

        activeCompanyId ??= adminCompanyIds
            .Select(companyId => (Guid?)companyId)
            .FirstOrDefault();

        var claims = new List<Claim>();

        if (activeCompanyId.HasValue)
        {
            claims.Add(new Claim(SkillSenseClaimTypes.ActiveCompanyId, activeCompanyId.Value.ToString()));
        }

        if (activeRecruiterProfileId.HasValue)
        {
            claims.Add(new Claim(SkillSenseClaimTypes.ActiveRecruiterProfileId, activeRecruiterProfileId.Value.ToString()));
        }

        claims.AddRange(companyIds.Select(companyId => new Claim(SkillSenseClaimTypes.CompanyIds, companyId.ToString())));
        claims.AddRange(recruiterProfiles.Select(profile => new Claim(SkillSenseClaimTypes.RecruiterProfileIds, profile.Id.ToString())));

        return claims;
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
