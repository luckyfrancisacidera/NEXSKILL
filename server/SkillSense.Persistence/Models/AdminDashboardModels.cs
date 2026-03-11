namespace SkillSense.Persistence.Models;

public sealed class SuperAdminDashboardData
{
    public int TotalCompanies { get; set; }
    public int ActiveCompanies { get; set; }
    public int TotalRecruiters { get; set; }
    public int ActiveRecruiters { get; set; }
    public int TotalJobs { get; set; }
    public int ActiveJobs { get; set; }
    public IReadOnlyList<AdminCompanyOverviewData> Companies { get; set; } = [];
    public IReadOnlyList<AdminRecruiterOverviewData> RecentRecruiters { get; set; } = [];
}

public sealed class CompanyAdminDashboardData
{
    public AdminCompanyIdentityData Company { get; set; } = new();
    public int TotalRecruiters { get; set; }
    public int ActiveRecruiters { get; set; }
    public int ActiveJobs { get; set; }
    public int UpcomingInterviews { get; set; }
    public int TotalOffers { get; set; }
    public int TotalHires { get; set; }
    public IReadOnlyList<AdminRecruiterOverviewData> Recruiters { get; set; } = [];
}

public sealed class AdminCompanyIdentityData
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? PrimaryEmail { get; set; }
    public string? Location { get; set; }
    public bool IsActive { get; set; }
}

public sealed class AdminCompanyOverviewData
{
    public Guid CompanyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? PrimaryEmail { get; set; }
    public bool IsActive { get; set; }
    public int RecruiterCount { get; set; }
    public int ActiveJobs { get; set; }
    public int UpcomingInterviews { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}

public sealed class AdminRecruiterOverviewData
{
    public Guid ProfileId { get; set; }
    public Guid UserId { get; set; }
    public Guid CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public int TotalJobs { get; set; }
    public int ActiveJobs { get; set; }
    public int UpcomingInterviews { get; set; }
    public int TotalHires { get; set; }
}
