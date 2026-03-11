using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSense.Api.Security;
using SkillSense.Application.Contracts.Admin.Request;
using SkillSense.Application.Contracts.Admin.Response;
using SkillSense.Application.Contracts.Auth;
using SkillSense.Application.Interfaces.Admin;
using SkillSense.Application.Interfaces.Auth;

namespace SkillSense.Api.Controllers;

[Route("api/admin")]
[ApiController]
[Authorize(Roles = "Admin,SuperAdmin,CompanyAdmin")]
public sealed class AdminController(
    IAuthService authService,
    IAdminManagementService adminManagementService) : ControllerBase
{
    private readonly IAuthService _authService = authService;
    private readonly IAdminManagementService _adminManagementService = adminManagementService;

    [HttpPost("users")]
    [Authorize(Roles = "Admin,SuperAdmin")]
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

    [HttpGet("super/dashboard")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<SuperAdminDashboardResponse>> GetSuperAdminDashboard(CancellationToken cancellationToken)
        => Ok(await _adminManagementService.GetSuperAdminDashboardAsync(cancellationToken));

    [HttpGet("company/dashboard")]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<ActionResult<CompanyAdminDashboardResponse>> GetCompanyAdminDashboard(CancellationToken cancellationToken)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");

        return Ok(await _adminManagementService.GetCompanyAdminDashboardAsync(userId, companyId, cancellationToken));
    }

    [HttpPost("company/recruiters")]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<ActionResult<AdminRecruiterOverviewResponse>> CreateRecruiter([FromBody] CreateManagedRecruiterRequest request, CancellationToken cancellationToken)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        var recruiter = await _adminManagementService.CreateRecruiterAsync(userId, companyId, request, cancellationToken);
        return CreatedAtAction(nameof(GetCompanyAdminDashboard), new { }, recruiter);
    }

    [HttpPost("company/recruiters/{recruiterUserId:guid}/deactivate")]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<IActionResult> DeactivateRecruiter(Guid recruiterUserId, CancellationToken cancellationToken)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        await _adminManagementService.DeactivateRecruiterAsync(userId, companyId, recruiterUserId, cancellationToken);
        return NoContent();
    }
}
