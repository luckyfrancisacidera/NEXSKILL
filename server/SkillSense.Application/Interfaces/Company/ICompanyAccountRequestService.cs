using SkillSense.Application.Contracts.Company;

namespace SkillSense.Application.Interfaces.Company;

public interface ICompanyAccountRequestService
{
    Task<CompanyAccountRequestSubmissionResultDto> SubmitAsync(CreateCompanyAccountRequestDto request, CancellationToken ct = default);
    Task<IReadOnlyList<CompanyAccountRequestListItemDto>> GetRequestsAsync(string? status, CancellationToken ct = default);
    Task<CompanyAccountRequestDetailsDto?> GetDetailsAsync(Guid requestId, CancellationToken ct = default);
    Task<CompanyAdminEmailAvailabilityDto> CheckPrimaryAdminEmailAvailabilityAsync(string email, CancellationToken ct = default);
}
