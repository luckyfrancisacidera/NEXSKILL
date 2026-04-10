using SkillSense.Application.Contracts.Company;

namespace SkillSense.Application.Interfaces.Company;

public interface ICompanyRequestReviewService
{
    Task<CompanyAccountRequestDetailsDto> ReviewAsync(Guid requestId, Guid reviewerUserId, ReviewCompanyAccountRequestDto request, CancellationToken ct = default);
}
