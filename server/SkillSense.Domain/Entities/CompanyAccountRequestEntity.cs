using SkillSense.Domain.Enums;

namespace SkillSense.Domain.Entities;

public sealed class CompanyAccountRequestEntity
{
    public Guid Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public string CompanySize { get; set; } = string.Empty;
    public string? WebsiteUrl { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string CityProvince { get; set; } = string.Empty;
    public string FullAddress { get; set; } = string.Empty;
    public string PrimaryAdminFullName { get; set; } = string.Empty;
    public string PrimaryAdminEmail { get; set; } = string.Empty;
    public string PrimaryAdminPhone { get; set; } = string.Empty;
    public string PrimaryAdminRole { get; set; } = string.Empty;
    public string RequestedPlanId { get; set; } = string.Empty;
    public CompanyBillingCycle? BillingCycle { get; set; }
    public string? BusinessRegistrationNumber { get; set; }
    public string? TaxId { get; set; }
    public CompanyAccountRequestStatus Status { get; set; } = CompanyAccountRequestStatus.PendingReview;
    public string? ReviewNotes { get; set; }
    public Guid? ReviewedByUserId { get; set; }
    public DateTime? ReviewedAtUtc { get; set; }
    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;
    public ICollection<CompanyRequestDocumentEntity> Documents { get; set; } = [];
}
