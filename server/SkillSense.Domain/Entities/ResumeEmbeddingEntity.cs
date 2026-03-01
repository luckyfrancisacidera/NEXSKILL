namespace SkillSense.Domain.Entities;

public sealed class ResumeEmbeddingEntity
{
    public Guid Id { get; set; }
    public Guid ResumeSubmissionId { get; set; }
    public string SectionType { get; set; } = ResumeSectionTypes.Unknown;
    public string? SubSectionKey { get; set; }
    public string EmbeddingJson { get; set; } = "[]";
    public string SourceText { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}

public static class ResumeSectionTypes
{
    public const string Unknown = "Unknown";
    public const string TitleTarget = "TitleTarget";
    public const string Summary = "Summary";
    public const string SkillsRequired = "Skills.Required";
    public const string SkillsPreferred = "Skills.Preferred";
    public const string SkillsOther = "Skills.Other";
    public const string ExperienceContentAggregate = "ExperienceContent.Aggregate";
    public const string WorkExperience = "WorkExperience";
    public const string WorkExperienceAggregate = "WorkExperience.Aggregate";
    public const string Events = "Events";
    public const string Education = "Education";
    public const string Projects = "Projects";
}
