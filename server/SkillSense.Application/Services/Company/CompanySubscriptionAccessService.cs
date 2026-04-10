using Microsoft.EntityFrameworkCore;
using SkillSense.Application.Contracts.Company;
using SkillSense.Application.Interfaces.Company;
using SkillSense.Persistence.Data;

namespace SkillSense.Application.Services.Company;

public sealed class CompanySubscriptionAccessService(
    ICompanySubscriptionUsageService usageService,
    SkillSenseDbContext dbContext) : ICompanySubscriptionAccessService
{
    public async Task<CompanySubscriptionSummaryDto> GetCompanyAdminSummaryAsync(Guid userId, CancellationToken ct = default)
    {
        var companyId = await dbContext.AdminProfiles
            .AsNoTracking()
            .Where(x => x.UserId == userId && x.CompanyId.HasValue)
            .Select(x => x.CompanyId!.Value)
            .FirstOrDefaultAsync(ct);

        if (companyId == Guid.Empty)
        {
            throw new KeyNotFoundException("Company admin company context was not found.");
        }

        return await usageService.BuildSummaryAsync(companyId, ct);
    }

    public Task<CompanySubscriptionGuardResultDto> CanCreateJobPostAsync(Guid companyId, CancellationToken ct = default)
        => BuildGuardAsync(companyId, summary =>
        {
            if (summary.IsExpired)
            {
                return summary.RestrictionMessage;
            }

            if (summary.RemainingJobPosts == 0)
            {
                return "You cannot create another job post until one is closed or the plan is upgraded.";
            }

            return null;
        }, ct);

    public Task<CompanySubscriptionGuardResultDto> CanActivateJobPostAsync(Guid companyId, Guid? currentJobId = null, CancellationToken ct = default)
        => BuildGuardAsync(companyId, summary =>
        {
            if (summary.IsExpired)
            {
                return summary.RestrictionMessage;
            }

            if (summary.RemainingJobPosts == 0)
            {
                return "You cannot activate another job post because the company-wide active post limit has been reached.";
            }

            return null;
        }, ct);

    public Task<CompanySubscriptionGuardResultDto> CanRunScreeningAsync(Guid companyId, CancellationToken ct = default)
        => BuildGuardAsync(companyId, summary =>
        {
            if (summary.IsExpired)
            {
                return summary.RestrictionMessage;
            }

            if (summary.RemainingScreenings == 0)
            {
                return "You cannot run more resume screenings because the company-wide screening quota has been reached.";
            }

            return null;
        }, ct);

    private async Task<CompanySubscriptionGuardResultDto> BuildGuardAsync(
        Guid companyId,
        Func<CompanySubscriptionSummaryDto, string?> reasonFactory,
        CancellationToken ct)
    {
        var summary = await usageService.BuildSummaryAsync(companyId, ct);
        var restrictionMessage = reasonFactory(summary);

        return new CompanySubscriptionGuardResultDto
        {
            Allowed = string.IsNullOrWhiteSpace(restrictionMessage),
            RestrictionMessage = restrictionMessage,
            Summary = summary,
        };
    }
}
