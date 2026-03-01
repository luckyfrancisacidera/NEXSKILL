using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Jobseeker;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services.Jobseeker;

public sealed class ResumeUploadService(
    IObjectStorageService objectStorageService,
    IResumeSubmissionRepository resumeSubmissionRepository) : IResumeUploadService
{
    public async Task<ResumeUploadResponse> EnqueueUploadAsync(
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
        CancellationToken ct = default)
    {
        var blobKey = await objectStorageService.UploadAsync(fileStream, fileName, contentType, ct);

        var submission = new ResumeSubmissionEntity
        {
            Id = Guid.NewGuid(),
            FileName = fileName,
            ContentType = contentType,
            BlobObjectKey = blobKey,
            JobId = jobId,
            AppliedJobPosition = appliedJobPosition,
            FullName = fullName,
            Email = email,
            PostalCode = postalCode,
            Location = location,
            ApplicantUserId = applicantUserId,
            Status = ResumeSubmissionStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        await resumeSubmissionRepository.AddAsync(submission, ct);
        return new ResumeUploadResponse { SubmissionId = submission.Id, Status = submission.Status.ToString() };
    }
}
