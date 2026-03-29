namespace SkillSense.Persistence.Models;

public sealed class SuperAdminDashboardData
{
    public int TotalCompanies { get; set; }
    public int ActiveCompanies { get; set; }
    public int TotalRecruiters { get; set; }
    public int ActiveRecruiters { get; set; }
    public int TotalJobs { get; set; }
    public int ActiveJobs { get; set; }
    public PagedData<AdminCompanyOverviewData> Companies { get; set; } = new();
    public PagedData<AdminCompanyAdminOverviewData> CompanyAdmins { get; set; } = new();
    public PagedData<AdminRecruiterOverviewData> Recruiters { get; set; } = new();
}

public sealed class SuperAdminUsersPageData
{
    public int TotalCompanies { get; set; }
    public int ActiveCompanies { get; set; }
    public int TotalRecruiters { get; set; }
    public int ActiveRecruiters { get; set; }
    public int TotalJobs { get; set; }
    public int ActiveJobs { get; set; }
    public PagedData<AdminUserOverviewData> Users { get; set; } = new();
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
    public PagedData<AdminRecruiterOverviewData> Recruiters { get; set; } = new();
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

public sealed class AdminCompanyAdminOverviewData
{
    public Guid UserId { get; set; }
    public Guid CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAtUtc { get; set; }
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

public sealed class AdminUserOverviewData
{
    public Guid UserId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfileFullName { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int ApplicationCount { get; set; }
    public DateTime JoinedAtUtc { get; set; }
}
