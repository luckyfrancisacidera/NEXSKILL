namespace SkillSense.Domain.Entities;

public enum JobOfferStatus
{
    Pending = 0,
    Accepted = 1,
    Declined = 2,
    Expired = 3,
    Cancelled = 4,
}

public sealed class JobOfferEntity
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public Guid SentByUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Benefits { get; set; }
    public string SalaryText { get; set; } = string.Empty;
    public decimal SalaryAmount { get; set; }
    public string SalaryType { get; set; } = string.Empty;
    public string Currency { get; set; } = "PHP";
    public string EmploymentType { get; set; } = string.Empty;
    public string WorkSetup { get; set; } = string.Empty;
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public DateOnly? ExpirationDate { get; set; }
    public JobOfferStatus Status { get; set; } = JobOfferStatus.Pending;
    public DateTime SentAtUtc { get; set; }
    public DateTime? RespondedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public ResumeSubmissionEntity Application { get; set; } = null!;
    public AppUser SentByUser { get; set; } = null!;
    public HireEntity? Hire { get; set; }
}
