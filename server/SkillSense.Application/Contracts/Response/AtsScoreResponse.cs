using System.Text.Json.Serialization;
using SkillSense.Application.Contracts.Scoring.Response;

namespace SkillSense.Application.Contracts.Response;

public sealed class FinalMatchScore
{
    [JsonPropertyName("final_score")]
    public float FinalScore { get; set; }

    [JsonPropertyName("section_scores")]
    public Dictionary<string, float> SectionScores { get; set; } = new(StringComparer.OrdinalIgnoreCase);

    [JsonPropertyName("matches")]
    public MatchGroups Matches { get; set; } = new();

    [JsonPropertyName("section_score_details")]
    public List<SectionScore> SectionScoreDetails { get; set; } = [];

    [JsonPropertyName("hard_requirements")]
    public HardRequirementResult HardRequirements { get; set; } = new();
}

public sealed class MatchGroups
{
    [JsonPropertyName("required_skills")]
    public List<MatchEvidence> RequiredSkills { get; set; } = [];

    [JsonPropertyName("preferred_skills")]
    public List<MatchEvidence> PreferredSkills { get; set; } = [];

    [JsonPropertyName("responsibilities")]
    public List<MatchEvidence> Responsibilities { get; set; } = [];

    [JsonPropertyName("description_top_matches")]
    public List<MatchEvidence> DescriptionTopMatches { get; set; } = [];
}

public sealed class HardRequirementResult
{
    [JsonPropertyName("minimum_years_experience_met")]
    public bool MinimumYearsExperienceMet { get; set; }

    [JsonPropertyName("minimum_education_met")]
    public bool MinimumEducationMet { get; set; }
}
