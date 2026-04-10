using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using SkillSense.Domain.Entities;
using SkillSense.Domain.Enums;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Persistence.Repositories;

public sealed class CompanyLifecycleRepository(SkillSenseDbContext dbContext) : ICompanyLifecycleRepository
{
    public Task AddRequestAsync(CompanyAccountRequestEntity request, CancellationToken ct = default)
        => dbContext.CompanyAccountRequests.AddAsync(request, ct).AsTask();

    public Task<CompanyAccountRequestEntity?> GetRequestByIdAsync(Guid requestId, CancellationToken ct = default)
        => dbContext.CompanyAccountRequests
            .Include(x => x.Documents)
            .FirstOrDefaultAsync(x => x.Id == requestId, ct);

    public Task<CompanyAccountRequestEntity?> GetRequestByIdForUpdateAsync(Guid requestId, CancellationToken ct = default)
    {
        IQueryable<CompanyAccountRequestEntity> query = dbContext.CompanyAccountRequests;

        if (dbContext.Database.IsNpgsql())
        {
            query = dbContext.CompanyAccountRequests
                .FromSqlInterpolated($"SELECT * FROM company_account_requests WHERE \"Id\" = {requestId} FOR UPDATE");
        }

        return query
            .Include(x => x.Documents)
            .FirstOrDefaultAsync(x => x.Id == requestId, ct);
    }

    public Task<CompanyAccountRequestEntity?> GetLatestApprovedRequestByPrimaryAdminEmailAsync(string email, CancellationToken ct = default)
        => dbContext.CompanyAccountRequests
            .AsNoTracking()
            .Where(x =>
                x.PrimaryAdminEmail == email
                && x.Status == CompanyAccountRequestStatus.Approved)
            .OrderByDescending(x => x.ReviewedAtUtc ?? x.SubmittedAtUtc)
            .FirstOrDefaultAsync(ct);

    public Task<List<CompanyAccountRequestEntity>> GetRequestsAsync(CompanyAccountRequestStatus? status, CancellationToken ct = default)
    {
        var query = dbContext.CompanyAccountRequests
            .Include(x => x.Documents)
            .AsNoTracking()
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(x => x.Status == status.Value);
        }

        return query
            .OrderByDescending(x => x.SubmittedAtUtc)
            .ToListAsync(ct);
    }

    public Task AddCompanyAsync(CompanyEntity company, CancellationToken ct = default)
        => dbContext.Companies.AddAsync(company, ct).AsTask();

    public Task AddSubscriptionAsync(CompanySubscriptionEntity subscription, CancellationToken ct = default)
        => dbContext.CompanySubscriptions.AddAsync(subscription, ct).AsTask();

    public Task<CompanySubscriptionEntity?> GetCurrentSubscriptionAsync(Guid companyId, CancellationToken ct = default)
        => dbContext.CompanySubscriptions
            .AsNoTracking()
            .Where(x => x.CompanyId == companyId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

    public Task<CompanySubscriptionEntity?> GetCurrentSubscriptionForUpdateAsync(Guid companyId, CancellationToken ct = default)
        => dbContext.CompanySubscriptions
            .Where(x => x.CompanyId == companyId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

    public Task<CompanySubscriptionEntity?> GetCompanyAdminSubscriptionAsync(Guid userId, CancellationToken ct = default)
        => dbContext.AdminProfiles
            .AsNoTracking()
            .Where(x => x.UserId == userId && x.CompanyId.HasValue)
            .Join(
                dbContext.CompanySubscriptions.AsNoTracking(),
                profile => profile.CompanyId!.Value,
                subscription => subscription.CompanyId,
                (_, subscription) => subscription)
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

    public Task AddInvitationAsync(CompanyInvitationEntity invitation, CancellationToken ct = default)
        => dbContext.CompanyInvitations.AddAsync(invitation, ct).AsTask();

    public Task<CompanyInvitationEntity?> GetInvitationByTokenHashAsync(string tokenHash, CancellationToken ct = default)
        => dbContext.CompanyInvitations
            .Include(x => x.Company)
            .Where(x => x.TokenHash == tokenHash)
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

    public Task<int> CountActiveJobsAsync(Guid companyId, CancellationToken ct = default)
        => dbContext.Jobs.CountAsync(x => x.CompanyId == companyId && x.Status == JobStatus.Published, ct);

    public Task<int> CountResumeScreeningsAsync(Guid companyId, DateTime? startsAtUtc, DateTime? endsAtUtc, CancellationToken ct = default)
    {
        var query = dbContext.ResumeSubmissions.AsNoTracking().Where(x => x.CompanyId == companyId);
        if (startsAtUtc.HasValue)
        {
            query = query.Where(x => x.CreatedAtUtc >= startsAtUtc.Value);
        }

        if (endsAtUtc.HasValue)
        {
            query = query.Where(x => x.CreatedAtUtc < endsAtUtc.Value);
        }

        return query.CountAsync(ct);
    }

    public Task<bool> EmailExistsAsync(string email, CancellationToken ct = default)
        => dbContext.Users.AnyAsync(x => x.NormalizedEmail == email.ToUpperInvariant(), ct);

    public Task<IDbContextTransaction> BeginSerializableTransactionAsync(CancellationToken ct = default)
        => dbContext.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => dbContext.SaveChangesAsync(ct);
}
