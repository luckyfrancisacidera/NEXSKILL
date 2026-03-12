using Microsoft.AspNetCore.Identity;
using SkillSense.Application.Contracts.Admin.Request;
using SkillSense.Application.Contracts.Admin.Response;
using SkillSense.Application.Contracts.Auth;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Admin;
using SkillSense.Application.Interfaces.Auth;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Application.Services.Admin;

public sealed class AdminManagementService(
    IAdminManagementRepository adminManagementRepository,
    IAuthService authService,
    IDateTimeProvider dateTimeProvider,
    UserManager<AppUser> userManager) : IAdminManagementService
{
    public async Task<SuperAdminDashboardResponse> GetSuperAdminDashboardAsync(
        int companiesPage,
        int companyAdminsPage,
        int recruitersPage,
        int pageSize,
        CancellationToken ct = default)
    {
        var data = await adminManagementRepository.GetSuperAdminDashboardAsync(
            companiesPage,
            companyAdminsPage,
            recruitersPage,
            NormalizePageSize(pageSize),
            ct);

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
            Companies = MapPaged(data.Companies, MapCompany),
            CompanyAdmins = MapPaged(data.CompanyAdmins, MapCompanyAdmin),
            Recruiters = MapPaged(data.Recruiters, MapRecruiter),
        };
    }

    public async Task<CompanyAdminDashboardResponse> GetCompanyAdminDashboardAsync(
        Guid adminUserId,
        Guid companyId,
        int pageNumber,
        int pageSize,
        CancellationToken ct = default)
    {
        await EnsureCompanyAdminAccessAsync(adminUserId, companyId, ct);

        var data = await adminManagementRepository.GetCompanyAdminDashboardAsync(companyId, pageNumber, NormalizePageSize(pageSize), ct)
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
            Recruiters = MapPaged(data.Recruiters, MapRecruiter),
        };
    }

    public async Task<AdminCompanyAccountResponse> CreateCompanyAccountAsync(CreateCompanyAccountRequest request, CancellationToken ct = default)
    {
        var companyName = request.Name.Trim();
        if (await adminManagementRepository.CompanyNameExistsAsync(companyName, ct))
        {
            throw new InvalidOperationException("A company with this name already exists.");
        }

        var adminEmail = request.AdminEmail.Trim();
        var existingAdmin = await userManager.FindByEmailAsync(adminEmail);
        if (existingAdmin is not null)
        {
            throw new InvalidOperationException("A user with this admin email already exists.");
        }

        var now = dateTimeProvider.UtcNow;
        var company = new CompanyEntity
        {
            Id = Guid.NewGuid(),
            Name = companyName,
            PrimaryEmail = string.IsNullOrWhiteSpace(request.PrimaryEmail) ? adminEmail : request.PrimaryEmail.Trim(),
            Location = string.IsNullOrWhiteSpace(request.Location) ? null : request.Location.Trim(),
            IsActive = true,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        await adminManagementRepository.AddCompanyAsync(company, ct);
        await adminManagementRepository.SaveChangesAsync(ct);

        var result = await authService.CreatePrivilegedUserAsync(new CreatePrivilegedUserRequest
        {
            Email = adminEmail,
            Password = request.AdminPassword,
            Role = "CompanyAdmin",
            CompanyId = company.Id,
        }, ct);

        if (!result.Succeeded)
        {
            throw new InvalidOperationException(result.Errors.FirstOrDefault() ?? result.Message);
        }

        var companyAdminUserId = Guid.TryParse(result.UserId, out var parsedUserId)
            ? parsedUserId
            : throw new InvalidOperationException("Company admin user could not be resolved.");

        var companyAdmin = await adminManagementRepository.GetCompanyAdminOverviewByUserIdAsync(companyAdminUserId, ct)
            ?? throw new KeyNotFoundException("Company admin could not be loaded after creation.");

        return new AdminCompanyAccountResponse
        {
            Company = MapCompany(new AdminCompanyOverviewData
            {
                CompanyId = company.Id,
                Name = company.Name,
                PrimaryEmail = company.PrimaryEmail,
                IsActive = company.IsActive,
                RecruiterCount = 0,
                ActiveJobs = 0,
                UpcomingInterviews = 0,
                UpdatedAtUtc = company.UpdatedAtUtc,
            }),
            CompanyAdmin = MapCompanyAdmin(companyAdmin),
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

    public Task ActivateCompanyAsync(Guid companyId, CancellationToken ct = default)
        => SetCompanyActiveStatusAsync(companyId, true, ct);

    public Task DeactivateCompanyAsync(Guid companyId, CancellationToken ct = default)
        => SetCompanyActiveStatusAsync(companyId, false, ct);

    public Task ActivateCompanyAdminAsync(Guid adminUserId, CancellationToken ct = default)
        => SetCompanyAdminActiveStatusAsync(adminUserId, true, ct);

    public Task DeactivateCompanyAdminAsync(Guid adminUserId, CancellationToken ct = default)
        => SetCompanyAdminActiveStatusAsync(adminUserId, false, ct);

    public Task ActivateRecruiterAsync(Guid recruiterUserId, CancellationToken ct = default)
        => SetRecruiterActiveStatusAsync(recruiterUserId, null, true, ct);

    public Task DeactivateRecruiterAsync(Guid recruiterUserId, CancellationToken ct = default)
        => SetRecruiterActiveStatusAsync(recruiterUserId, null, false, ct);

    public async Task ActivateRecruiterAsync(Guid adminUserId, Guid companyId, Guid recruiterUserId, CancellationToken ct = default)
    {
        await EnsureCompanyAdminAccessAsync(adminUserId, companyId, ct);
        await SetRecruiterActiveStatusAsync(recruiterUserId, companyId, true, ct);
    }

    public async Task DeactivateRecruiterAsync(Guid adminUserId, Guid companyId, Guid recruiterUserId, CancellationToken ct = default)
    {
        await EnsureCompanyAdminAccessAsync(adminUserId, companyId, ct);
        await SetRecruiterActiveStatusAsync(recruiterUserId, companyId, false, ct);
    }

    private async Task SetCompanyActiveStatusAsync(Guid companyId, bool isActive, CancellationToken ct)
    {
        var company = await adminManagementRepository.GetCompanyByIdAsync(companyId, ct)
            ?? throw new KeyNotFoundException("Company not found.");

        company.IsActive = isActive;
        company.UpdatedAtUtc = dateTimeProvider.UtcNow;
        await adminManagementRepository.SaveChangesAsync(ct);
    }

    private async Task SetCompanyAdminActiveStatusAsync(Guid adminUserId, bool isActive, CancellationToken ct)
    {
        var companyAdmin = await adminManagementRepository.GetCompanyAdminOverviewByUserIdAsync(adminUserId, ct)
            ?? throw new KeyNotFoundException("Company admin not found.");

        await SetIdentityAccountActiveStatusAsync(companyAdmin.UserId, "CompanyAdmin", isActive);
    }

    private async Task SetRecruiterActiveStatusAsync(Guid recruiterUserId, Guid? scopedCompanyId, bool isActive, CancellationToken ct)
    {
        var recruiter = await adminManagementRepository.GetRecruiterOverviewByUserIdAsync(recruiterUserId, ct)
            ?? throw new KeyNotFoundException("Recruiter not found.");

        if (scopedCompanyId.HasValue && recruiter.CompanyId != scopedCompanyId.Value)
        {
            throw new UnauthorizedAccessException("Recruiter does not belong to your company.");
        }

        await SetIdentityAccountActiveStatusAsync(recruiter.UserId, "Recruiter", isActive);
    }

    private async Task SetIdentityAccountActiveStatusAsync(Guid userId, string requiredRole, bool isActive)
    {
        var user = await userManager.FindByIdAsync(userId.ToString())
            ?? throw new KeyNotFoundException("User account not found.");

        if (!await userManager.IsInRoleAsync(user, requiredRole))
        {
            throw new InvalidOperationException($"User is not assigned to the {requiredRole} role.");
        }

        user.LockoutEnabled = true;
        user.LockoutEnd = isActive ? null : DateTimeOffset.MaxValue;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(result.Errors.FirstOrDefault()?.Description ?? $"Could not update {requiredRole} status.");
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

    private static int NormalizePageSize(int pageSize) => Math.Clamp(pageSize <= 0 ? 10 : pageSize, 1, 100);

    private static PagedResult<TResponse> MapPaged<TData, TResponse>(PagedData<TData> data, Func<TData, TResponse> map)
        => new()
        {
            Items = data.Items.Select(map).ToList(),
            PageNumber = data.PageNumber,
            PageSize = data.PageSize,
            TotalCount = data.TotalCount,
            TotalPages = data.TotalPages,
        };

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

    private static AdminCompanyAdminOverviewResponse MapCompanyAdmin(AdminCompanyAdminOverviewData admin)
        => new()
        {
            UserId = admin.UserId,
            CompanyId = admin.CompanyId,
            CompanyName = admin.CompanyName,
            Email = admin.Email,
            IsActive = admin.IsActive,
            CreatedAtUtc = admin.CreatedAtUtc,
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
