using SkillSense.Domain.Entities;
using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Interfaces;

public interface IAdminManagementRepository
{
    Task<SuperAdminDashboardData> GetSuperAdminDashboardAsync(
        int companiesPageNumber,
        int companyAdminsPageNumber,
        int recruitersPageNumber,
        int pageSize,
        CancellationToken ct = default);

    Task<CompanyAdminDashboardData?> GetCompanyAdminDashboardAsync(
        Guid companyId,
        int pageNumber,
        int pageSize,
        CancellationToken ct = default);

    Task<Guid?> GetCompanyIdByAdminUserIdAsync(Guid adminUserId, CancellationToken ct = default);
    Task<AdminRecruiterOverviewData?> GetRecruiterOverviewByUserIdAsync(Guid recruiterUserId, CancellationToken ct = default);
    Task<AdminCompanyAdminOverviewData?> GetCompanyAdminOverviewByUserIdAsync(Guid adminUserId, CancellationToken ct = default);
    Task<CompanyEntity?> GetCompanyByIdAsync(Guid companyId, CancellationToken ct = default);
    Task<bool> CompanyNameExistsAsync(string companyName, CancellationToken ct = default);
    Task AddCompanyAsync(CompanyEntity company, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
