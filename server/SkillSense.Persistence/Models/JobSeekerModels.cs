namespace SkillSense.Persistence.Models;

using SkillSense.Domain.Entities;

public sealed class ApplicationListItemData
{
    public Guid Id { get; set; }
    public Guid JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? RecruiterName { get; set; }
    public string? RecruiterEmail { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public ResumeSubmissionStatus Status { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    public Guid? OfferId { get; set; }
    public string? OfferTitle { get; set; }
    public string? OfferMessage { get; set; }
    public string? OfferSalaryText { get; set; }
    public string? OfferEmploymentType { get; set; }
    public DateOnly? OfferStartDate { get; set; }
    public DateOnly? OfferExpirationDate { get; set; }
    public JobOfferStatus? OfferStatus { get; set; }
    public DateTime? OfferSentAtUtc { get; set; }
    public DateTime? OfferRespondedAtUtc { get; set; }
}

public sealed class SavedJobData
{
    public Guid JobId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string Currency { get; set; } = "PHP";
    public string EmploymentType { get; set; } = string.Empty;
    public DateTime SavedAtUtc { get; set; }
}
