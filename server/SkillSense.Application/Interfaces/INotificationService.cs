using SkillSense.Application.Contracts.Notifications;

namespace SkillSense.Application.Interfaces;

public interface INotificationService
{
    Task<NotificationDto> CreateNotificationAsync(CreateNotificationRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<NotificationDto>> GetNotificationsByUserAsync(Guid userId, CancellationToken ct = default);
    Task MarkAsReadAsync(Guid userId, Guid notificationId, CancellationToken ct = default);
    Task MarkAllAsReadAsync(Guid userId, CancellationToken ct = default);
    Task<int> DeleteNotificationsAsync(Guid userId, IReadOnlyList<Guid> notificationIds, CancellationToken ct = default);
    Task<int> DeleteAllNotificationsAsync(Guid userId, CancellationToken ct = default);
}
