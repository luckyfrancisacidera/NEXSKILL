namespace SkillSense.Domain.Subscriptions;

public sealed record SubscriptionPlanDefinition(
    string Id,
    string Name,
    string Price,
    string Period,
    string? Badge,
    string Description,
    string Tagline,
    IReadOnlyList<string> Features,
    string Variant,
    string Cta,
    string CtaTo,
    bool IsTrial,
    bool SupportsAnnual,
    int? MaxActiveJobPosts,
    int? MonthlyResumeScreenings,
    bool AnalyticsEnabled,
    int? TrialDurationDays);
