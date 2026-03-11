using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Interfaces;

public interface IAdminManagementRepository
{
    Task<SuperAdminDashboardData> GetSuperAdminDashboardAsync(CancellationToken ct = default);
    Task<CompanyAdminDashboardData?> GetCompanyAdminDashboardAsync(Guid companyId, CancellationToken ct = default);
    Task<Guid?> GetCompanyIdByAdminUserIdAsync(Guid adminUserId, CancellationToken ct = default);
    Task<AdminRecruiterOverviewData?> GetRecruiterOverviewByUserIdAsync(Guid recruiterUserId, CancellationToken ct = default);
}
