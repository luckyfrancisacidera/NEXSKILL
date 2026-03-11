using SkillSense.Application.Contracts.Notifications;

namespace SkillSense.Application.Interfaces;

public interface INotificationService
{
    Task<NotificationDto> CreateNotificationAsync(CreateNotificationRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<NotificationDto>> GetNotificationsByUserAsync(Guid userId, CancellationToken ct = default);
    Task MarkAsReadAsync(Guid notificationId, CancellationToken ct = default);
}

