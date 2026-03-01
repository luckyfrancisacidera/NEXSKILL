namespace SkillSense.Application.Interfaces;

public interface IResumeProcessingService
{
    Task<int> ProcessPendingBatchAsync(int batchSize, CancellationToken ct = default);
}
