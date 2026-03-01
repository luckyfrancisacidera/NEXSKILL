namespace SkillSense.Application.Interfaces;

public interface IResumeProcessingService
{
    Task ProcessPendingAsync(CancellationToken ct = default);
}
