using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Response
{
    public sealed class ResumeParseResult
    {
        [JsonPropertyName("resume_id")]
        public string ResumeId { get; set; } = "";

        [JsonPropertyName("personal_info")]
        public PersonalInfo PersonalInfo { get; set; } = new();

        [JsonPropertyName("summary")]
        public Summary Summary { get; set; } = new();

        [JsonPropertyName("skills")]
        public Skills Skills { get; set; } = new();

        [JsonPropertyName("work_experience")]
        public List<WorkExperienceItem> WorkExperience { get; set; } = new();

        [JsonPropertyName("education")]
        public List<EducationItem> Education { get; set; } = new();

        [JsonPropertyName("projects")]
        public List<ProjectItem> Projects { get; set; } = new();

        [JsonPropertyName("events")]
        public List<EventItem> Events { get; set; } = new();

        [JsonPropertyName("certifications")]
        public List<CertificationItem> Certifications { get; set; } = new();
    }

    public sealed class PersonalInfo
    {
        [JsonPropertyName("full_name")]
        public string FullName { get; set; } = "";

        [JsonPropertyName("email")]
        public string Email { get; set; } = "";

        [JsonPropertyName("phone")]
        public string Phone { get; set; } = "";

        [JsonPropertyName("location")]
        public string Location { get; set; } = "";

        [JsonPropertyName("job_target")]
        public string JobTarget { get; set; } = "";
    }

    public sealed class Summary
    {
        [JsonPropertyName("sentences")]
        public List<SummarySentence> Sentences { get; set; } = new();
    }

    public sealed class SummarySentence
    {
        [JsonPropertyName("text")]
        public string Text { get; set; } = "";
    }

    public sealed class Skills
    {
        [JsonPropertyName("items")]
        public List<string> Items { get; set; } = new();

        [JsonPropertyName("text")]
        public string Text { get; set; } = "";
    }

    public sealed class WorkExperienceItem
    {
        [JsonPropertyName("job_title")]
        public string JobTitle { get; set; } = "";

        [JsonPropertyName("company")]
        public string Company { get; set; } = "";

        [JsonPropertyName("start_date")]
        public string StartDate { get; set; } = "";

        [JsonPropertyName("end_date")]
        public string EndDate { get; set; } = "";

        [JsonPropertyName("description_items")]
        public List<string> DescriptionItems { get; set; } = new();

        [JsonPropertyName("embedding_text")]
        public string EmbeddingText { get; set; } = "";
    }

    public sealed class EducationItem
    {
        [JsonPropertyName("degree")]
        public string Degree { get; set; } = "";

        [JsonPropertyName("institution")]
        public string Institution { get; set; } = "";

        [JsonPropertyName("start_date")]
        public string StartDate { get; set; } = "";

        [JsonPropertyName("end_date")]
        public string EndDate { get; set; } = "";

        [JsonPropertyName("description_items")]
        public List<string> DescriptionItems { get; set; } = new();

        [JsonPropertyName("embedding_text")]
        public string EmbeddingText { get; set; } = "";
    }

    public sealed class ProjectItem
    {
        [JsonPropertyName("project_name")]
        public string ProjectName { get; set; } = "";

        [JsonPropertyName("technologies")]
        public List<string> Technologies { get; set; } = new();

        [JsonPropertyName("description_items")]
        public List<string> DescriptionItems { get; set; } = new();

        [JsonPropertyName("embedding_text")]
        public string EmbeddingText { get; set; } = "";
    }

    public sealed class EventItem
    {
        [JsonPropertyName("event_name")]
        public string EventName { get; set; } = "";

        [JsonPropertyName("organization")]
        public string Organization { get; set; } = "";

        [JsonPropertyName("date")]
        public string Date { get; set; } = "";

        [JsonPropertyName("location")]
        public string Location { get; set; } = "";

        [JsonPropertyName("technologies")]
        public List<string> Technologies { get; set; } = new();

        [JsonPropertyName("description_items")]
        public List<string> DescriptionItems { get; set; } = new();

        [JsonPropertyName("embedding_text")]
        public  string EmbeddingText { get; set; } = "";
    }

    public sealed class CertificationItem
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = "";

        [JsonPropertyName("issuer")]
        public string Issuer { get; set; } = "";

        [JsonPropertyName("date")]
        public string Date { get; set; } = "";

        [JsonPropertyName("description_items")]
        public List<string> DescriptionItems { get; set; } = new();

        [JsonPropertyName("embedding_text")]
        public string EmbeddingText { get; set; } = "";
    }
}
