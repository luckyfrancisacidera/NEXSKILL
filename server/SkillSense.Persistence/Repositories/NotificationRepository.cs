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

    public Task<NotificationEntity?> GetByIdForUserAsync(Guid id, Guid userId, CancellationToken ct = default)
        => dbContext.Notifications.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);

    public Task<NotificationEntity?> FindDuplicateAsync(Guid userId, NotificationType type, Guid? relatedEntityId, string title, string message, CancellationToken ct = default)
        => dbContext.Notifications.FirstOrDefaultAsync(
            x => x.UserId == userId
                && x.Type == type
                && x.RelatedEntityId == relatedEntityId
                && x.Title == title
                && x.Message == message,
            ct);

    public async Task<IReadOnlyList<NotificationEntity>> GetUnreadByUserAsync(Guid userId, CancellationToken ct = default)
        => await dbContext.Notifications
            .Where(x => x.UserId == userId && !x.IsRead)
            .ToListAsync(ct);

    public async Task<int> DeleteByIdsForUserAsync(Guid userId, IReadOnlyCollection<Guid> notificationIds, CancellationToken ct = default)
    {
        if (notificationIds.Count == 0)
        {
            return 0;
        }

        var items = await dbContext.Notifications
            .Where(x => x.UserId == userId && notificationIds.Contains(x.Id))
            .ToListAsync(ct);

        if (items.Count == 0)
        {
            return 0;
        }

        dbContext.Notifications.RemoveRange(items);
        return items.Count;
    }

    public async Task<int> DeleteAllForUserAsync(Guid userId, CancellationToken ct = default)
    {
        var items = await dbContext.Notifications
            .Where(x => x.UserId == userId)
            .ToListAsync(ct);

        if (items.Count == 0)
        {
            return 0;
        }

        dbContext.Notifications.RemoveRange(items);
        return items.Count;
    }

    public Task SaveChangesAsync(CancellationToken ct = default)
        => dbContext.SaveChangesAsync(ct);
}
