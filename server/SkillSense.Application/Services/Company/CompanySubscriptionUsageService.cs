using SkillSense.Application.Contracts.Company;
using SkillSense.Application.Interfaces.Company;
using SkillSense.Domain.Enums;
using SkillSense.Domain.Subscriptions;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services.Company;

public sealed class CompanySubscriptionUsageService(ICompanyLifecycleRepository repository) : ICompanySubscriptionUsageService
{
    public async Task<CompanySubscriptionSummaryDto> BuildSummaryAsync(Guid companyId, CancellationToken ct = default)
    {
        var subscription = await repository.GetCurrentSubscriptionAsync(companyId, ct)
            ?? throw new KeyNotFoundException("Company subscription was not found.");
        var plan = SubscriptionPlanCatalog.GetRequired(subscription.PlanId);
        var nowUtc = DateTime.UtcNow;

        if (subscription.EndsAtUtc.HasValue && subscription.EndsAtUtc.Value <= nowUtc && subscription.Status == CompanySubscriptionStatus.Active)
        {
            var trackedSubscription = await repository.GetCurrentSubscriptionForUpdateAsync(companyId, ct);
            if (trackedSubscription is not null
                && trackedSubscription.EndsAtUtc.HasValue
                && trackedSubscription.EndsAtUtc.Value <= nowUtc
                && trackedSubscription.Status == CompanySubscriptionStatus.Active)
            {
                trackedSubscription.Status = CompanySubscriptionStatus.Expired;
                trackedSubscription.LastEnforcedAtUtc = nowUtc;
                trackedSubscription.UpdatedAtUtc = nowUtc;
                await repository.SaveChangesAsync(ct);
                subscription = trackedSubscription;
            }
        }

        var (screeningWindowStartUtc, screeningWindowEndUtc) = GetScreeningWindow(subscription, nowUtc);
        var activeJobs = await repository.CountActiveJobsAsync(companyId, ct);
        var screenings = await repository.CountResumeScreeningsAsync(companyId, screeningWindowStartUtc, screeningWindowEndUtc, ct);
        var isExpired = subscription.Status == CompanySubscriptionStatus.Expired
            || (subscription.EndsAtUtc.HasValue && subscription.EndsAtUtc.Value <= nowUtc);

        return new CompanySubscriptionSummaryDto
        {
            PlanId = plan.Id,
            PlanName = plan.Name,
            BillingCycle = subscription.BillingCycle?.ToString(),
            Status = isExpired ? CompanySubscriptionStatus.Expired.ToString() : subscription.Status.ToString(),
            StartsAtUtc = subscription.StartsAtUtc,
            EndsAtUtc = subscription.EndsAtUtc,
            DaysRemaining = subscription.EndsAtUtc.HasValue
                ? Math.Max(0, (int)Math.Ceiling((subscription.EndsAtUtc.Value - nowUtc).TotalDays))
                : 0,
            ActiveJobPostsUsed = activeJobs,
            ActiveJobPostsMax = plan.MaxActiveJobPosts,
            ScreeningsUsed = screenings,
            ScreeningsMax = plan.MonthlyResumeScreenings,
            RemainingJobPosts = plan.MaxActiveJobPosts.HasValue ? Math.Max(0, plan.MaxActiveJobPosts.Value - activeJobs) : null,
            RemainingScreenings = plan.MonthlyResumeScreenings.HasValue ? Math.Max(0, plan.MonthlyResumeScreenings.Value - screenings) : null,
            IsTrial = plan.IsTrial,
            CanUpgrade = plan.Id != SubscriptionPlanCatalog.PremiumPlanId,
            IsExpired = isExpired,
            AnalyticsEnabled = plan.AnalyticsEnabled,
            RestrictionMessage = GetRestrictionMessage(plan, isExpired, activeJobs, screenings),
        };
    }

    private static (DateTime? StartsAtUtc, DateTime? EndsAtUtc) GetScreeningWindow(Domain.Entities.CompanySubscriptionEntity subscription, DateTime nowUtc)
    {
        if (!subscription.StartsAtUtc.HasValue)
        {
            return (null, null);
        }

        if (subscription.PlanId == SubscriptionPlanCatalog.FreeTrialPlanId)
        {
            return (subscription.StartsAtUtc, subscription.EndsAtUtc);
        }

        var cycleStart = subscription.StartsAtUtc.Value;
        while (cycleStart.AddMonths(1) <= nowUtc)
        {
            cycleStart = cycleStart.AddMonths(1);
        }

        return (cycleStart, cycleStart.AddMonths(1));
    }

    private static string? GetRestrictionMessage(SubscriptionPlanDefinition plan, bool isExpired, int activeJobs, int screenings)
    {
        if (isExpired)
        {
            return "Your plan has expired. ATS actions are currently restricted until you renew or upgrade.";
        }

        if (plan.MaxActiveJobPosts.HasValue && activeJobs >= plan.MaxActiveJobPosts.Value)
        {
            return "Your company has reached its active job post limit for the current plan.";
        }

        if (plan.MonthlyResumeScreenings.HasValue && screenings >= plan.MonthlyResumeScreenings.Value)
        {
            return "Your company has reached its resume screening limit for the current plan.";
        }

        return null;
    }
}
