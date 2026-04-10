using SkillSense.Domain.Entities;
using SkillSense.Domain.Enums;
using Microsoft.EntityFrameworkCore.Storage;

namespace SkillSense.Persistence.Interfaces;

public interface ICompanyLifecycleRepository
{
    Task AddRequestAsync(CompanyAccountRequestEntity request, CancellationToken ct = default);
    Task<CompanyAccountRequestEntity?> GetRequestByIdAsync(Guid requestId, CancellationToken ct = default);
    Task<CompanyAccountRequestEntity?> GetRequestByIdForUpdateAsync(Guid requestId, CancellationToken ct = default);
    Task<CompanyAccountRequestEntity?> GetLatestApprovedRequestByPrimaryAdminEmailAsync(string email, CancellationToken ct = default);
    Task<List<CompanyAccountRequestEntity>> GetRequestsAsync(CompanyAccountRequestStatus? status, CancellationToken ct = default);
    Task AddCompanyAsync(CompanyEntity company, CancellationToken ct = default);
    Task AddSubscriptionAsync(CompanySubscriptionEntity subscription, CancellationToken ct = default);
    Task<CompanySubscriptionEntity?> GetCurrentSubscriptionAsync(Guid companyId, CancellationToken ct = default);
    Task<CompanySubscriptionEntity?> GetCurrentSubscriptionForUpdateAsync(Guid companyId, CancellationToken ct = default);
    Task<CompanySubscriptionEntity?> GetCompanyAdminSubscriptionAsync(Guid userId, CancellationToken ct = default);
    Task AddInvitationAsync(CompanyInvitationEntity invitation, CancellationToken ct = default);
    Task<CompanyInvitationEntity?> GetInvitationByTokenHashAsync(string tokenHash, CancellationToken ct = default);
    Task<int> CountActiveJobsAsync(Guid companyId, CancellationToken ct = default);
    Task<int> CountResumeScreeningsAsync(Guid companyId, DateTime? startsAtUtc, DateTime? endsAtUtc, CancellationToken ct = default);
    Task<bool> EmailExistsAsync(string email, CancellationToken ct = default);
    Task<IDbContextTransaction> BeginSerializableTransactionAsync(CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
