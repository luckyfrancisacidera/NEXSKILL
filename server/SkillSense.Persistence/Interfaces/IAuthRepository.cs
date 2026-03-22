using SkillSense.Persistence.Models;
using SkillSense.Domain.Entities;

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

    /// <summary>
    /// Persists authentication-related state changes tracked in the current request scope.
    /// </summary>
    Task SaveChangesAsync(CancellationToken ct = default);

    /// <summary>
    /// Returns active unused verification PIN records for a user and purpose.
    /// </summary>
    Task<List<PasswordResetPinEntity>> GetActivePinsAsync(Guid userId, VerificationPinPurpose purpose, DateTime nowUtc, CancellationToken ct = default);

    /// <summary>
    /// Adds a newly created verification PIN record.
    /// </summary>
    Task AddPasswordResetPinAsync(PasswordResetPinEntity pin, CancellationToken ct = default);
}
