using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Interfaces;

public interface INotificationRepository
{
    Task AddAsync(NotificationEntity notification, CancellationToken ct = default);
    Task<IReadOnlyList<NotificationEntity>> GetByUserAsync(Guid userId, CancellationToken ct = default);
    Task<NotificationEntity?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<NotificationEntity?> GetByIdForUserAsync(Guid id, Guid userId, CancellationToken ct = default);
    Task<NotificationEntity?> FindDuplicateAsync(Guid userId, NotificationType type, Guid? relatedEntityId, string title, string message, CancellationToken ct = default);
    Task<IReadOnlyList<NotificationEntity>> GetUnreadByUserAsync(Guid userId, CancellationToken ct = default);
    Task<int> DeleteByIdsForUserAsync(Guid userId, IReadOnlyCollection<Guid> notificationIds, CancellationToken ct = default);
    Task<int> DeleteAllForUserAsync(Guid userId, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
