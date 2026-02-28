using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSense.Application.Contracts.Auth;
using SkillSense.Application.Interfaces.Auth;

namespace SkillSense.Api.Controllers;

[Route("api/admin")]
[ApiController]
[Authorize(Roles = "Admin")]
public sealed class AdminController(IAuthService authService) : ControllerBase
{
    private readonly IAuthService _authService = authService;

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreatePrivilegedUserRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.CreatePrivilegedUserAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = result.Message, errors = result.Errors });
        }

        return Ok(new
        {
            message = result.Message,
            user = new { result.Email, result.UserId, roles = result.Roles }
        });
    }
}
