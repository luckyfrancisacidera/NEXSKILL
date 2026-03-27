using SkillSense.Application.Contracts.Admin.Request;
using SkillSense.Application.Contracts.Admin.Response;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Employees;
using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces.Admin;

public interface IAdminManagementService
{
    Task<SuperAdminDashboardResponse> GetSuperAdminDashboardAsync(
        int companiesPage,
        int companyAdminsPage,
        int recruitersPage,
        int pageSize,
        CancellationToken ct = default);

    Task<CompanyAdminDashboardResponse> GetCompanyAdminDashboardAsync(
        Guid adminUserId,
        Guid companyId,
        int pageNumber,
        int pageSize,
        CancellationToken ct = default);
    Task<PagedResult<EmployeeRecordResponse>> GetCompanyEmployeesAsync(
        Guid adminUserId,
        Guid companyId,
        int pageNumber,
        int pageSize,
        string? search,
        CancellationToken ct = default);
    Task<ApplicantDetailResponse?> GetCompanyApplicantBySubmissionIdAsync(
        Guid adminUserId,
        Guid companyId,
        Guid submissionId,
        CancellationToken ct = default);
    Task<ApplicantResumeAccessResult> GetCompanyApplicantResumeAccessAsync(
        Guid adminUserId,
        Guid companyId,
        Guid submissionId,
        CancellationToken ct = default);

    Task<AdminCompanyAccountResponse> CreateCompanyAccountAsync(CreateCompanyAccountRequest request, CancellationToken ct = default);
    Task<AdminRecruiterOverviewResponse> CreateRecruiterAsync(Guid adminUserId, Guid companyId, CreateManagedRecruiterRequest request, CancellationToken ct = default);
    Task ActivateCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task DeactivateCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task ActivateCompanyAdminAsync(Guid adminUserId, CancellationToken ct = default);
    Task DeactivateCompanyAdminAsync(Guid adminUserId, CancellationToken ct = default);
    Task ActivateRecruiterAsync(Guid recruiterUserId, CancellationToken ct = default);
    Task DeactivateRecruiterAsync(Guid recruiterUserId, CancellationToken ct = default);
    Task ActivateRecruiterAsync(Guid adminUserId, Guid companyId, Guid recruiterUserId, CancellationToken ct = default);
    Task DeactivateRecruiterAsync(Guid adminUserId, Guid companyId, Guid recruiterUserId, CancellationToken ct = default);
}
