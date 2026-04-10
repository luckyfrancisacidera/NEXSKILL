namespace SkillSense.Application.Contracts.Company;

public sealed class CompanySubscriptionSummaryDto
{
    public string PlanId { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public string? BillingCycle { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? StartsAtUtc { get; set; }
    public DateTime? EndsAtUtc { get; set; }
    public int DaysRemaining { get; set; }
    public int ActiveJobPostsUsed { get; set; }
    public int? ActiveJobPostsMax { get; set; }
    public int ScreeningsUsed { get; set; }
    public int? ScreeningsMax { get; set; }
    public int? RemainingJobPosts { get; set; }
    public int? RemainingScreenings { get; set; }
    public bool IsTrial { get; set; }
    public bool CanUpgrade { get; set; }
    public bool IsExpired { get; set; }
    public bool AnalyticsEnabled { get; set; }
    public string? RestrictionMessage { get; set; }
    public string UsageSharedNoteJobPosts { get; set; } = "Active job posts are shared across all recruiters in your company.";
    public string UsageSharedNoteScreenings { get; set; } = "Resume screenings are counted cumulatively for your company plan.";
}

public sealed class CompanySubscriptionGuardResultDto
{
    public bool Allowed { get; set; }
    public string? RestrictionMessage { get; set; }
    public CompanySubscriptionSummaryDto Summary { get; set; } = new();
}
