using System.Text.RegularExpressions;
using SkillSense.Application.Contracts.Response;
using SkillSense.Domain.Entities;

using SkillSense.Application.Interfaces.Scoring;

namespace SkillSense.Application.Services.Scoring;

public sealed class ResumeTextSections
{
    public string TitleTargetText { get; set; } = string.Empty;
    public string SummaryText { get; set; } = string.Empty;
    public string SkillsRequiredText { get; set; } = string.Empty;
    public string SkillsPreferredText { get; set; } = string.Empty;
    public string SkillsOtherText { get; set; } = string.Empty;
    public string WorkExperienceAggregateText { get; set; } = string.Empty;
    public string ExperienceContentAggregateText { get; set; } = string.Empty;
    public string ExperienceSignalsText { get; set; } = string.Empty;
    public List<(string Key, string Text)> WorkExperienceTexts { get; set; } = new();
    public string EventsText { get; set; } = string.Empty;
    public string EducationText { get; set; } = string.Empty;
    public string ProjectsText { get; set; } = string.Empty;

    public IEnumerable<(string SectionType, string? SubSectionKey, string Text)> EnumerateEmbeddingTexts()
    {
        yield return (ResumeSectionTypes.TitleTarget, null, TitleTargetText);
        yield return (ResumeSectionTypes.Summary, null, SummaryText);
        yield return (ResumeSectionTypes.SkillsRequired, null, SkillsRequiredText);
        yield return (ResumeSectionTypes.SkillsPreferred, null, SkillsPreferredText);
        yield return (ResumeSectionTypes.SkillsOther, null, SkillsOtherText);
        yield return (ResumeSectionTypes.WorkExperienceAggregate, null, WorkExperienceAggregateText);
        yield return (ResumeSectionTypes.ExperienceContentAggregate, null, ExperienceContentAggregateText);

        foreach (var job in WorkExperienceTexts)
        {
            yield return (ResumeSectionTypes.WorkExperience, job.Key, job.Text);
        }

        yield return (ResumeSectionTypes.Events, null, EventsText);
        yield return (ResumeSectionTypes.Education, null, EducationText);
        yield return (ResumeSectionTypes.Projects, null, ProjectsText);
    }
}

public static class ResumeSectionBuilder
{
    public static ResumeTextSections Build(ResumeParseResult resume)
    {
        var sections = new ResumeTextSections
        {
            TitleTargetText = resume.PersonalInfo.JobTarget,
            SummaryText = string.Join(' ', resume.Summary),
            SkillsOtherText = string.Join(' ', resume.Skills.Where(x => !string.IsNullOrWhiteSpace(x))),
            WorkExperienceTexts = resume.WorkExperience
                .Select((w, idx) =>
                {
                    var descriptionText = string.Join(' ', w.DescriptionItems.Where(x => !string.IsNullOrWhiteSpace(x)));
                    return (Key: $"job_{idx}_{w.Company}_{w.JobTitle}".Replace(' ', '_'), Text: descriptionText);
                })
                .Where(x => !string.IsNullOrWhiteSpace(x.Text))
                .ToList(),
            EventsText = string.Join(' ', resume.Events.Select(e => e.EmbeddingText)),
            EducationText = string.Join(' ', resume.Education
                .Select(BuildEducationText)
                .Where(t => !string.IsNullOrWhiteSpace(t))),
            ProjectsText = string.Join(' ', resume.Projects.Select(p => p.EmbeddingText))
        };

        sections.WorkExperienceAggregateText = string.Join(' ', sections.WorkExperienceTexts.Select(x => x.Text));
        sections.ExperienceContentAggregateText = string.Join(' ', new[]
        {
            sections.WorkExperienceAggregateText,
            sections.EventsText,
            sections.ProjectsText
        }.Where(x => !string.IsNullOrWhiteSpace(x)));
        sections.ExperienceSignalsText = BuildExperienceSignalsText(resume.WorkExperience);

        return sections;
    }

    private static string BuildEducationText(EducationItem education)
    {
        if (!string.IsNullOrWhiteSpace(education.EmbeddingText))
        {
            return education.EmbeddingText;
        }

        return string.Join(' ', new[]
        {
            education.Degree,
            education.Institution,
            string.Join(' ', education.DescriptionItems.Where(x => !string.IsNullOrWhiteSpace(x)))
        }.Where(x => !string.IsNullOrWhiteSpace(x)));
    }

    private static string BuildExperienceSignalsText(IEnumerable<WorkExperienceItem> workExperiences)
    {
        var roles = workExperiences.ToList();
        var totalYears = roles.Sum(work => EstimateYears(work.StartDate, work.EndDate));

        if (totalYears <= 0)
        {
            return roles.Count > 0 ? $"{roles.Count} roles" : string.Empty;
        }

        var roleSuffix = roles.Count == 1 ? "role" : "roles";
        return $"total {totalYears} years experience {roles.Count} {roleSuffix}";
    }

    private static int EstimateYears(string? startDate, string? endDate)
    {
        var startYear = ExtractYear(startDate);
        var endYear = ExtractYear(endDate);

        if (startYear is null)
        {
            return 0;
        }

        var start = startYear.Value;
        var effectiveEnd = endYear ?? DateTime.UtcNow.Year;
        if (effectiveEnd < start)
        {
            return 0;
        }

        return Math.Max(1, effectiveEnd - start);
    }

    private static int? ExtractYear(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return null;
        }

        var match = Regex.Match(text, @"\b(19|20)\d{2}\b");
        return match.Success ? int.Parse(match.Value) : null;
    }
}
