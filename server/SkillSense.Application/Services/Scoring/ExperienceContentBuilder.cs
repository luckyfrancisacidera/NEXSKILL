using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces.Scoring;

namespace SkillSense.Application.Services.Scoring;

public sealed class ExperienceContentBuilder : IExperienceContentBuilder
{
    public string BuildCorpus(ResumeParseResult resume)
    {
        var work = string.Join(' ', resume.WorkExperience.Select(BuildWorkExperienceText));
        var events = string.Join(' ', resume.Events.Select(x => x.EmbeddingText));
        var projects = string.Join(' ', resume.Projects.Select(x => x.EmbeddingText));
        return string.Join(' ', new[] { work, events, projects }.Where(x => !string.IsNullOrWhiteSpace(x)));
    }

    public string BuildJobContext(JobDescriptionInput input)
    {
        return string.Join(' ', new[] { input.Title, input.Text, input.Responsibilities }
            .Where(x => !string.IsNullOrWhiteSpace(x)));
    }

    private static string BuildWorkExperienceText(WorkExperienceItem item)
    {
        if (!string.IsNullOrWhiteSpace(item.EmbeddingText))
        {
            return item.EmbeddingText;
        }

        return string.Join(' ', item.DescriptionItems.Where(x => !string.IsNullOrWhiteSpace(x)));
    }
}
