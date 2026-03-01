using SkillSense.Application.Contracts.Jobseeker.Request;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces.Jobseeker
{
    public interface IJobSeekerService
    {
        Task<PagedResult<JobListItemResponse>> GetPublicJobsAsync(int pageNumber, int pageSize, string? search, string? sortBy, string? sortDir, CancellationToken ct = default);
        Task<JobListItemResponse?> GetPublicJobAsync(Guid id, CancellationToken ct = default);
        Task<ResumeUploadResponse> ApplyAsync(Guid jobId, ApplyToJobRequest request, Stream fileStream, string fileName, string contentType, CancellationToken ct = default);
        Task<PagedResult<object>> GetMyApplicationsAsync(Guid userId, int pageNumber, int pageSize, CancellationToken ct = default);
    }
}
