using SkillSense.Application.Contracts.Company;

namespace SkillSense.Application.Interfaces.Company;

public interface ICompanyInvitationService
{
    Task<CompanyInvitationViewDto?> GetInvitationAsync(string token, CancellationToken ct = default);
    Task AcceptAsync(string token, AcceptCompanyInvitationDto request, CancellationToken ct = default);
}
