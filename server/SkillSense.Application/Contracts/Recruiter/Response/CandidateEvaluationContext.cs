using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Recruiter.Response;

public static class CandidateEvaluationSignalLevels
{
    public const string Strong = "strong";
    public const string Related = "related";
    public const string Missing = "missing";
}

public sealed class CandidateEvaluationContext
{
    [JsonPropertyName("job")]
    public CandidateEvaluationJobContext Job { get; set; } = new();

    [JsonPropertyName("candidate")]
    public CandidateEvaluationCandidateContext Candidate { get; set; } = new();

    [JsonPropertyName("compatibility")]
    public CandidateEvaluationCompatibilityContext Compatibility { get; set; } = new();

    [JsonPropertyName("evaluation")]
    public CandidateEvaluationSignals Evaluation { get; set; } = new();
}

public sealed class CandidateEvaluationJobContext
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

public sealed class CandidateEvaluationCandidateContext
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("location")]
    public string? Location { get; set; }

    [JsonPropertyName("total_experience_months")]
    public int? TotalExperienceMonths { get; set; }

    [JsonPropertyName("education_max_level")]
    public string? EducationMaxLevel { get; set; }

    [JsonPropertyName("normalized_skills")]
    public List<string> NormalizedSkills { get; set; } = [];
}

public sealed class CandidateEvaluationCompatibilityContext
{
    [JsonPropertyName("location_compatibility")]
    public string LocationCompatibility { get; set; } = "unknown";

    [JsonPropertyName("work_setup_compatibility")]
    public string WorkSetupCompatibility { get; set; } = "unknown";

    [JsonPropertyName("employment_type_compatibility")]
    public string EmploymentTypeCompatibility { get; set; } = "unknown";
}

public sealed class CandidateEvaluationSignals
{
    [JsonPropertyName("required_skills")]
    public List<CandidateEvaluationSkillSignal> RequiredSkills { get; set; } = [];

    [JsonPropertyName("preferred_skills")]
    public List<CandidateEvaluationSkillSignal> PreferredSkills { get; set; } = [];

    [JsonPropertyName("strengths")]
    public List<string> Strengths { get; set; } = [];

    [JsonPropertyName("weak_signals")]
    public List<string> WeakSignals { get; set; } = [];

    [JsonPropertyName("missing_skills")]
    public List<string> MissingSkills { get; set; } = [];

    [JsonPropertyName("highlights")]
    public List<string> Highlights { get; set; } = [];

    [JsonPropertyName("experience_assessment")]
    public string ExperienceAssessment { get; set; } = "unknown";

    [JsonPropertyName("education_assessment")]
    public string EducationAssessment { get; set; } = "unknown";
}

public sealed class CandidateEvaluationSkillSignal
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("level")]
    public string Level { get; set; } = CandidateEvaluationSignalLevels.Missing;

    [JsonPropertyName("signal")]
    public string Signal { get; set; } = string.Empty;
}
