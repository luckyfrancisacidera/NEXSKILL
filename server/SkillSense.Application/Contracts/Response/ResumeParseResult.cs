using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Response;

public sealed class ResumeParseEnvelope
{
    [JsonPropertyName("parser_version")]
    public string ParserVersion { get; set; } = "v1";

    [JsonPropertyName("parsed_resume")]
    public ParsedResume ParsedResume { get; set; } = new();
}

public sealed class ParsedResume
{
    [JsonPropertyName("resume_id")]
    public string ResumeId { get; set; } = string.Empty;

    [JsonPropertyName("personal_info")]
    public PersonalInfo PersonalInfo { get; set; } = new();

    [JsonPropertyName("summary")]
    public List<string> Summary { get; set; } = [];

    [JsonPropertyName("skills")]
    public List<string> Skills { get; set; } = [];

    [JsonPropertyName("work_experience")]
    public List<WorkExperienceItem> WorkExperience { get; set; } = [];

    [JsonPropertyName("education")]
    public List<EducationItem> Education { get; set; } = [];

    [JsonPropertyName("projects")]
    public List<ProjectItem> Projects { get; set; } = [];

    [JsonPropertyName("events")]
    public List<EventItem> Events { get; set; } = [];

    [JsonPropertyName("certifications")]
    public List<CertificationItem> Certifications { get; set; } = [];

    [JsonPropertyName("derived")]
    public ParsedResumeDerived Derived { get; set; } = new();
}

public sealed class ParsedResumeDerived
{
    [JsonPropertyName("total_experience_months")]
    public int TotalExperienceMonths { get; set; }

    [JsonPropertyName("latest_job_title")]
    public string LatestJobTitle { get; set; } = string.Empty;

    [JsonPropertyName("normalized_skills")]
    public List<string> NormalizedSkills { get; set; } = [];

    [JsonPropertyName("education_max_level")]
    public string EducationMaxLevel { get; set; } = string.Empty;

}

public sealed class PersonalInfo
{
    [JsonPropertyName("full_name")] public string FullName { get; set; } = string.Empty;
    [JsonPropertyName("email")] public string Email { get; set; } = string.Empty;
    [JsonPropertyName("phone")] public string Phone { get; set; } = string.Empty;
    [JsonPropertyName("location")] public string Location { get; set; } = string.Empty;
    [JsonPropertyName("job_target")] public string JobTarget { get; set; } = string.Empty;
}

public sealed class WorkExperienceItem
{
    [JsonPropertyName("job_title")] public string JobTitle { get; set; } = string.Empty;
    [JsonPropertyName("company")] public string Company { get; set; } = string.Empty;
    [JsonPropertyName("location")] public string Location { get; set; } = string.Empty;
    [JsonPropertyName("start_date")] public string StartDate { get; set; } = string.Empty;
    [JsonPropertyName("end_date")] public string EndDate { get; set; } = string.Empty;
    [JsonPropertyName("is_current")] public bool IsCurrent { get; set; }
    [JsonPropertyName("duration_months")] public int DurationMonths { get; set; }
    [JsonPropertyName("description")] public string Description { get; set; } = string.Empty;
    [JsonPropertyName("bullets")] public List<string> Bullets { get; set; } = [];
    [JsonPropertyName("technologies")] public List<string> Technologies { get; set; } = [];
}

public sealed class EducationItem
{
    [JsonPropertyName("degree")] public string Degree { get; set; } = string.Empty;
    [JsonPropertyName("field_of_study")] public string FieldOfStudy { get; set; } = string.Empty;
    [JsonPropertyName("institution")] public string Institution { get; set; } = string.Empty;
    [JsonPropertyName("start_date")] public string StartDate { get; set; } = string.Empty;
    [JsonPropertyName("end_date")] public string EndDate { get; set; } = string.Empty;
    [JsonPropertyName("education_level")] public string EducationLevel { get; set; } = string.Empty;
}

public sealed class ProjectItem
{
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    [JsonPropertyName("description")] public string Description { get; set; } = string.Empty;
    [JsonPropertyName("bullets")] public List<string> Bullets { get; set; } = [];
    [JsonPropertyName("technologies")] public List<string> Technologies { get; set; } = [];
}

public sealed class EventItem
{
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    [JsonPropertyName("description")] public string Description { get; set; } = string.Empty;
}

public sealed class CertificationItem
{
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    [JsonPropertyName("issuer")] public string Issuer { get; set; } = string.Empty;
    [JsonPropertyName("issue_date")] public string IssueDate { get; set; } = string.Empty;
}