using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Contracts.Scoring.Response;

namespace SkillSense.Application.Interfaces.Scoring {
    public interface IExperienceYearsCalculator
    {
        ExperienceYearsResult Calculate(ResumeParseResult resume, int? requiredYears);
    }
}



