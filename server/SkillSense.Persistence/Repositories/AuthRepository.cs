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

    public Task SaveChangesAsync(CancellationToken ct = default)
        => dbContext.SaveChangesAsync(ct);

    public Task<List<PasswordResetPinEntity>> GetActivePinsAsync(Guid userId, VerificationPinPurpose purpose, DateTime nowUtc, CancellationToken ct = default)
        => dbContext.PasswordResetPins
            .Where(pin =>
                pin.UserId == userId &&
                pin.Purpose == purpose &&
                !pin.Used &&
                pin.ExpiresAtUtc > nowUtc)
            .OrderByDescending(pin => pin.CreatedAtUtc)
            .ToListAsync(ct);

    public Task AddPasswordResetPinAsync(PasswordResetPinEntity pin, CancellationToken ct = default)
        => dbContext.PasswordResetPins.AddAsync(pin, ct).AsTask();
}
