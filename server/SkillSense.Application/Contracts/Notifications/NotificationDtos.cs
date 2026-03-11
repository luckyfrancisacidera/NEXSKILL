using SkillSense.Domain.Entities;

namespace SkillSense.Application.Contracts.Notifications;

public sealed class NotificationDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public NotificationType Type { get; init; }
    public bool IsRead { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public Guid? RelatedEntityId { get; init; }
}

public sealed class CreateNotificationRequest
{
    public Guid UserId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public NotificationType Type { get; init; } = NotificationType.Info;
    public Guid? RelatedEntityId { get; init; }
}

