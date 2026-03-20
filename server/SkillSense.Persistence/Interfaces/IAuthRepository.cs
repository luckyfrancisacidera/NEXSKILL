using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Interfaces;

/// <summary>
/// Encapsulates persistence operations required by authentication and password reset workflows.
/// </summary>
public interface IAuthRepository
{
    /// <summary>
    /// Returns company-scoped access data for recruiter and company admin accounts.
    /// </summary>
    Task<AuthUserCompanyAccessData?> GetUserCompanyAccessAsync(Guid userId, CancellationToken ct = default);
}
