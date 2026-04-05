using SkillSense.Application.Contracts.Notifications;
using SkillSense.Application.Interfaces;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services.Notifications;

public sealed class NotificationService(
    INotificationRepository notificationRepository,
    IDateTimeProvider dateTimeProvider) : INotificationService
{
    // Creates notification.
    public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationRequest request, CancellationToken ct = default)
    {
        var title = request.Title.Trim();
        var message = request.Message.Trim();
        var existing = await notificationRepository.FindDuplicateAsync(
            request.UserId,
            request.Type,
            request.RelatedEntityId,
            title,
            message,
            ct);

        if (existing is not null)
        {
            return Map(existing);
        }

        var entity = new NotificationEntity
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Title = title,
            Message = message,
            Type = request.Type,
            IsRead = false,
            CreatedAtUtc = dateTimeProvider.UtcNow,
            RelatedEntityId = request.RelatedEntityId,
        };

        await notificationRepository.AddAsync(entity, ct);
        await notificationRepository.SaveChangesAsync(ct);
        return Map(entity);
    }

    // Loads notifications by user.
    public async Task<IReadOnlyList<NotificationDto>> GetNotificationsByUserAsync(Guid userId, CancellationToken ct = default)
    {
        var items = await notificationRepository.GetByUserAsync(userId, ct);
        return items.Select(Map).ToList();
    }

    // Marks as read.
    public async Task MarkAsReadAsync(Guid userId, Guid notificationId, CancellationToken ct = default)
    {
        var entity = await notificationRepository.GetByIdForUserAsync(notificationId, userId, ct)
            ?? throw new KeyNotFoundException("Notification not found.");

        if (entity.IsRead)
        {
            return;
        }

        entity.IsRead = true;
        await notificationRepository.SaveChangesAsync(ct);
    }

    // Marks all as read.
    public async Task MarkAllAsReadAsync(Guid userId, CancellationToken ct = default)
    {
        var unreadItems = await notificationRepository.GetUnreadByUserAsync(userId, ct);
        if (unreadItems.Count == 0)
        {
          return;
        }

        foreach (var item in unreadItems)
        {
            item.IsRead = true;
        }

        await notificationRepository.SaveChangesAsync(ct);
    }

    // Deletes notifications.
    public async Task<int> DeleteNotificationsAsync(Guid userId, IReadOnlyList<Guid> notificationIds, CancellationToken ct = default)
    {
        var validIds = notificationIds
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToArray();

        if (validIds.Length == 0)
        {
            return 0;
        }

        var deletedCount = await notificationRepository.DeleteByIdsForUserAsync(userId, validIds, ct);
        if (deletedCount == 0)
        {
            return 0;
        }

        await notificationRepository.SaveChangesAsync(ct);
        return deletedCount;
    }

    // Deletes all notifications.
    public async Task<int> DeleteAllNotificationsAsync(Guid userId, CancellationToken ct = default)
    {
        var deletedCount = await notificationRepository.DeleteAllForUserAsync(userId, ct);
        if (deletedCount == 0)
        {
            return 0;
        }

        await notificationRepository.SaveChangesAsync(ct);
        return deletedCount;
    }

    // Handles map.
    private static NotificationDto Map(NotificationEntity entity) => new()
    {
        Id = entity.Id,
        UserId = entity.UserId,
        Title = entity.Title,
        Message = entity.Message,
        Type = entity.Type,
        IsRead = entity.IsRead,
        CreatedAtUtc = entity.CreatedAtUtc,
        RelatedEntityId = entity.RelatedEntityId,
    };
}
