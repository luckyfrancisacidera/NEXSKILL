using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SkillSense.Application.Contracts.Auth;
using SkillSense.Application.Interfaces.Auth;

namespace SkillSense.Api.Controllers;

[Route("api/auth")]
[ApiController]
public sealed class AuthController(IAuthService authService, IConfiguration configuration) : ControllerBase
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
        return Ok(new { message = result.Message, user = new { result.Email, result.UserId, roles = result.Roles } });
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("access_token", new CookieOptions { Path = "/" });
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
}
