namespace SkillSense.Persistence.Models;

public sealed class RecruiterDashboardFilterData
{
    public required IReadOnlyList<string> Departments { get; init; }
    public required IReadOnlyList<string> JobRoles { get; init; }
    public required IReadOnlyDictionary<string, IReadOnlyList<string>> JobRolesByDepartment { get; init; }
}

public sealed class DashboardOfferMetricData
{
    public Guid ApplicationId { get; init; }
    public decimal SalaryAmount { get; init; }
    public string SalaryType { get; init; } = string.Empty;
    public string Currency { get; init; } = string.Empty;
}
