using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces.Jobseeker;

public interface IResumeUploadService
{
    Task<ResumeUploadResponse> EnqueueUploadAsync(
           Stream fileStream,
           string fileName,
           string contentType,
           Guid jobId,
           string appliedJobPosition,
           string? fullName = null,
           string? email = null,
           string? postalCode = null,
           string? location = null,
           Guid? applicantUserId = null,
           CancellationToken ct = default);
}
