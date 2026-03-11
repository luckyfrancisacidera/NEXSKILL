using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Interfaces;

public interface INotificationRepository
{
    Task AddAsync(NotificationEntity notification, CancellationToken ct = default);
    Task<IReadOnlyList<NotificationEntity>> GetByUserAsync(Guid userId, CancellationToken ct = default);
    Task<NotificationEntity?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}

