using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces;

public interface IResumeUploadService
{
    Task<ResumeUploadResponse> EnqueueUploadAsync(Stream fileStream, string fileName, string contentType, Guid jobId, string appliedJobPosition, CancellationToken ct = default);
}
