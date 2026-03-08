namespace SkillSense.Domain.Entities;

public sealed class SavedJobEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid JobId { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public AppUser User { get; set; } = null!;
    public JobEntity Job { get; set; } = null!;
}
