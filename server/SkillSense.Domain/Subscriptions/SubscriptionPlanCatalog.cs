namespace SkillSense.Domain.Subscriptions;

public static class SubscriptionPlanCatalog
{
    public const string FreeTrialPlanId = "free-trial";
    public const string BasicPlanId = "basic";
    public const string StandardPlanId = "standard";
    public const string PremiumPlanId = "premium";

    private static readonly IReadOnlyDictionary<string, SubscriptionPlanDefinition> Plans =
        new Dictionary<string, SubscriptionPlanDefinition>(StringComparer.OrdinalIgnoreCase)
        {
            [FreeTrialPlanId] = new(
                FreeTrialPlanId,
                "Free Trial",
                "₱0",
                "/14 days",
                "14-Day Trial",
                "Try SkillSense with one active job post before upgrading.",
                "No upfront payment. Best for first-time setup.",
                [
                    "1 active job post",
                    "Up to 25 resume screenings",
                    "Semantic matching enabled",
                    "Basic ATS pipeline access",
                    "Analytics locked",
                    "14-day access",
                ],
                "trial",
                "Start Free Trial",
                "/company-account-request",
                true,
                false,
                1,
                25,
                false,
                14),
            [BasicPlanId] = new(
                BasicPlanId,
                "Basic",
                "₱500",
                "/month",
                null,
                "A solid starting point for teams hiring at a steady pace.",
                "Best for first paid hiring workflows.",
                [
                    "120 resume screenings / month",
                    "2 active job posts",
                    "Core semantic matching + explanation",
                    "Full ATS pipeline + analytics",
                ],
                "basic",
                "Choose Plan",
                "/company-account-request",
                false,
                true,
                2,
                120,
                true,
                null),
            [StandardPlanId] = new(
                StandardPlanId,
                "Standard",
                "₱1,200",
                "/month",
                "Most Popular",
                "For growing teams managing multiple openings at once.",
                "Balanced capacity for active recruitment.",
                [
                    "300-400 screenings / month",
                    "10 active job posts",
                    "Core semantic matching + explanation",
                    "Full ATS pipeline + analytics",
                ],
                "standard",
                "Choose Plan",
                "/company-account-request",
                false,
                true,
                10,
                400,
                true,
                null),
            [PremiumPlanId] = new(
                PremiumPlanId,
                "Premium",
                "₱2,500",
                "/month",
                "Best Value",
                "Unrestricted access for high-volume, high-intent hiring teams.",
                "For the most demanding recruitment pipelines.",
                [
                    "Unlimited resume screenings",
                    "Unlimited job posts",
                    "Core semantic matching + explanation",
                    "Full ATS pipeline + analytics",
                ],
                "premium",
                "Get Started",
                "/company-account-request",
                false,
                true,
                null,
                null,
                true,
                null),
        };

    public static IReadOnlyCollection<SubscriptionPlanDefinition> GetAll() => Plans.Values.ToArray();

    public static SubscriptionPlanDefinition GetRequired(string planId)
        => Plans.TryGetValue(planId, out var plan)
            ? plan
            : throw new ArgumentException($"Unsupported subscription plan id '{planId}'.");
}
