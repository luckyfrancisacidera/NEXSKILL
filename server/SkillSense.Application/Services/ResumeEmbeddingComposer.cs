using SkillSense.Application.Contracts.Response;

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
            ["summary"] = string.Join(' ', resume.Summary.Where(t => !string.IsNullOrWhiteSpace(t))),
            ["skills"] = string.Join(' ', resume.Skills.Where(t => !string.IsNullOrWhiteSpace(t))),
            ["work_experience"] = string.Join(' ', resume.WorkExperience.Select(w => w.EmbeddingText).Where(t => !string.IsNullOrWhiteSpace(t))),
            ["education"] = string.Join(' ', resume.Education.Select(e => e.EmbeddingText).Where(t => !string.IsNullOrWhiteSpace(t))),
            ["projects"] = string.Join(' ', resume.Projects.Select(p => p.EmbeddingText).Where(t => !string.IsNullOrWhiteSpace(t))),
            ["certifications"] = string.Join(' ', resume.Certifications.Select(c => c.EmbeddingText).Where(t => !string.IsNullOrWhiteSpace(t))),
        };

        return sections;
    }
}
