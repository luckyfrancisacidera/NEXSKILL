using SkillSense.Application.Contracts.Request;

using SkillSense.Application.Interfaces.Scoring;

namespace SkillSense.Application.Services.Scoring;

public sealed class JobDescriptionSections
{
    public string RoleContextText { get; set; } = string.Empty;
    public string RequirementsText { get; set; } = string.Empty;
    public string SkillsRequiredText { get; set; } = string.Empty;
    public string SkillsPreferredText { get; set; } = string.Empty;
    public string EducationExperienceText { get; set; } = string.Empty;
    public string TitleSummaryText { get; set; } = string.Empty;
}

public static class JobDescriptionSectioner
{
    public static JobDescriptionSections Build(JobDescriptionInput input)
    {
        var text = input.Text ?? string.Empty;
        var required = input.RequiredSkills.Count > 0
            ? string.Join(' ', input.RequiredSkills)
            : ExtractBlock(text, ["required", "must have", "requirements"]);
        var preferred = input.PreferredSkills.Count > 0
            ? string.Join(' ', input.PreferredSkills)
            : ExtractBlock(text, ["preferred", "nice to have", "plus"]);

        return new JobDescriptionSections
        {
            RoleContextText = string.Join(' ', new[] { input.Title, input.Text, input.Responsibilities }.Where(x => !string.IsNullOrWhiteSpace(x))),
            RequirementsText = ExtractBlock(text, ["requirements", "qualifications"]).IfEmpty(text),
            SkillsRequiredText = required,
            SkillsPreferredText = preferred,
            EducationExperienceText = $"{input.MinYears} years {input.MinEducation} {ExtractBlock(text, ["education", "experience"])}",
            TitleSummaryText = $"{input.Title} {text.Split('\n').FirstOrDefault()}"
        };
    }

    private static string ExtractBlock(string text, string[] keywords)
    {
        foreach (var keyword in keywords)
        {
            var idx = text.IndexOf(keyword, StringComparison.OrdinalIgnoreCase);
            if (idx >= 0)
            {
                var context = text[idx..Math.Min(text.Length, idx + 300)];
                return context;
            }
        }

        return string.Empty;
    }

    private static string IfEmpty(this string value, string fallback)
        => string.IsNullOrWhiteSpace(value) ? fallback : value;
}
