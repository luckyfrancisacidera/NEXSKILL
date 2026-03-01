using Microsoft.Extensions.Options;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Contracts.Scoring.Response;
using SkillSense.Application.Interfaces.Scoring;

namespace SkillSense.Application.Services.Scoring;

public sealed class BonusEvaluator(IOptions<AtsScoringOptions> options) : IBonusEvaluator
{
    public BonusResult Evaluate(ResumeParseResult resume)
    {
        var reasons = new List<string>();
        var points = 0f;

        if (resume.Projects.Count > 0)
        {
            points += options.Value.BonusProjectsPoints;
            reasons.Add("projects_present");
        }

        if (resume.Certifications.Count > 0)
        {
            points += options.Value.BonusCertificationsPoints;
            reasons.Add("certifications_present");
        }

        var achievementsCount = resume.Achievements.Count;
        if (achievementsCount > 0)
        {
            points += options.Value.BonusAchievementsPoints;
            reasons.Add("achievements_present");
        }

        points = Math.Clamp(points, 0f, options.Value.BonusMaxPoints);
        return new BonusResult(points, reasons);
    }

}
