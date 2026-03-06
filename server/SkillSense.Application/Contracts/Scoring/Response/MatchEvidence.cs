namespace SkillSense.Application.Contracts.Scoring.Response;

public sealed class MatchEvidence
{
    public string JdItem { get; set; } = string.Empty;
    public string BestResumeEvidence { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public float Similarity { get; set; }
    public string MatchType { get; set; } = "semantic";
}
