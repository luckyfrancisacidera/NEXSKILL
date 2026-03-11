using SkillSense.Application.Contracts.Notifications;
using SkillSense.Application.Interfaces;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services.Notifications;

public sealed class NotificationService(
    INotificationRepository notificationRepository,
    IDateTimeProvider dateTimeProvider) : INotificationService
{
    public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationRequest request, CancellationToken ct = default)
    {
        var entity = new NotificationEntity
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Title = request.Title.Trim(),
            Message = request.Message.Trim(),
            Type = request.Type,
            IsRead = false,
            CreatedAtUtc = dateTimeProvider.UtcNow,
            RelatedEntityId = request.RelatedEntityId,
        };

        await notificationRepository.AddAsync(entity, ct);
        await notificationRepository.SaveChangesAsync(ct);
        return Map(entity);
    }

    public async Task<IReadOnlyList<NotificationDto>> GetNotificationsByUserAsync(Guid userId, CancellationToken ct = default)
    {
        var items = await notificationRepository.GetByUserAsync(userId, ct);
        return items.Select(Map).ToList();
    }

    public async Task MarkAsReadAsync(Guid notificationId, CancellationToken ct = default)
    {
        var entity = await notificationRepository.GetByIdAsync(notificationId, ct)
            ?? throw new KeyNotFoundException("Notification not found.");

        entity.IsRead = true;
        await notificationRepository.SaveChangesAsync(ct);
    }

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

