namespace SkillSense.Application.Interfaces;

/// <summary>
/// Provides access to the current UTC time for time-sensitive workflows.
/// </summary>
public interface IDateTimeProvider
{
    /// <summary>
    /// Gets the current coordinated universal time.
    /// </summary>
    DateTime UtcNow { get; }
}
