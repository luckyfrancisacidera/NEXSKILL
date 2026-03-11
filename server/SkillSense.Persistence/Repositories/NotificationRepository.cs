using Microsoft.EntityFrameworkCore;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Persistence.Repositories;

public sealed class NotificationRepository(SkillSenseDbContext dbContext) : INotificationRepository
{
    public async Task AddAsync(NotificationEntity notification, CancellationToken ct = default)
    {
        await dbContext.Notifications.AddAsync(notification, ct);
    }

    public async Task<IReadOnlyList<NotificationEntity>> GetByUserAsync(Guid userId, CancellationToken ct = default)
        => await dbContext.Notifications
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Take(100)
            .ToListAsync(ct);

    public Task<NotificationEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => dbContext.Notifications.FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => dbContext.SaveChangesAsync(ct);
}

