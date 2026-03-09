using SkillSense.Application.Interfaces;

namespace SkillSense.Application.Services.System;

/// <summary>
/// Supplies the current UTC timestamp for time-sensitive workflows.
/// </summary>
public sealed class SystemDateTimeProvider : IDateTimeProvider
{
    /// <summary>
    /// Gets the current coordinated universal time.
    /// </summary>
    public DateTime UtcNow => DateTime.UtcNow;
}
