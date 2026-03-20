using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SkillSense.Api.Security;
using SkillSense.Application.Common;
using SkillSense.Application.Contracts.Auth;
using SkillSense.Application.Interfaces.Auth;

namespace SkillSense.Api.Controllers;

[Route("api/auth")]
[ApiController]
public sealed class AuthController(
    IAuthService authService,
    IConfiguration configuration) : ControllerBase
{
    private readonly IAuthService _authService = authService;
    private readonly IConfiguration _configuration = configuration;

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterJobSeekerRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterJobSeekerAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = result.Message, errors = result.Errors });
        }

        WriteAccessCookie(result.Token!);
        WriteRefreshCookie(result.RefreshToken!);
        return Ok(new { message = result.Message, user = new { result.Email, result.UserId, roles = result.Roles } });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return Unauthorized(new { message = result.Message, errors = result.Errors });
        }

        WriteAccessCookie(result.Token!);
        WriteRefreshCookie(result.RefreshToken!);
        return Ok(new { message = result.Message, user = new { result.Email, result.UserId, roles = result.Roles } });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        if (!Request.Cookies.TryGetValue("refresh_token", out var refreshToken) || string.IsNullOrWhiteSpace(refreshToken))
        {
            return Unauthorized(new { message = "Refresh token is missing." });
        }

        var result = await _authService.RefreshAsync(refreshToken, cancellationToken);
        if (!result.Succeeded)
        {
            return Unauthorized(new { message = result.Message, errors = result.Errors });
        }

        WriteAccessCookie(result.Token!);
        WriteRefreshCookie(result.RefreshToken!);

        return Ok(new { message = result.Message });
    }

    [HttpPost("request-password-reset")]
    [AllowAnonymous]
    public async Task<IActionResult> RequestPasswordReset([FromBody] RequestPasswordResetRequest request, CancellationToken cancellationToken)
    {
        await _authService.RequestPasswordResetAsync(request, cancellationToken);
        return Ok(new { message = "If an account exists for that email, a reset link has been sent." });
    }

    [HttpPost("validate-password-reset-token")]
    [AllowAnonymous]
    public async Task<IActionResult> ValidatePasswordResetToken([FromBody] ValidatePasswordResetTokenRequest request, CancellationToken cancellationToken)
    {
        var valid = await _authService.ValidatePasswordResetTokenAsync(request, cancellationToken);
        if (!valid)
        {
            return BadRequest(new { message = "This password reset link is invalid or has expired." });
        }

        return Ok(new { message = "Password reset link is valid." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        await _authService.ResetPasswordAsync(request, cancellationToken);
        return Ok(new { message = "Password reset successful." });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        await _authService.ChangePasswordAsync(CurrentUserContext.GetUserId(User), request, cancellationToken);
        return Ok(new { message = "Password updated successfully." });
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("access_token", new CookieOptions { Path = "/" });
        Response.Cookies.Delete("refresh_token", new CookieOptions { Path = "/" });
        return Ok(new { message = "Logout successful." });
    }

    [HttpGet("me")]
    [AllowAnonymous]
    public IActionResult Me()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            return Ok(new
            {
                isAuthenticated = false,
                userId = (string?)null,
                email = (string?)null,
                role = (string?)null,
                roles = Array.Empty<string>(),
                activeCompanyId = (Guid?)null,
                activeRecruiterProfileId = (Guid?)null,
                companyIds = Array.Empty<Guid>(),
                recruiterProfileIds = Array.Empty<Guid>(),
            });
        }

        var roles = User.Claims
            .Where(c => c.Type == System.Security.Claims.ClaimTypes.Role)
            .Select(c => c.Value)
            .Distinct()
            .ToArray();

        var companyIds = User.FindAll(SkillSenseClaimTypes.CompanyIds)
            .Select(claim => Guid.TryParse(claim.Value, out var companyId) ? companyId : (Guid?)null)
            .Where(value => value.HasValue)
            .Select(value => value!.Value)
            .Distinct()
            .ToArray();

        var recruiterProfileIds = User.FindAll(SkillSenseClaimTypes.RecruiterProfileIds)
            .Select(claim => Guid.TryParse(claim.Value, out var recruiterProfileId) ? recruiterProfileId : (Guid?)null)
            .Where(value => value.HasValue)
            .Select(value => value!.Value)
            .Distinct()
            .ToArray();

        return Ok(new
        {
            isAuthenticated = true,
            userId = User.FindFirst(SkillSenseClaimTypes.UserId)?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value,
            email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value,
            role = CurrentUserContext.GetRole(User),
            roles,
            activeCompanyId = CurrentUserContext.GetActiveCompanyId(HttpContext),
            activeRecruiterProfileId = CurrentUserContext.GetActiveRecruiterProfileId(HttpContext),
            companyIds,
            recruiterProfileIds,
        });
    }

    private void WriteAccessCookie(string token)
    {
        var isProduction = HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>().IsProduction();
        var expiryMinutes = int.TryParse(_configuration["Jwt:AccessTokenExpiryMinutes"], out var minutes) ? minutes : 30;

        Response.Cookies.Append("access_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = isProduction,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddMinutes(expiryMinutes)
        });
    }

    private void WriteRefreshCookie(string token)
    {
        var isProduction = HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>().IsProduction();
        var expiryDays = int.TryParse(_configuration["Jwt:RefreshTokenExpiryDays"], out var days) ? days : 7;

        Response.Cookies.Append("refresh_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = isProduction,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddDays(expiryDays)
        });
    }
}
