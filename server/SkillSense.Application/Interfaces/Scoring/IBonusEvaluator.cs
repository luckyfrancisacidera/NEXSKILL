using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Contracts.Scoring.Response;

namespace SkillSense.Application.Interfaces.Scoring
{
    public interface IBonusEvaluator
    {
        BonusResult Evaluate(ResumeParseResult resume);
    }
}
