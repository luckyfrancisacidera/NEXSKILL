namespace SkillSense.Persistence.Models;

public sealed class ShortlistedCandidateData
{
    public Guid ResumeSubmissionId { get; set; }
    public Guid JobId { get; set; }
    public Guid JobSeekerUserId { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public string CandidateEmail { get; set; } = string.Empty;
}
