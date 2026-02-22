using System;
using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces
{
    public interface IResumeQueueService
    { 
       Task<ResumeUploadResponse> EnqueueUploadAsync(Stream fileStream, string fileName, string contentType, Guid jobId, string appliedJobPosition, CancellationToken ct = default);
       Task ProcessPendingAsync(CancellationToken ct = default);
    }
}
