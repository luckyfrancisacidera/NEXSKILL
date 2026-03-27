namespace SkillSense.Domain.Entities;

public enum HireStatus
{
    Active = 0,
    Inactive = 1,
    Separated = 2,
}

public sealed class HireEntity
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public Guid RecruiterId { get; set; }
    public Guid JobSeekerId { get; set; }
    public Guid JobId { get; set; }
    public Guid OfferId { get; set; }
    public Guid ApplicationId { get; set; }
    public DateTime HiredAtUtc { get; set; }
    public HireStatus Status { get; set; } = HireStatus.Active;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public CompanyEntity Company { get; set; } = null!;
    public AppUser Recruiter { get; set; } = null!;
    public AppUser JobSeeker { get; set; } = null!;
    public JobEntity Job { get; set; } = null!;
    public JobOfferEntity Offer { get; set; } = null!;
    public ResumeSubmissionEntity Application { get; set; } = null!;
}
