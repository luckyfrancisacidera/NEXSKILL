using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Interfaces;

/// <summary>
/// Encapsulates persistence operations required by authentication and password reset workflows.
/// </summary>
public interface IAuthRepository
{
    /// <summary>
    /// Returns all unused password reset PINs for a user.
    /// </summary>
    Task<List<PasswordResetPinEntity>> GetUnusedPasswordResetPinsAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Returns the most recently created password reset PIN for a user.
    /// </summary>
    Task<PasswordResetPinEntity?> GetLatestPasswordResetPinAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Persists a newly generated password reset PIN.
    /// </summary>
    Task AddPasswordResetPinAsync(PasswordResetPinEntity entity, CancellationToken ct = default);

    /// <summary>
    /// Commits pending password reset changes.
    /// </summary>
    Task SaveChangesAsync(CancellationToken ct = default);
}
