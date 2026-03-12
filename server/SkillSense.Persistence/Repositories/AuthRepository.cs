using Microsoft.EntityFrameworkCore;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Persistence.Repositories;

/// <summary>
/// Stores and retrieves authentication and password reset data.
/// </summary>
public sealed class AuthRepository(SkillSenseDbContext dbContext) : IAuthRepository
{
    /// <summary>
    /// Returns company-scoped access data for recruiter and company admin accounts.
    /// </summary>
    public async Task<AuthUserCompanyAccessData?> GetUserCompanyAccessAsync(Guid userId, CancellationToken ct = default)
    {
        var recruiterAccess = await dbContext.RecruiterProfiles
            .AsNoTracking()
            .Where(profile => profile.UserId == userId)
            .Join(dbContext.Companies.AsNoTracking(), profile => profile.CompanyId, company => company.Id, (profile, company) => new AuthUserCompanyAccessData
            {
                CompanyId = company.Id,
                CompanyIsActive = company.IsActive,
            })
            .FirstOrDefaultAsync(ct);

        if (recruiterAccess is not null)
        {
            return recruiterAccess;
        }

        return await dbContext.AdminProfiles
            .AsNoTracking()
            .Where(profile => profile.UserId == userId && profile.CompanyId.HasValue)
            .Join(dbContext.Companies.AsNoTracking(), profile => profile.CompanyId!.Value, company => company.Id, (profile, company) => new AuthUserCompanyAccessData
            {
                CompanyId = company.Id,
                CompanyIsActive = company.IsActive,
            })
            .FirstOrDefaultAsync(ct);
    }

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
