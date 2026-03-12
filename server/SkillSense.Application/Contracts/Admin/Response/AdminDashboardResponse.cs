using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Contracts.Admin.Response;

public sealed class SuperAdminDashboardResponse
{
    public SuperAdminDashboardSummaryResponse Summary { get; set; } = new();
    public PagedResult<AdminCompanyOverviewResponse> Companies { get; set; } = new();
    public PagedResult<AdminCompanyAdminOverviewResponse> CompanyAdmins { get; set; } = new();
    public PagedResult<AdminRecruiterOverviewResponse> Recruiters { get; set; } = new();
}

public sealed class SuperAdminDashboardSummaryResponse
{
    public int TotalCompanies { get; set; }
    public int ActiveCompanies { get; set; }
    public int TotalRecruiters { get; set; }
    public int ActiveRecruiters { get; set; }
    public int TotalJobs { get; set; }
    public int ActiveJobs { get; set; }
}

public sealed class CompanyAdminDashboardResponse
{
    public AdminCompanyIdentityResponse Company { get; set; } = new();
    public CompanyAdminDashboardSummaryResponse Summary { get; set; } = new();
    public PagedResult<AdminRecruiterOverviewResponse> Recruiters { get; set; } = new();
}

public sealed class CompanyAdminDashboardSummaryResponse
{
    public int TotalRecruiters { get; set; }
    public int ActiveRecruiters { get; set; }
    public int ActiveJobs { get; set; }
    public int UpcomingInterviews { get; set; }
    public int TotalOffers { get; set; }
    public int TotalHires { get; set; }
}

public sealed class AdminCompanyIdentityResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? PrimaryEmail { get; set; }
    public string? Location { get; set; }
    public bool IsActive { get; set; }
}

public sealed class AdminCompanyOverviewResponse
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

public sealed class AdminCompanyAdminOverviewResponse
{
    public Guid UserId { get; set; }
    public Guid CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public sealed class AdminRecruiterOverviewResponse
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

public sealed class AdminCompanyAccountResponse
{
    public AdminCompanyOverviewResponse Company { get; set; } = new();
    public AdminCompanyAdminOverviewResponse CompanyAdmin { get; set; } = new();
}
