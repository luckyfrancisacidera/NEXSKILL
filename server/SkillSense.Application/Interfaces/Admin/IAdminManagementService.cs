using SkillSense.Application.Contracts.Admin.Request;
using SkillSense.Application.Contracts.Admin.Response;

namespace SkillSense.Application.Interfaces.Admin;

public interface IAdminManagementService
{
    Task<SuperAdminDashboardResponse> GetSuperAdminDashboardAsync(CancellationToken ct = default);
    Task<CompanyAdminDashboardResponse> GetCompanyAdminDashboardAsync(Guid adminUserId, Guid companyId, CancellationToken ct = default);
    Task<AdminRecruiterOverviewResponse> CreateRecruiterAsync(Guid adminUserId, Guid companyId, CreateManagedRecruiterRequest request, CancellationToken ct = default);
    Task DeactivateRecruiterAsync(Guid adminUserId, Guid companyId, Guid recruiterUserId, CancellationToken ct = default);
}
