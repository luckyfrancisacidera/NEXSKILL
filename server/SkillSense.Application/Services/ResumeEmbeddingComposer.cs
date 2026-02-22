using SkillSense.Application.Contracts.Response;
using System.Text;

namespace SkillSense.Application.Services;

public static class ResumeEmbeddingComposer
{
    public static string ComposeFullText(ResumeParseResult resume)
    {
        var sections = ComposeSections(resume)
            .Select(x => x.Value)
            .Where(x => !string.IsNullOrWhiteSpace(x));

        return string.Join('\n', sections);
    }

    public static Dictionary<string, string> ComposeSections(ResumeParseResult resume)
    {
        var sections = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["summary"] = string.Join(' ', resume.Summary.Sentences.Select(s => s.Text).Where(t => !string.IsNullOrWhiteSpace(t))),
            ["skills"] = BuildSkillsText(resume.Skills),
            ["work_experience"] = string.Join(' ', resume.WorkExperience.Select(w => w.EmbeddingText).Where(t => !string.IsNullOrWhiteSpace(t))),
            ["education"] = string.Join(' ', resume.Education.Select(e => e.EmbeddingText).Where(t => !string.IsNullOrWhiteSpace(t))),
            ["projects"] = string.Join(' ', resume.Projects.Select(p => p.EmbeddingText).Where(t => !string.IsNullOrWhiteSpace(t))),
            ["certifications"] = string.Join(' ', resume.Certifications.Select(c => c.EmbeddingText).Where(t => !string.IsNullOrWhiteSpace(t))),
        };

        return sections;
    }

    private static string BuildSkillsText(Skills skills)
    {
        var builder = new StringBuilder();

        if (skills.Items.Count > 0)
        {
            builder.AppendJoin(' ', skills.Items.Where(i => !string.IsNullOrWhiteSpace(i)));
        }

        if (!string.IsNullOrWhiteSpace(skills.Text))
        {
            if (builder.Length > 0)
            {
                builder.Append(' ');
            }

            builder.Append(skills.Text);
        }

        return builder.ToString();
    }
}
