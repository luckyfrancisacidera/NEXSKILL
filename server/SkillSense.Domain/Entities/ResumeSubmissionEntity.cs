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
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public AppUser? JobSeekerUser { get; set; }
    public ICollection<JobOfferEntity> Offers { get; set; } = [];
}

public enum ResumeSubmissionStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3,
    Shortlisted = 4,
    Interview = 5,
    Offer = 6,
    Hire = 7,
    Rejected = 8,
}
