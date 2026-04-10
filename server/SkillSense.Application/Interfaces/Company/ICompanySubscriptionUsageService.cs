using SkillSense.Application.Contracts.Company;

namespace SkillSense.Application.Interfaces.Company;

public interface ICompanySubscriptionUsageService
{
    Task<CompanySubscriptionSummaryDto> BuildSummaryAsync(Guid companyId, CancellationToken ct = default);
}
