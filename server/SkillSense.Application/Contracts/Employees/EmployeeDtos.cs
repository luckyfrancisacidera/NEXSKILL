using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Employees;

public sealed class EmployeeRecordResponse
{
    [JsonPropertyName("hire_id")]
    public Guid HireId { get; set; }

    [JsonPropertyName("resume_submission_id")]
    public Guid ResumeSubmissionId { get; set; }

    [JsonPropertyName("job_id")]
    public Guid JobId { get; set; }

    [JsonPropertyName("jobseeker_user_id")]
    public Guid? JobSeekerUserId { get; set; }

    [JsonPropertyName("hired_by_recruiter_id")]
    public Guid? HiredByRecruiterId { get; set; }

    [JsonPropertyName("accepted_offer_id")]
    public Guid? AcceptedOfferId { get; set; }

    [JsonPropertyName("hire_status")]
    public string HireStatus { get; set; } = "Active";

    [JsonPropertyName("employee_name")]
    public string EmployeeName { get; set; } = "Unknown Applicant";

    [JsonPropertyName("employee_email")]
    public string EmployeeEmail { get; set; } = "-";

    [JsonPropertyName("recruiter_name")]
    public string RecruiterName { get; set; } = "Unknown Recruiter";

    [JsonPropertyName("recruiter_email")]
    public string? RecruiterEmail { get; set; }

    [JsonPropertyName("job_title")]
    public string JobTitle { get; set; } = string.Empty;

    [JsonPropertyName("department")]
    public string Department { get; set; } = "Unassigned";

    [JsonPropertyName("offer_title")]
    public string? OfferTitle { get; set; }

    [JsonPropertyName("offer_salary_text")]
    public string? OfferSalaryText { get; set; }

    [JsonPropertyName("hire_date_utc")]
    public DateTime HireDateUtc { get; set; }
}
