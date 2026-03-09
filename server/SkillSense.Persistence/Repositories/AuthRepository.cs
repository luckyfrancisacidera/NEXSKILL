using Microsoft.EntityFrameworkCore;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Persistence.Repositories;

/// <summary>
/// Stores and retrieves password reset PIN data used by authentication workflows.
/// </summary>
public sealed class AuthRepository(SkillSenseDbContext dbContext) : IAuthRepository
{
    /// <summary>
    /// Returns every unused password reset PIN for the supplied user.
    /// </summary>
    public Task<List<PasswordResetPinEntity>> GetUnusedPasswordResetPinsAsync(Guid userId, CancellationToken ct = default)
        => dbContext.PasswordResetPins.Where(x => x.UserId == userId && !x.Used).ToListAsync(ct);

    /// <summary>
    /// Returns the latest password reset PIN for the supplied user.
    /// </summary>
    public Task<PasswordResetPinEntity?> GetLatestPasswordResetPinAsync(Guid userId, CancellationToken ct = default)
        => dbContext.PasswordResetPins
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

    /// <summary>
    /// Persists a newly generated password reset PIN.
    /// </summary>
    public async Task AddPasswordResetPinAsync(PasswordResetPinEntity entity, CancellationToken ct = default)
    {
        dbContext.PasswordResetPins.Add(entity);
        await dbContext.SaveChangesAsync(ct);
    }

    /// <summary>
    /// Commits pending password reset changes.
    /// </summary>
    public Task SaveChangesAsync(CancellationToken ct = default)
        => dbContext.SaveChangesAsync(ct);
}
