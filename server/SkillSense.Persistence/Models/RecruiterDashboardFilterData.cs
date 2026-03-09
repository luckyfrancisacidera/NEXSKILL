namespace SkillSense.Persistence.Models;

public sealed class RecruiterDashboardFilterData
{
    public required IReadOnlyList<string> Departments { get; init; }
    public required IReadOnlyList<string> JobRoles { get; init; }
    public required IReadOnlyDictionary<string, IReadOnlyList<string>> JobRolesByDepartment { get; init; }
}
