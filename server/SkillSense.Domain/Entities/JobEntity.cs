namespace SkillSense.Domain.Entities;

public sealed class JobEntity
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public Guid RecruiterId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DescriptionEmbeddingJson { get; set; } = string.Empty;

    public string ResponsibilitiesText { get; set; } = string.Empty;
    public string RequiredSkillsJson { get; set; } = "[]";
    public string PreferredSkillsJson { get; set; } = "[]";
    public string? ExperienceLevel { get; set; }
    public int? MinYears { get; set; }
    public string? Education { get; set; }
    public string? Department { get; set; }
    public string? Benefits { get; set; }
    public decimal? SalaryMinPerAnnum { get; set; }
    public decimal? SalaryMaxPerAnnum { get; set; }
    public string Currency { get; set; } = "PHP";
    public string Location { get; set; } = string.Empty;
    public string? Schedule { get; set; }
    public WorkSetup WorkSetup { get; set; } = WorkSetup.Onsite;
    public EmploymentType EmploymentType { get; set; } = EmploymentType.FullTime;
    public DateTime? PostedDateUtc { get; set; }
    public string? CompanyNameSnapshot { get; set; }
    public string? CompanyEmailSnapshot { get; set; }

    public string JobDescriptionStructuredJson { get; set; } = "{}";
    public int NumberOfVacancies { get; set; } = 1;

    public JobStatus Status { get; set; } = JobStatus.Draft;
    public DateTime CreatedAtUtc { get; set; }
}

public enum WorkSetup
{
    Onsite = 0,
    Hybrid = 1,
    Remote = 2,
}

public enum EmploymentType
{
    FullTime = 0,
    PartTime = 1,
    Contract = 2,
    Internship = 3,
    Temporary = 4,
}

public enum JobStatus
{   
    Draft = 0,
    Published = 1,
    Closed = 2,
}
