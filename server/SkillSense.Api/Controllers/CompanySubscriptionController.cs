using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSense.Api.Security;
using SkillSense.Application.Contracts.Company;
using SkillSense.Application.Interfaces.Company;

namespace SkillSense.Api.Controllers;

[Route("api/company/subscription")]
[ApiController]
[Authorize(Roles = "CompanyAdmin")]
public sealed class CompanySubscriptionController(
    ICompanySubscriptionAccessService companySubscriptionAccessService) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<CompanySubscriptionSummaryDto>> GetSummary(CancellationToken ct)
    {
        var userId = CurrentUserContext.GetUserId(User);
        return Ok(await companySubscriptionAccessService.GetCompanyAdminSummaryAsync(userId, ct));
    }
}
