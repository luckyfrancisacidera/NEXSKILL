namespace SkillSense.Application.Contracts.Response;

public sealed class AtsScoreResponse
{
    public float SkillsScore { get; set; }
    public float ExperienceScore { get; set; }
    public float EducationScore { get; set; }
    public float SummaryScore { get; set; }
    public float FinalScore { get; set; }
    public Dictionary<string, object> Breakdown { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}
