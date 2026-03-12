namespace SkillSense.Persistence.Models;

/// <summary>
/// Represents the company-scoped access data needed to evaluate login eligibility.
/// </summary>
public sealed class AuthUserCompanyAccessData
{
    public Guid CompanyId { get; set; }
    public bool CompanyIsActive { get; set; }
}
