using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSense.Api.Security;
using SkillSense.Application.Contracts.Admin.Request;
using SkillSense.Application.Contracts.Admin.Response;
using SkillSense.Application.Contracts.Auth;
using SkillSense.Application.Contracts.Employees;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;
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
    public async Task<ActionResult<SuperAdminDashboardResponse>> GetSuperAdminDashboard(
        [FromQuery] int companiesPage = 1,
        [FromQuery] int companyAdminsPage = 1,
        [FromQuery] int recruitersPage = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
        => Ok(await _adminManagementService.GetSuperAdminDashboardAsync(
            companiesPage,
            companyAdminsPage,
            recruitersPage,
            pageSize,
            cancellationToken));

    [HttpPost("super/companies")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<AdminCompanyAccountResponse>> CreateCompanyAccount([FromBody] CreateCompanyAccountRequest request, CancellationToken cancellationToken)
    {
        var result = await _adminManagementService.CreateCompanyAccountAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetSuperAdminDashboard), new { }, result);
    }

    [HttpPost("super/companies/{companyId:guid}/activate")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> ActivateCompany(Guid companyId, CancellationToken cancellationToken)
    {
        await _adminManagementService.ActivateCompanyAsync(companyId, cancellationToken);
        return NoContent();
    }

    [HttpPost("super/companies/{companyId:guid}/deactivate")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> DeactivateCompany(Guid companyId, CancellationToken cancellationToken)
    {
        await _adminManagementService.DeactivateCompanyAsync(companyId, cancellationToken);
        return NoContent();
    }

    [HttpPost("super/company-admins/{adminUserId:guid}/activate")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> ActivateCompanyAdmin(Guid adminUserId, CancellationToken cancellationToken)
    {
        await _adminManagementService.ActivateCompanyAdminAsync(adminUserId, cancellationToken);
        return NoContent();
    }

    [HttpPost("super/company-admins/{adminUserId:guid}/deactivate")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> DeactivateCompanyAdmin(Guid adminUserId, CancellationToken cancellationToken)
    {
        await _adminManagementService.DeactivateCompanyAdminAsync(adminUserId, cancellationToken);
        return NoContent();
    }

    [HttpPost("super/recruiters/{recruiterUserId:guid}/activate")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> ActivateRecruiter(Guid recruiterUserId, CancellationToken cancellationToken)
    {
        await _adminManagementService.ActivateRecruiterAsync(recruiterUserId, cancellationToken);
        return NoContent();
    }

    [HttpPost("super/recruiters/{recruiterUserId:guid}/deactivate")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> DeactivateRecruiterBySuperAdmin(Guid recruiterUserId, CancellationToken cancellationToken)
    {
        await _adminManagementService.DeactivateRecruiterAsync(recruiterUserId, cancellationToken);
        return NoContent();
    }

    [HttpGet("company/dashboard")]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<ActionResult<CompanyAdminDashboardResponse>> GetCompanyAdminDashboard(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");

        return Ok(await _adminManagementService.GetCompanyAdminDashboardAsync(userId, companyId, page, pageSize, cancellationToken));
    }

    [HttpGet("company/employees")]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<ActionResult<PagedResult<EmployeeRecordResponse>>> GetCompanyEmployees(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");

        return Ok(await _adminManagementService.GetCompanyEmployeesAsync(userId, companyId, page, pageSize, search, cancellationToken));
    }

    [HttpGet("company/applicants/{submissionId:guid}")]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<ActionResult<ApplicantDetailResponse>> GetCompanyApplicantBySubmission(
        Guid submissionId,
        CancellationToken cancellationToken = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");

        var item = await _adminManagementService.GetCompanyApplicantBySubmissionIdAsync(userId, companyId, submissionId, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpGet("company/applicants/{submissionId:guid}/resume/download")]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<ActionResult<ApplicantResumeDownloadResponse>> GetCompanyApplicantResumeDownload(
        Guid submissionId,
        CancellationToken cancellationToken = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");

        var result = await _adminManagementService.GetCompanyApplicantResumeAccessAsync(userId, companyId, submissionId, cancellationToken);
        return Ok(new ApplicantResumeDownloadResponse
        {
            DownloadUrl = result.DownloadUrl ?? string.Empty,
            FileName = result.FileName,
        });
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

    [HttpPost("company/recruiters/{recruiterUserId:guid}/activate")]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<IActionResult> ActivateCompanyRecruiter(Guid recruiterUserId, CancellationToken cancellationToken)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        await _adminManagementService.ActivateRecruiterAsync(userId, companyId, recruiterUserId, cancellationToken);
        return NoContent();
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
