namespace SkillSense.Domain.Entities;

public enum NotificationType
{
    Info = 0,
    Warning = 1,
    Success = 2,
    Error = 3,
}

public sealed class NotificationEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; } = NotificationType.Info;
    public bool IsRead { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public Guid? RelatedEntityId { get; set; }

    public AppUser User { get; set; } = null!;
}

