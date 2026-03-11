using SkillSense.Application.Contracts.Jobseeker.Request;
using SkillSense.Application.Contracts.Jobseeker.Response;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces.Jobseeker
{
    public interface IJobSeekerService
    {
        Task<PagedResult<JobListItemResponse>> GetPublicJobsAsync(int pageNumber, int pageSize, string? search, string? sortBy, string? sortDir, CancellationToken ct = default);
        Task<JobListItemResponse?> GetPublicJobAsync(Guid id, CancellationToken ct = default);
        Task<ResumeUploadResponse> ApplyAsync(Guid jobId, ApplyToJobRequest request, Stream fileStream, string fileName, string contentType, Guid? applicantUserId, CancellationToken ct = default);
        Task<PagedResult<JobSeekerApplicationResponse>> GetMyApplicationsAsync(Guid userId, int pageNumber, int pageSize, string? search, string? status, DateTime? startDate, DateTime? endDate, CancellationToken ct = default);
        Task<object> GetDashboardSummaryAsync(Guid userId, string range, CancellationToken ct = default);
        Task<IReadOnlyList<object>> GetSavedJobsAsync(Guid userId, string? search, CancellationToken ct = default);
        Task SaveJobAsync(Guid userId, Guid jobId, CancellationToken ct = default);
        Task RemoveSavedJobAsync(Guid userId, Guid jobId, CancellationToken ct = default);
        Task<object> GetMyProfileAsync(Guid userId, CancellationToken ct = default);
        Task<object> UpdateMyProfileAsync(Guid userId, JobSeekerProfileRequest request, CancellationToken ct = default);
        Task<JobSeekerApplicationResponse> GetApplicationDetailAsync(Guid userId, Guid applicationId, CancellationToken ct = default);
        Task WithdrawApplicationAsync(Guid userId, Guid applicationId, CancellationToken ct = default);
    }
}
