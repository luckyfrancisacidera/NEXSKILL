using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Models;

public sealed class ApplicantStageContextData
{
    public required ResumeSubmissionEntity Submission { get; init; }
    public required JobEntity Job { get; init; }
    public JobOfferEntity? LatestOffer { get; init; }
    public InterviewEntity? LatestInterview { get; init; }
}
