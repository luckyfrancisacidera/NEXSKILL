using SkillSense.Application.Interfaces;

namespace SkillSense.Application.Services;

public sealed class SystemDateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
