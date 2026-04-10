using SkillSense.Domain.Enums;

namespace SkillSense.Domain.Entities;

public sealed class CompanySubscriptionEntity
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public CompanyEntity Company { get; set; } = null!;
    public string PlanId { get; set; } = string.Empty;
    public CompanyBillingCycle? BillingCycle { get; set; }
    public string? MockPaymentMethod { get; set; }
    public CompanySubscriptionStatus Status { get; set; } = CompanySubscriptionStatus.PendingActivation;
    public DateTime? StartsAtUtc { get; set; }
    public DateTime? EndsAtUtc { get; set; }
    public DateTime? TrialEndsAtUtc { get; set; }
    public bool AutoRenews { get; set; }
    public DateTime? LastEnforcedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
