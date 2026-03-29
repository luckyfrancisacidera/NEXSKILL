using Microsoft.AspNetCore.Identity;
using AutoMapper;
using Microsoft.Extensions.Logging;
using SkillSense.Application.Contracts.Admin.Request;
using SkillSense.Application.Contracts.Admin.Response;
using SkillSense.Application.Contracts.Auth;
using SkillSense.Application.Contracts.Employees;
using SkillSense.Application.Contracts.Offers;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Common.Recruiter;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Admin;
using SkillSense.Application.Interfaces.Auth;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Application.Services.Admin;

public sealed class AdminManagementService(
    IAdminManagementRepository adminManagementRepository,
    ICandidateExplanationRepository candidateExplanationRepository,
    IObjectStorageService objectStorageService,
    IAuthService authService,
    IDateTimeProvider dateTimeProvider,
    IMapper mapper,
    UserManager<AppUser> userManager,
    ILogger<AdminManagementService> logger) : IAdminManagementService
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

    public async Task<SuperAdminUsersPageResponse> GetSuperAdminUsersAsync(
        int pageNumber,
        int pageSize,
        CancellationToken ct = default)
    {
        var data = await adminManagementRepository.GetSuperAdminUsersAsync(
            pageNumber,
            NormalizePageSize(pageSize),
            ct);

        return new SuperAdminUsersPageResponse
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
            Users = MapPaged(data.Users, MapUser),
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

    public async Task<PagedResult<EmployeeRecordResponse>> GetCompanyEmployeesAsync(
        Guid adminUserId,
        Guid companyId,
        int pageNumber,
        int pageSize,
        string? search,
        CancellationToken ct = default)
    {
        await EnsureCompanyAdminAccessAsync(adminUserId, companyId, ct);

        var data = await adminManagementRepository.GetCompanyEmployeesAsync(
            companyId,
            pageNumber,
            NormalizePageSize(pageSize),
            search,
            ct);

        return MapPaged(data, MapEmployee);
    }

    public async Task<ApplicantDetailResponse?> GetCompanyApplicantBySubmissionIdAsync(
        Guid adminUserId,
        Guid companyId,
        Guid submissionId,
        CancellationToken ct = default)
    {
        await EnsureCompanyAdminAccessAsync(adminUserId, companyId, ct);

        var source = await adminManagementRepository.GetApplicantScoreBySubmissionIdAsync(companyId, submissionId, ct);
        if (source is null)
        {
            return null;
        }

        var baseItem = mapper.Map<ApplicantScoreItemResponse>(source, opt => opt.Items["recommendedIds"] = new HashSet<Guid>());
        var parsedResumeJson = await adminManagementRepository.GetParsedResumeJsonAsync(companyId, submissionId, ct);
        CandidateExplanationResponse? explanation = null;

        if (baseItem.SubmissionStatus is "Shortlisted" or "Interview" or "Offer" or "Hired")
        {
            var explanationEntity = await candidateExplanationRepository.GetSucceededExplanationAsync(submissionId, ct);
            if (explanationEntity is not null)
            {
                explanation = mapper.Map<CandidateExplanationResponse>(explanationEntity);
            }
        }

        var detail = mapper.Map<ApplicantDetailResponse>(baseItem);
        detail.ParsedResumeJson = RecruiterApplicantProjection.ParseResumeJsonElement(parsedResumeJson);
        detail.CandidateExplanation = explanation;
        detail.Offer = await MapOfferAsync(submissionId, ct);
        return detail;
    }

    public async Task<ApplicantResumeAccessResult> GetCompanyApplicantResumeAccessAsync(
        Guid adminUserId,
        Guid companyId,
        Guid submissionId,
        CancellationToken ct = default)
    {
        await EnsureCompanyAdminAccessAsync(adminUserId, companyId, ct);

        var submission = await adminManagementRepository.GetSubmissionByIdForCompanyAsync(companyId, submissionId, ct)
            ?? throw new KeyNotFoundException("Candidate not found.");

        if (string.IsNullOrWhiteSpace(submission.BlobObjectKey))
        {
            throw new KeyNotFoundException("Resume not found.");
        }

        if (!await objectStorageService.ExistsAsync(submission.BlobObjectKey, ct))
        {
            throw new KeyNotFoundException("Resume file not found.");
        }

        var fileName = string.IsNullOrWhiteSpace(submission.FileName) ? "resume" : submission.FileName;
        var contentType = string.IsNullOrWhiteSpace(submission.ContentType) ? "application/octet-stream" : submission.ContentType;
        var downloadUrl = await objectStorageService.GetDownloadUrlAsync(submission.BlobObjectKey, fileName, ct);

        return new ApplicantResumeAccessResult
        {
            ObjectKey = submission.BlobObjectKey,
            FileName = fileName,
            ContentType = contentType,
            DownloadUrl = downloadUrl,
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

    public Task ActivateUserAsync(Guid actorUserId, Guid userId, CancellationToken ct = default)
        => SetManagedUserActiveStatusAsync(actorUserId, userId, true, ct);

    public Task DeactivateUserAsync(Guid actorUserId, Guid userId, CancellationToken ct = default)
        => SetManagedUserActiveStatusAsync(actorUserId, userId, false, ct);

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

        logger.LogInformation(
            "Updated company {CompanyId} active status to {IsActive}.",
            companyId,
            isActive);
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

    private async Task SetManagedUserActiveStatusAsync(Guid actorUserId, Guid userId, bool isActive, CancellationToken ct)
    {
        if (actorUserId == userId)
        {
            throw new InvalidOperationException("You cannot change your own account status.");
        }

        var user = await adminManagementRepository.GetUserOverviewByUserIdAsync(userId, ct)
            ?? throw new KeyNotFoundException("User account not found.");

        if (user.Role is "Admin" or "SuperAdmin")
        {
            throw new InvalidOperationException("Admin accounts must be managed through protected bootstrap flows.");
        }

        await SetIdentityAccountActiveStatusAsync(user.UserId, user.Role, isActive);
    }

    private async Task SetIdentityAccountActiveStatusAsync(Guid userId, string requiredRole, bool isActive)
    {
        var user = await userManager.FindByIdAsync(userId.ToString())
            ?? throw new KeyNotFoundException("User account not found.");

        if (!await userManager.IsInRoleAsync(user, requiredRole))
        {
            throw new InvalidOperationException($"User is not assigned to the {requiredRole} role.");
        }

        user.IsActive = isActive;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(result.Errors.FirstOrDefault()?.Description ?? $"Could not update {requiredRole} status.");
        }

        logger.LogInformation(
            "Updated {Role} account {UserId} active status to {IsActive}.",
            requiredRole,
            userId,
            isActive);
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

    private static AdminUserOverviewResponse MapUser(AdminUserOverviewData user)
        => new()
        {
            UserId = user.UserId,
            Name = ResolveUserDisplayName(user),
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            ApplicationCount = user.ApplicationCount,
            JoinedAtUtc = user.JoinedAtUtc,
        };

    private static EmployeeRecordResponse MapEmployee(EmployeeRecordData employee)
        => new()
        {
            HireId = employee.HireId,
            ResumeSubmissionId = employee.ResumeSubmissionId,
            JobId = employee.JobId,
            JobSeekerUserId = employee.JobSeekerUserId,
            HiredByRecruiterId = employee.HiredByRecruiterId,
            AcceptedOfferId = employee.AcceptedOfferId,
            HireStatus = employee.HireStatus,
            EmployeeName = employee.EmployeeName,
            EmployeeEmail = employee.EmployeeEmail,
            RecruiterName = employee.RecruiterName,
            RecruiterEmail = employee.RecruiterEmail,
            JobTitle = employee.JobTitle,
            Department = employee.Department,
            OfferTitle = employee.OfferTitle,
            OfferSalaryText = employee.OfferSalaryText,
            HireDateUtc = employee.HireDateUtc,
        };

    private async Task<OfferResponse?> MapOfferAsync(Guid submissionId, CancellationToken ct)
    {
        var offer = await adminManagementRepository.GetLatestOfferByApplicationIdAsync(submissionId, ct);
        if (offer is null)
        {
            return null;
        }

        return new OfferResponse
        {
            Id = offer.Id,
            ApplicationId = offer.ApplicationId,
            Title = offer.Title,
            Message = offer.Message,
            Benefits = offer.Benefits,
            SalaryText = offer.SalaryText,
            SalaryAmount = offer.SalaryAmount,
            SalaryType = offer.SalaryType,
            Currency = offer.Currency,
            EmploymentType = offer.EmploymentType,
            WorkSetup = offer.WorkSetup,
            StartDate = offer.StartDate,
            EndDate = offer.EndDate,
            ExpirationDate = offer.ExpirationDate,
            Status = offer.Status.ToString(),
            SentAtUtc = offer.SentAtUtc,
            RespondedAtUtc = offer.RespondedAtUtc,
            CanAccept = offer.Status == JobOfferStatus.Pending,
            CanDecline = offer.Status == JobOfferStatus.Pending,
            CanMarkHired = false,
        };
    }

    private static string ResolveUserDisplayName(AdminUserOverviewData user)
    {
        var firstName = user.FirstName?.Trim();
        var lastName = user.LastName?.Trim();
        var fullName = string.Join(" ", new[] { firstName, lastName }.Where(value => !string.IsNullOrWhiteSpace(value)));

        if (!string.IsNullOrWhiteSpace(fullName))
        {
            return fullName;
        }

        if (!string.IsNullOrWhiteSpace(user.ProfileFullName))
        {
            return user.ProfileFullName.Trim();
        }

        if (!string.IsNullOrWhiteSpace(user.Email))
        {
            return user.Email.Split('@')[0].Replace('.', ' ').Replace('_', ' ').Trim();
        }

        return "User";
    }
}
