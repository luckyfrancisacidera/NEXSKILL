using SkillSense.Application.Contracts.Company;

namespace SkillSense.Application.Interfaces.Company;

public interface ICompanySubscriptionAccessService
{
    Task<CompanySubscriptionSummaryDto> GetCompanyAdminSummaryAsync(Guid userId, CancellationToken ct = default);
    Task<CompanySubscriptionGuardResultDto> CanCreateJobPostAsync(Guid companyId, CancellationToken ct = default);
    Task<CompanySubscriptionGuardResultDto> CanActivateJobPostAsync(Guid companyId, Guid? currentJobId = null, CancellationToken ct = default);
    Task<CompanySubscriptionGuardResultDto> CanRunScreeningAsync(Guid companyId, CancellationToken ct = default);
}
