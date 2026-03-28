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
        Guid companyId = default,
        string? fullName = null,
        string? email = null,
        string? postalCode = null,
        string? location = null,
        Guid? jobSeekerUserId = null,
        CancellationToken ct = default);
    Task<bool> HasActiveApplicationAsync(Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default);
}
