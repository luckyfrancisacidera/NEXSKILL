using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Recruiter.Response;

public sealed class CandidateExplanationFacts
{
    [JsonPropertyName("job")]
    public CandidateExplanationJobFacts Job { get; set; } = new();

    [JsonPropertyName("candidate")]
    public CandidateExplanationCandidateFacts Candidate { get; set; } = new();

    [JsonPropertyName("compatibility")]
    public CandidateExplanationCompatibilityFacts Compatibility { get; set; } = new();

    [JsonPropertyName("scoring")]
    public CandidateExplanationScoringFacts Scoring { get; set; } = new();

    [JsonPropertyName("match_summary")]
    public CandidateExplanationMatchSummaryFacts MatchSummary { get; set; } = new();
}

public static class CandidateExplanationMatchStates
{
    public const string ExactEvidence = "EXACT_EVIDENCE";
    public const string RelatedEvidence = "RELATED_EVIDENCE";
    public const string PartialEvidence = "PARTIAL_EVIDENCE";
    public const string LimitedEvidence = "LIMITED_EVIDENCE";
    public const string NotFound = "NOT_FOUND";
}

public sealed class CandidateExplanationEvidenceItem
{
    [JsonPropertyName("jd_item")]
    public string JdItem { get; set; } = string.Empty;

    [JsonPropertyName("best_resume_evidence")]
    public string BestResumeEvidence { get; set; } = string.Empty;
}

public sealed class CandidateExplanationMatchItem
{
    [JsonPropertyName("jd_item")]
    public string JdItem { get; set; } = string.Empty;

    [JsonPropertyName("match_state")]
    public string MatchState { get; set; } = CandidateExplanationMatchStates.NotFound;

    [JsonPropertyName("match_type")]
    public string MatchType { get; set; } = "unmatched";

    [JsonPropertyName("base_match_score")]
    public float BaseMatchScore { get; set; }

    [JsonPropertyName("final_match_confidence")]
    public float FinalMatchConfidence { get; set; }

    [JsonPropertyName("best_resume_evidence")]
    public string BestResumeEvidence { get; set; } = string.Empty;

    [JsonPropertyName("strongest_evidence")]
    public string StrongestEvidence { get; set; } = string.Empty;

    [JsonPropertyName("evidence_source_path")]
    public string EvidenceSourcePath { get; set; } = string.Empty;

    [JsonPropertyName("source")]
    public string Source { get; set; } = string.Empty;

    [JsonPropertyName("match_reason")]
    public string MatchReason { get; set; } = string.Empty;

    [JsonPropertyName("evidence_count_total")]
    public int EvidenceCountTotal { get; set; }

    [JsonPropertyName("evidence_count_distinct")]
    public int EvidenceCountDistinct { get; set; }

    [JsonPropertyName("evidence_types_used")]
    public List<string> EvidenceTypesUsed { get; set; } = [];
}

public sealed class CandidateExplanationJobFacts
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("required_skills")]
    public List<string> RequiredSkills { get; set; } = [];

    [JsonPropertyName("preferred_skills")]
    public List<string> PreferredSkills { get; set; } = [];

    [JsonPropertyName("minimum_years")]
    public int? MinimumYears { get; set; }

    [JsonPropertyName("education")]
    public string? Education { get; set; }

    [JsonPropertyName("location")]
    public string Location { get; set; } = string.Empty;

    [JsonPropertyName("work_setup")]
    public string WorkSetup { get; set; } = string.Empty;

    [JsonPropertyName("employment_type")]
    public string EmploymentType { get; set; } = string.Empty;
}

public sealed class CandidateExplanationCandidateFacts
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("location")]
    public string? Location { get; set; }

    [JsonPropertyName("total_experience_months")]
    public int? TotalExperienceMonths { get; set; }

    [JsonPropertyName("education_max_level")]
    public string? EducationMaxLevel { get; set; }

    [JsonPropertyName("normalized_skills")]
    public List<string> NormalizedSkills { get; set; } = [];
}

public sealed class CandidateExplanationCompatibilityFacts
{
    [JsonPropertyName("location_compatibility")]
    public string LocationCompatibility { get; set; } = "unknown";

    [JsonPropertyName("work_setup_compatibility")]
    public string WorkSetupCompatibility { get; set; } = "unknown";

    [JsonPropertyName("employment_type")]
    public string EmploymentType { get; set; } = string.Empty;

    [JsonPropertyName("employment_type_compatibility")]
    public string EmploymentTypeCompatibility { get; set; } = "unknown";

    [JsonPropertyName("notes")]
    public List<string> Notes { get; set; } = [];
}

public sealed class CandidateExplanationScoringFacts
{
    [JsonPropertyName("final_weighted_score")]
    public float FinalWeightedScore { get; set; }

    [JsonPropertyName("skills_score")]
    public float SkillsScore { get; set; }

    [JsonPropertyName("experience_score")]
    public float ExperienceScore { get; set; }

    [JsonPropertyName("education_score")]
    public float EducationScore { get; set; }

    [JsonPropertyName("summary_score")]
    public float SummaryScore { get; set; }

    [JsonPropertyName("responsibilities_section_score")]
    public float? ResponsibilitiesSectionScore { get; set; }

    [JsonPropertyName("description_section_score")]
    public float? DescriptionSectionScore { get; set; }

    [JsonPropertyName("minimum_years_met")]
    public bool? MinimumYearsMet { get; set; }

    [JsonPropertyName("minimum_education_met")]
    public bool? MinimumEducationMet { get; set; }
}

public sealed class CandidateExplanationMatchSummaryFacts
{
    [JsonPropertyName("required_skill_details")]
    public List<CandidateExplanationMatchItem> RequiredSkillDetails { get; set; } = [];

    [JsonPropertyName("preferred_skill_details")]
    public List<CandidateExplanationMatchItem> PreferredSkillDetails { get; set; } = [];

    [JsonPropertyName("responsibility_details")]
    public List<CandidateExplanationMatchItem> ResponsibilityDetails { get; set; } = [];

    [JsonPropertyName("description_details")]
    public List<CandidateExplanationMatchItem> DescriptionDetails { get; set; } = [];

    [JsonPropertyName("matched_required_skills")]
    public List<string> MatchedRequiredSkills { get; set; } = [];

    [JsonPropertyName("missing_required_skills")]
    public List<string> MissingRequiredSkills { get; set; } = [];

    [JsonPropertyName("matched_preferred_skills")]
    public List<string> MatchedPreferredSkills { get; set; } = [];

    [JsonPropertyName("matched_responsibilities")]
    public List<string> MatchedResponsibilities { get; set; } = [];

    [JsonPropertyName("missing_responsibilities")]
    public List<string> MissingResponsibilities { get; set; } = [];

    [JsonPropertyName("top_description_alignment_evidence")]
    public List<CandidateExplanationEvidenceItem> TopDescriptionAlignmentEvidence { get; set; } = [];

    [JsonPropertyName("description_top_matches")]
    public List<string> DescriptionTopMatches { get; set; } = [];

    [JsonPropertyName("role_relevant_experience_evidence")]
    public List<CandidateExplanationEvidenceItem> RoleRelevantExperienceEvidence { get; set; } = [];

    [JsonPropertyName("notable_evidence")]
    public List<CandidateExplanationEvidenceItem> NotableEvidence { get; set; } = [];
}
