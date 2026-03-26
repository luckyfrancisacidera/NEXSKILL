using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Scoring.Response;

public sealed class MatchEvidence
{
    [JsonPropertyName("jd_item")]
    public string JdItem { get; set; } = string.Empty;

    [JsonPropertyName("best_resume_evidence")]
    public string BestResumeEvidence { get; set; } = string.Empty;

    [JsonPropertyName("source")]
    public string Source { get; set; } = string.Empty;

    [JsonPropertyName("evidence_source_path")]
    public string EvidenceSourcePath { get; set; } = string.Empty;

    [JsonPropertyName("similarity")]
    public float Similarity { get; set; }

    [JsonPropertyName("match_type")]
    public string MatchType { get; set; } = "semantic";

    [JsonPropertyName("match_reason")]
    public string MatchReason { get; set; } = string.Empty;

    [JsonPropertyName("base_match_score")]
    public float BaseMatchScore { get; set; }

    [JsonPropertyName("evidence_count_total")]
    public int EvidenceCountTotal { get; set; }

    [JsonPropertyName("evidence_count_distinct")]
    public int EvidenceCountDistinct { get; set; }

    [JsonPropertyName("evidence_types_used")]
    public List<string> EvidenceTypesUsed { get; set; } = [];

    [JsonPropertyName("strongest_evidence")]
    public string StrongestEvidence { get; set; } = string.Empty;

    [JsonPropertyName("support_bonus_applied")]
    public float SupportBonusApplied { get; set; }

    [JsonPropertyName("depth_multiplier")]
    public float DepthMultiplier { get; set; } = 1f;

    [JsonPropertyName("final_match_confidence")]
    public float FinalMatchConfidence { get; set; }
}
