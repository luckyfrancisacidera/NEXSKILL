using Microsoft.AspNetCore.Identity;
using SkillSense.Application.Contracts.Admin.Request;
using SkillSense.Application.Contracts.Admin.Response;
using SkillSense.Application.Contracts.Auth;
using SkillSense.Application.Interfaces.Admin;
using SkillSense.Application.Interfaces.Auth;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Application.Services.Admin;

public sealed class AdminManagementService(
    IAdminManagementRepository adminManagementRepository,
    IAuthService authService,
    UserManager<AppUser> userManager) : IAdminManagementService
{
    public async Task<SuperAdminDashboardResponse> GetSuperAdminDashboardAsync(CancellationToken ct = default)
    {
        var data = await adminManagementRepository.GetSuperAdminDashboardAsync(ct);

        return new SuperAdminDashboardResponse
        {
            Summary = new SuperAdminDashboardSummaryResponse
            {
                TotalCompanies = data.TotalCompanies,
                ActiveCompanies = data.ActiveCompanies,
                TotalRecruiters = data.TotalRecruiters,
                ActiveRecruiters = data.ActiveRecruiters,
                TotalJobs = data.TotalJobs,
                ActiveJobs = data.ActiveJobs,
            },
            Companies = data.Companies.Select(MapCompany).ToList(),
            RecentRecruiters = data.RecentRecruiters.Select(MapRecruiter).ToList(),
        };
    }

    public async Task<CompanyAdminDashboardResponse> GetCompanyAdminDashboardAsync(Guid adminUserId, Guid companyId, CancellationToken ct = default)
    {
        await EnsureCompanyAdminAccessAsync(adminUserId, companyId, ct);

        var data = await adminManagementRepository.GetCompanyAdminDashboardAsync(companyId, ct)
            ?? throw new KeyNotFoundException("Company not found.");

        return new CompanyAdminDashboardResponse
        {
            Company = new AdminCompanyIdentityResponse
            {
                Id = data.Company.Id,
                Name = data.Company.Name,
                PrimaryEmail = data.Company.PrimaryEmail,
                Location = data.Company.Location,
                IsActive = data.Company.IsActive,
            },
            Summary = new CompanyAdminDashboardSummaryResponse
            {
                TotalRecruiters = data.TotalRecruiters,
                ActiveRecruiters = data.ActiveRecruiters,
                ActiveJobs = data.ActiveJobs,
                UpcomingInterviews = data.UpcomingInterviews,
                TotalOffers = data.TotalOffers,
                TotalHires = data.TotalHires,
            },
            Recruiters = data.Recruiters.Select(MapRecruiter).ToList(),
        };
    }

    public async Task<AdminRecruiterOverviewResponse> CreateRecruiterAsync(Guid adminUserId, Guid companyId, CreateManagedRecruiterRequest request, CancellationToken ct = default)
    {
        await EnsureCompanyAdminAccessAsync(adminUserId, companyId, ct);

        var result = await authService.CreatePrivilegedUserAsync(new CreatePrivilegedUserRequest
        {
            Email = request.Email,
            Password = request.Password,
            Role = "Recruiter",
            CompanyId = companyId,
        }, ct);

        if (!result.Succeeded)
        {
            throw new InvalidOperationException(result.Errors.FirstOrDefault() ?? result.Message);
        }

        var recruiterUserId = Guid.TryParse(result.UserId, out var parsedUserId)
            ? parsedUserId
            : throw new InvalidOperationException("Recruiter user could not be resolved.");

        var recruiter = await adminManagementRepository.GetRecruiterOverviewByUserIdAsync(recruiterUserId, ct)
            ?? throw new KeyNotFoundException("Recruiter could not be loaded after creation.");

        return MapRecruiter(recruiter);
    }

    public async Task DeactivateRecruiterAsync(Guid adminUserId, Guid companyId, Guid recruiterUserId, CancellationToken ct = default)
    {
        await EnsureCompanyAdminAccessAsync(adminUserId, companyId, ct);

        var recruiter = await adminManagementRepository.GetRecruiterOverviewByUserIdAsync(recruiterUserId, ct)
            ?? throw new KeyNotFoundException("Recruiter not found.");

        if (recruiter.CompanyId != companyId)
        {
            throw new UnauthorizedAccessException("Recruiter does not belong to your company.");
        }

        var user = await userManager.FindByIdAsync(recruiterUserId.ToString())
            ?? throw new KeyNotFoundException("Recruiter user account not found.");

        user.LockoutEnabled = true;
        user.LockoutEnd = DateTimeOffset.MaxValue;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(result.Errors.FirstOrDefault()?.Description ?? "Could not deactivate recruiter.");
        }
    }

    private async Task EnsureCompanyAdminAccessAsync(Guid adminUserId, Guid companyId, CancellationToken ct)
    {
        var scopedCompanyId = await adminManagementRepository.GetCompanyIdByAdminUserIdAsync(adminUserId, ct)
            ?? throw new KeyNotFoundException("Company admin profile not found.");

        if (scopedCompanyId != companyId)
        {
            throw new UnauthorizedAccessException("Active company does not match the company admin assignment.");
        }
    }

    private static AdminCompanyOverviewResponse MapCompany(AdminCompanyOverviewData company)
        => new()
        {
            CompanyId = company.CompanyId,
            Name = company.Name,
            PrimaryEmail = company.PrimaryEmail,
            IsActive = company.IsActive,
            RecruiterCount = company.RecruiterCount,
            ActiveJobs = company.ActiveJobs,
            UpcomingInterviews = company.UpcomingInterviews,
            UpdatedAtUtc = company.UpdatedAtUtc,
        };

    private static AdminRecruiterOverviewResponse MapRecruiter(AdminRecruiterOverviewData recruiter)
        => new()
        {
            ProfileId = recruiter.ProfileId,
            UserId = recruiter.UserId,
            CompanyId = recruiter.CompanyId,
            CompanyName = recruiter.CompanyName,
            Email = recruiter.Email,
            IsActive = recruiter.IsActive,
            CreatedAtUtc = recruiter.CreatedAtUtc,
            TotalJobs = recruiter.TotalJobs,
            ActiveJobs = recruiter.ActiveJobs,
            UpcomingInterviews = recruiter.UpcomingInterviews,
            TotalHires = recruiter.TotalHires,
        };
}
