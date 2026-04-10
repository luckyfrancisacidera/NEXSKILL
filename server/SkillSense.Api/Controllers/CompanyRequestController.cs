using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillSense.Api.Security;
using SkillSense.Application.Contracts.Company;
using SkillSense.Application.Interfaces.Company;
using SkillSense.Persistence.Data;

namespace SkillSense.Api.Controllers;

[Route("api/company-requests")]
[ApiController]
public sealed class CompanyRequestController(
    ICompanyAccountRequestService companyAccountRequestService,
    ICompanyRequestReviewService companyRequestReviewService,
    ICompanyInvitationService companyInvitationService,
    IRequestDocumentStorageService requestDocumentStorageService,
    SkillSenseDbContext dbContext) : ControllerBase
{
    [HttpPost]
    [AllowAnonymous]
    [RequestSizeLimit(25_000_000)]
    public async Task<ActionResult<CompanyAccountRequestSubmissionResultDto>> Submit(
        [FromForm] CreateCompanyAccountRequestDto request,
        CancellationToken ct)
        => Ok(await companyAccountRequestService.SubmitAsync(request, ct));

    [HttpGet]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<ActionResult<IReadOnlyList<CompanyAccountRequestListItemDto>>> GetRequests(
        [FromQuery] string? status,
        CancellationToken ct)
        => Ok(await companyAccountRequestService.GetRequestsAsync(status, ct));

    [HttpGet("validate-admin-email")]
    [AllowAnonymous]
    public async Task<ActionResult<CompanyAdminEmailAvailabilityDto>> ValidatePrimaryAdminEmail(
        [FromQuery] string email,
        CancellationToken ct)
        => Ok(await companyAccountRequestService.CheckPrimaryAdminEmailAvailabilityAsync(email, ct));

    [HttpGet("{requestId:guid}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<ActionResult<CompanyAccountRequestDetailsDto>> GetDetails(Guid requestId, CancellationToken ct)
    {
        var item = await companyAccountRequestService.GetDetailsAsync(requestId, ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost("{requestId:guid}/review")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<ActionResult<CompanyAccountRequestDetailsDto>> Review(
        Guid requestId,
        [FromBody] ReviewCompanyAccountRequestDto request,
        CancellationToken ct)
    {
        var reviewerUserId = CurrentUserContext.GetUserId(User);
        return Ok(await companyRequestReviewService.ReviewAsync(requestId, reviewerUserId, request, ct));
    }

    [HttpGet("{requestId:guid}/documents/{documentId:guid}/content")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> StreamDocument(Guid requestId, Guid documentId, CancellationToken ct)
    {
        var document = await dbContext.CompanyRequestDocuments
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == documentId && x.CompanyAccountRequestId == requestId, ct);
        if (document is null)
        {
            return NotFound();
        }

        var file = await requestDocumentStorageService.OpenReadAsync(document.StorageKey, ct);
        return File(file.Stream, document.ContentType, enableRangeProcessing: true);
    }

    [HttpGet("invitations/view")]
    [AllowAnonymous]
    [EnableRateLimiting("invitation-view")]
    public async Task<ActionResult<CompanyInvitationViewDto>> GetInvitation(
        [FromQuery] string token,
        CancellationToken ct)
    {
        var invitation = await companyInvitationService.GetInvitationAsync(token, ct);
        return invitation is null ? NotFound() : Ok(invitation);
    }

    [HttpPost("invitations/accept")]
    [AllowAnonymous]
    [EnableRateLimiting("invitation-accept")]
    public async Task<IActionResult> AcceptInvitation(
        [FromQuery] string token,
        [FromBody] AcceptCompanyInvitationDto request,
        CancellationToken ct)
    {
        await companyInvitationService.AcceptAsync(token, request, ct);
        return Ok(new { message = "Company admin account activated successfully." });
    }
}
