using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Contracts.Scoring.Response;

namespace SkillSense.Application.Interfaces.Scoring
{
    public interface IEducationEvaluator
    {
        EducationResult Evaluate(JobDescriptionInput input, ResumeParseResult resume);
    }
}
