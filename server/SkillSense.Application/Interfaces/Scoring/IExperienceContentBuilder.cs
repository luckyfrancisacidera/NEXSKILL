using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces.Scoring
{
    public interface IExperienceContentBuilder
    {
        string BuildCorpus(ResumeParseResult resume);
        string BuildJobContext(JobDescriptionInput input);
    }
}
