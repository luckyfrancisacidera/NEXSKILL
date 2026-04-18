namespace SkillSense.Domain.Entities;

public sealed class ResumeSubmissionEntity
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public string BlobObjectKey { get; set; } = string.Empty;
    public Guid JobId { get; set; }
    public string AppliedJobPosition { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? PostalCode { get; set; }
    public string? Location { get; set; }
    // ResumeSubmission identifies the application record.
    // JobSeekerUserId identifies the actual account/person behind that submission.
    public Guid? JobSeekerUserId { get; set; }
    public ResumeSubmissionStatus Status { get; set; }
    public string ParsedResumeJson { get; set; } = "{}";
    public bool IsHiddenFromJobSeekerHistory { get; set; }
    public DateTime? JobSeekerHistoryArchivedAtUtc { get; set; }
    public DateTime? JobSeekerHistoryDeletedAtUtc { get; set; }
    public DateTime? HireDateUtc { get; set; }
    public Guid? HiredByRecruiterId { get; set; }
    public Guid? AcceptedOfferId { get; set; }
    public int RetryCount { get; set; }
    public DateTime? NextRetryAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public AppUser? JobSeekerUser { get; set; }
    public ICollection<JobOfferEntity> Offers { get; set; } = [];
    public HireEntity? Hire { get; set; }
}

public enum ResumeSubmissionStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Recommended = 3,
    Failed = 4,
    Shortlisted = 5,
    Interview = 6,
    Offer = 7,
    Hired = 8,
    Rejected = 9,
}
