using SkillSense.Application.Contracts.Recruiter.Request;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces.Recruiter
{
    public interface IRecruiterService
    {
        Task<RecruiterProfileResponse> GetProfileAsync(Guid recruiterId, CancellationToken ct = default);
        Task<RecruiterProfileResponse> UpsertProfileAsync(Guid recruiterId, RecruiterProfileRequest request, CancellationToken ct = default);
        Task<JobListItemResponse> CreateJobAsync(Guid recruiterId, CreateJobRequest request, CancellationToken ct = default);
        Task<JobListItemResponse> UpdateJobAsync(Guid recruiterId, Guid jobId, UpdateJobRequest request, CancellationToken ct = default);
        Task<PagedResult<JobListItemResponse>> GetJobsAsync(Guid recruiterId, int pageNumber, int pageSize, string? search, string? department, string? sortBy, string? sortDir, CancellationToken ct = default);
        Task<JobListItemResponse?> GetJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default);
        Task DeleteJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default);
        Task PublishJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default);
        Task CloseJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default);
        Task<RecruiterDashboardResponse> GetDashboardAsync(Guid recruiterId, DateTime? startDate, DateTime? endDate, string? department, string? jobRole, string? groupBy, CancellationToken ct = default);
        Task<ApplicantScoresResponse> GetApplicantScoresAsync(Guid recruiterId, Guid? jobId, string? department, string? stage, string? search, int? recommendedTopPercent, int pageNumber, int pageSize, CancellationToken ct = default); Task<ApplicantDetailResponse?> GetApplicantBySubmissionIdAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default);
        Task UpdateApplicantStatusAsync(Guid recruiterId, Guid submissionId, UpdateApplicantStageRequest request, CancellationToken ct = default);
        Task<BulkUpdateApplicantStageResponse> UpdateApplicantStatusesAsync(Guid recruiterId, BulkUpdateApplicantStageRequest request, CancellationToken ct = default);
    }
}
