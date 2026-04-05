using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillSense.Api.Security;
using SkillSense.Application.Contracts.Auth;
using SkillSense.Persistence.Data;

namespace SkillSense.Api.Controllers;

/* =========================================
   ACCOUNT SETUP
========================================= */

[Route("api/account")]
[ApiController]
[Authorize]
public sealed class AccountController(SkillSenseDbContext dbContext) : ControllerBase
{
    private Guid CurrentUserId => CurrentUserContext.GetUserId(User);

    // Loads setup status.
    [HttpGet("setup-status")]
    public async Task<IActionResult> GetSetupStatus(CancellationToken ct)
    {
        var userId = CurrentUserId;
        var roles = User.Claims
            .Where(c => c.Type == System.Security.Claims.ClaimTypes.Role)
            .Select(c => c.Value)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        // Recruiter takes precedence when user has multiple roles.
        if (roles.Any(r => string.Equals(r, "Recruiter", StringComparison.OrdinalIgnoreCase)))
        {
            var profile = await dbContext.RecruiterProfiles
                .FirstOrDefaultAsync(x => x.UserId == userId, ct);
            var requiresSetup = profile is null || profile.CompanyId == Guid.Empty;
            Domain.Entities.CompanyEntity? company = null;
            if (!requiresSetup)
            {
                company = await dbContext.Companies.FindAsync(new object[] { profile!.CompanyId }, ct);
            }

            return Ok(new
            {
                requiresSetup,
                type = "recruiter",
                missingFields = requiresSetup ? new[] { "company" } : Array.Empty<string>(),
                activeCompanyId = requiresSetup ? (Guid?)null : profile!.CompanyId,
                recruiterProfileIds = profile is null ? Array.Empty<Guid>() : new[] { profile.Id },
                company = company is null
                    ? null
                    : new { company.Id, company.Name, company.PrimaryEmail }
            });
        }

        if (roles.Any(r => string.Equals(r, "CompanyAdmin", StringComparison.OrdinalIgnoreCase)))
        {
            var adminProfile = await dbContext.AdminProfiles
                .FirstOrDefaultAsync(x => x.UserId == userId, ct);

            var companyId = adminProfile?.CompanyId;
            var company = companyId.HasValue
                ? await dbContext.Companies.FindAsync(new object[] { companyId.Value }, ct)
                : null;

            var requiresSetup = company is null || string.IsNullOrWhiteSpace(company.Name);
            var missingFields = new List<string>();
            if (company is null)
            {
                missingFields.Add("company");
            }
            else if (string.IsNullOrWhiteSpace(company.Name))
            {
                missingFields.Add("company_name");
            }

            return Ok(new
            {
                requiresSetup,
                type = "companyAdmin",
                missingFields = missingFields.ToArray(),
                activeCompanyId = companyId,
                recruiterProfileIds = Array.Empty<Guid>(),
                company = company is null
                    ? null
                    : new { company.Id, company.Name, company.PrimaryEmail }
            });
        }

        return Ok(new
        {
            requiresSetup = false,
            type = (string?)null,
            missingFields = Array.Empty<string>(),
            activeCompanyId = (Guid?)null,
            recruiterProfileIds = Array.Empty<Guid>()
        });
    }

    // Completes recruiter setup.
    [HttpPost("setup/recruiter")]
    [Authorize(Roles = "Recruiter")]
    public async Task<IActionResult> CompleteRecruiterSetup(
        [FromBody] CompleteRecruiterSetupRequest request,
        CancellationToken ct)
    {
        var userId = CurrentUserId;

        var profile = await dbContext.RecruiterProfiles
            .FirstOrDefaultAsync(x => x.UserId == userId, ct);

        if (profile is null)
        {
            profile = new Domain.Entities.RecruiterProfileEntity
            {
                Id = Guid.NewGuid(),
                UserId = userId
            };
            await dbContext.RecruiterProfiles.AddAsync(profile, ct);
        }

        if (profile.CompanyId == Guid.Empty)
        {
            var company = new Domain.Entities.CompanyEntity
            {
                Id = Guid.NewGuid(),
                Name = request.CompanyName.Trim(),
                PrimaryEmail = string.IsNullOrWhiteSpace(request.CompanyEmail) ? null : request.CompanyEmail.Trim(),
                Location = string.IsNullOrWhiteSpace(request.Location) ? null : request.Location.Trim(),
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow,
                IsActive = true
            };

            profile.CompanyId = company.Id;
            await dbContext.Companies.AddAsync(company, ct);
        }

        await dbContext.SaveChangesAsync(ct);

        return Ok(new { message = "Recruiter setup completed." });
    }

    // Completes company admin setup.
    [HttpPost("setup/company-admin")]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<IActionResult> CompleteCompanyAdminSetup(
        [FromBody] CompleteCompanyAdminSetupRequest request,
        CancellationToken ct)
    {
        var userId = CurrentUserId;

        var adminProfile = await dbContext.AdminProfiles
            .FirstOrDefaultAsync(x => x.UserId == userId, ct);

        if (adminProfile is null)
        {
            adminProfile = new Domain.Entities.AdminProfileEntity
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CreatedAtUtc = DateTime.UtcNow
            };
            await dbContext.AdminProfiles.AddAsync(adminProfile, ct);
        }

        Domain.Entities.CompanyEntity? company = null;
        if (adminProfile.CompanyId.HasValue && adminProfile.CompanyId != Guid.Empty)
        {
            company = await dbContext.Companies.FindAsync(new object[] { adminProfile.CompanyId.Value }, ct);
        }

        if (company is null)
        {
            company = new Domain.Entities.CompanyEntity
            {
                Id = Guid.NewGuid(),
                Name = request.CompanyName.Trim(),
                PrimaryEmail = string.IsNullOrWhiteSpace(request.CompanyEmail) ? null : request.CompanyEmail.Trim(),
                Location = string.IsNullOrWhiteSpace(request.Location) ? null : request.Location.Trim(),
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow,
                IsActive = true
            };
            adminProfile.CompanyId = company.Id;
            await dbContext.Companies.AddAsync(company, ct);
        }
        else
        {
            company.Name = request.CompanyName.Trim();
            company.PrimaryEmail = string.IsNullOrWhiteSpace(request.CompanyEmail) ? null : request.CompanyEmail.Trim();
            company.Location = string.IsNullOrWhiteSpace(request.Location) ? null : request.Location.Trim();
            company.UpdatedAtUtc = DateTime.UtcNow;
        }

        await dbContext.SaveChangesAsync(ct);

        return Ok(new { message = "Company admin setup completed." });
    }
}
