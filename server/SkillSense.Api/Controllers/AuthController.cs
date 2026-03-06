using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SkillSense.Application.Contracts.Auth;
using SkillSense.Application.Interfaces.Auth;

namespace SkillSense.Api.Controllers;

[Route("api/auth")]
[ApiController]
public sealed class AuthController(
    IAuthService authService,
    ITokenService tokenService,
    UserManager<SkillSense.Domain.Entities.AppUser> userManager,
    IConfiguration configuration) : ControllerBase
{
    private readonly IAuthService _authService = authService;
    private readonly ITokenService _tokenService = tokenService;
    private readonly UserManager<SkillSense.Domain.Entities.AppUser> _userManager = userManager;
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

        var userId = await _tokenService.ValidateRefreshTokenAsync(refreshToken, cancellationToken);
        if (!userId.HasValue)
        {
            return Unauthorized(new { message = "Invalid refresh token." });
        }

        var user = await _userManager.FindByIdAsync(userId.Value.ToString());
        if (user is null)
        {
            return Unauthorized(new { message = "Invalid refresh token." });
        }

        var accessToken = await _tokenService.CreateTokenAsync(user, cancellationToken);
        var newRefreshToken = await _tokenService.CreateRefreshTokenAsync(user, cancellationToken);

        WriteAccessCookie(accessToken);
        WriteRefreshCookie(newRefreshToken);

        return Ok(new { message = "Token refreshed." });
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
            return Ok(new { isAuthenticated = false, userId = (string?)null, email = (string?)null, roles = Array.Empty<string>() });
        }

        var roles = User.Claims
            .Where(c => c.Type == System.Security.Claims.ClaimTypes.Role)
            .Select(c => c.Value)
            .Distinct()
            .ToArray();

        return Ok(new
        {
            isAuthenticated = true,
            userId = User.FindFirst("userId")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value,
            email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value,
            roles
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
