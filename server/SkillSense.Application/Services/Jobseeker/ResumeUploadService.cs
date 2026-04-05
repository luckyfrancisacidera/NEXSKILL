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
    // Handles enqueue upload.
    public async Task<ResumeUploadResponse> EnqueueUploadAsync(
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
            CompanyId = companyId,
            AppliedJobPosition = appliedJobPosition,
            FullName = fullName,
            Email = email,
            PostalCode = postalCode,
            Location = location,
            JobSeekerUserId = jobSeekerUserId,
            Status = ResumeSubmissionStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        await resumeSubmissionRepository.AddAsync(submission, ct);
        return new ResumeUploadResponse
        {
            SubmissionId = submission.Id,
            Status = submission.Status.ToString(),
            Message = "Application queued for processing.",
        };
    }

    // Determines whether active application.
    public Task<bool> HasActiveApplicationAsync(Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default)
        => resumeSubmissionRepository.ExistsActiveApplicationAsync(jobId, jobSeekerUserId, ct);
}
