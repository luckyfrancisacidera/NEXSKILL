using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SkillSense.Api.Security;
using SkillSense.Application.Common;
using SkillSense.Application.Contracts.Auth;
using SkillSense.Application.Interfaces.Auth;

namespace SkillSense.Api.Controllers;

/* =========================================
   AUTH CONTROLLER
   Exposes authentication, session bootstrap, profile, and password recovery endpoints.
========================================= */

[Route("api/auth")]
[ApiController]
public sealed class AuthController(
    IAuthService authService,
    IConfiguration configuration) : ControllerBase
{
    private readonly IAuthService _authService = authService;
    private readonly IConfiguration _configuration = configuration;

    /* =========================================
       SESSION ENTRYPOINTS
    ========================================= */

    // Handles register.
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterJobSeekerRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterJobSeekerAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = result.Message, errors = result.Errors });
        }

        WriteAccessCookie(result.Token!, result.IsPersistent);
        WriteRefreshCookie(result.RefreshToken!, result.IsPersistent);
        return Ok(new
        {
            message = result.Message,
            user = new
            {
                result.Email,
                result.UserId,
                first_name = result.FirstName,
                last_name = result.LastName,
                roles = result.Roles
            }
        });
    }

    // Authenticates the current user.
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

        WriteAccessCookie(result.Token!, result.IsPersistent);
        WriteRefreshCookie(result.RefreshToken!, result.IsPersistent);
        return Ok(new
        {
            message = result.Message,
            user = new
            {
                result.Email,
                result.UserId,
                first_name = result.FirstName,
                last_name = result.LastName,
                roles = result.Roles
            }
        });
    }

    // Refreshes the current session.
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

        WriteAccessCookie(result.Token!, result.IsPersistent);
        WriteRefreshCookie(result.RefreshToken!, result.IsPersistent);

        return Ok(new { message = result.Message });
    }

    // Requests password reset.
    [HttpPost("request-password-reset")]
    [AllowAnonymous]
    public async Task<IActionResult> RequestPasswordReset([FromBody] RequestPasswordResetRequest request, CancellationToken cancellationToken)
    {
        await _authService.RequestPasswordResetAsync(request, cancellationToken);
        return Ok(new { message = "If an account exists for that email, a reset link has been sent." });
    }

    // Requests password reset pin.
    [HttpPost("request-password-reset-pin")]
    [AllowAnonymous]
    [EnableRateLimiting("password-reset-request")]
    public async Task<IActionResult> RequestPasswordResetPin([FromBody] RequestPasswordResetPinRequest request, CancellationToken cancellationToken)
    {
        await _authService.RequestPasswordResetPinAsync(request, cancellationToken);
        return Ok(new { message = "If an account with that email exists, a PIN has been sent." });
    }

    /* =========================================
       PROFILE AND EMAIL MANAGEMENT
    ========================================= */

    // Loads profile.
    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        var profile = await _authService.GetProfileAsync(CurrentUserContext.GetUserId(User), cancellationToken);
        return Ok(profile);
    }

    // Updates profile.
    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateAccountProfileRequest request, CancellationToken cancellationToken)
    {
        var profile = await _authService.UpdateProfileAsync(CurrentUserContext.GetUserId(User), request, cancellationToken);
        return Ok(profile);
    }

    // Requests email change pin.
    [HttpPost("request-email-change-pin")]
    [Authorize]
    public async Task<IActionResult> RequestEmailChangePin([FromBody] RequestEmailChangePinRequest request, CancellationToken cancellationToken)
    {
        await _authService.RequestEmailChangePinAsync(CurrentUserContext.GetUserId(User), request, cancellationToken);
        return Ok(new { message = "Verification PIN sent to the new email address." });
    }

    // Verifies email change pin.
    [HttpPost("verify-email-change-pin")]
    [Authorize]
    public async Task<IActionResult> VerifyEmailChangePin([FromBody] VerifyEmailChangePinRequest request, CancellationToken cancellationToken)
    {
        await _authService.VerifyEmailChangePinAsync(CurrentUserContext.GetUserId(User), request, cancellationToken);
        return Ok(new { message = "Verification PIN confirmed." });
    }

    // Finalizes email change.
    [HttpPost("finalize-email-change")]
    [Authorize]
    public async Task<IActionResult> FinalizeEmailChange([FromBody] FinalizeEmailChangeRequest request, CancellationToken cancellationToken)
    {
        var profile = await _authService.FinalizeEmailChangeAsync(CurrentUserContext.GetUserId(User), request, cancellationToken);
        return Ok(profile);
    }

    /* =========================================
       PASSWORD RECOVERY
    ========================================= */

    // Validates password reset token.
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

    // Resets password.
    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        await _authService.ResetPasswordAsync(request, cancellationToken);
        return Ok(new { message = "Password reset successful." });
    }

    // Verifies reset pin.
    [HttpPost("verify-reset-pin")]
    [AllowAnonymous]
    [EnableRateLimiting("password-reset-verify")]
    public async Task<IActionResult> VerifyResetPin([FromBody] VerifyResetPinRequest request, CancellationToken cancellationToken)
    {
        await _authService.VerifyResetPinAsync(request, cancellationToken);
        return Ok(new { message = "Password reset successful." });
    }

    // Changes password.
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        await _authService.ChangePasswordAsync(CurrentUserContext.GetUserId(User), request, cancellationToken);
        return Ok(new { message = "Password updated successfully." });
    }

    /* =========================================
       SESSION BOOTSTRAP
    ========================================= */

    // Clears the current authenticated session.
    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("access_token", BuildCookieDeletionOptions());
        Response.Cookies.Delete("refresh_token", BuildCookieDeletionOptions());
        return Ok(new { message = "Logout successful." });
    }

    // Loads the current authenticated user payload.
    [HttpGet("me")]
    [AllowAnonymous]
    public async Task<ActionResult<CurrentUserResponse>> Me(CancellationToken cancellationToken)
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            return Ok(CurrentUserResponse.Unauthenticated());
        }

        // Rebuild the response from claims on every request so the client receives
        // the same active company/profile context that authorization is using server-side.
        var currentUser = await _authService.GetCurrentUserAsync(CurrentUserContext.GetUserId(User), cancellationToken);
        var companyIds = User.Claims
            .Where(claim => claim.Type == SkillSenseClaimTypes.CompanyIds)
            .Select(claim => claim.Value)
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        var recruiterProfileIds = User.Claims
            .Where(claim => claim.Type == SkillSenseClaimTypes.RecruiterProfileIds)
            .Select(claim => claim.Value)
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        currentUser = new CurrentUserResponse
        {
            IsAuthenticated = currentUser.IsAuthenticated,
            UserId = currentUser.UserId,
            Email = currentUser.Email,
            FirstName = currentUser.FirstName,
            LastName = currentUser.LastName,
            Role = currentUser.Role,
            Roles = currentUser.Roles,
            ActiveCompanyId = User.FindFirst(SkillSenseClaimTypes.ActiveCompanyId)?.Value,
            ActiveRecruiterProfileId = User.FindFirst(SkillSenseClaimTypes.ActiveRecruiterProfileId)?.Value,
            CompanyIds = companyIds,
            RecruiterProfileIds = recruiterProfileIds,
        };

        return Ok(currentUser);
    }

    /* =========================================
       COOKIE HELPERS
    ========================================= */

    // Writes access cookie.
    private void WriteAccessCookie(string token, bool isPersistent)
    {
        // Persistent sessions should honor configured expiry, while non-persistent
        // sessions fall back to browser-session cookies for safer shared-device behavior.
        var expiryMinutes = int.TryParse(_configuration["Jwt:AccessTokenExpiryMinutes"], out var minutes) ? minutes : 30;
        var options = BuildCookieOptions();

        if (isPersistent)
        {
            options.Expires = DateTimeOffset.UtcNow.AddMinutes(expiryMinutes);
        }

        Response.Cookies.Append("access_token", token, options);
    }

    // Writes refresh cookie.
    private void WriteRefreshCookie(string token, bool isPersistent)
    {
        var expiryDays = int.TryParse(_configuration["Jwt:RefreshTokenExpiryDays"], out var days) ? days : 7;
        var options = BuildCookieOptions();

        if (isPersistent)
        {
            options.Expires = DateTimeOffset.UtcNow.AddDays(expiryDays);
        }

        Response.Cookies.Append("refresh_token", token, options);
    }

    // Builds cookie options.
    private CookieOptions BuildCookieOptions()
    {
        var environment = HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();
        var configuredDomain = _configuration["AuthCookies:Domain"]?.Trim();
        var sameSite = ParseSameSite(
            _configuration["AuthCookies:SameSite"],
            environment.IsProduction() ? SameSiteMode.None : SameSiteMode.Lax);
        var secure = bool.TryParse(_configuration["AuthCookies:Secure"], out var configuredSecure)
            ? configuredSecure
            : environment.IsProduction();

        var options = new CookieOptions
        {
            HttpOnly = true,
            Secure = secure,
            SameSite = sameSite,
            Path = "/",
            IsEssential = true,
        };

        if (!string.IsNullOrWhiteSpace(configuredDomain))
        {
            options.Domain = configuredDomain;
        }

        return options;
    }

    // Builds cookie deletion options.
    private CookieOptions BuildCookieDeletionOptions()
    {
        var cookieOptions = BuildCookieOptions();
        cookieOptions.Expires = DateTimeOffset.UnixEpoch;
        return cookieOptions;
    }

    // Parses same site.
    private static SameSiteMode ParseSameSite(string? configuredValue, SameSiteMode fallback)
    {
        if (string.IsNullOrWhiteSpace(configuredValue))
        {
            return fallback;
        }

        return configuredValue.Trim().ToLowerInvariant() switch
        {
            "none" => SameSiteMode.None,
            "strict" => SameSiteMode.Strict,
            "lax" => SameSiteMode.Lax,
            "unspecified" => SameSiteMode.Unspecified,
            _ => fallback,
        };
    }
}
