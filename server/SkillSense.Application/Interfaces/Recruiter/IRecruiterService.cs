using SkillSense.Application.Contracts.Recruiter.Request;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Contracts.Interviews;
using SkillSense.Application.Contracts.Offers;

namespace SkillSense.Application.Interfaces.Recruiter;

public interface IRecruiterService
{
    Task<RecruiterProfileResponse> GetProfileAsync(Guid recruiterId, CancellationToken ct = default);
    Task<RecruiterProfileResponse> UpsertProfileAsync(Guid recruiterId, RecruiterProfileRequest request, CancellationToken ct = default);
    Task<JobListItemResponse> CreateJobAsync(Guid recruiterId, CreateJobRequest request, CancellationToken ct = default);
    Task<JobListItemResponse> CreateJobAsync(Guid companyId, Guid recruiterId, CreateJobRequest request, CancellationToken ct = default);
    Task<JobListItemResponse> DuplicateJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default);
    Task<JobListItemResponse> DuplicateJobAsync(Guid companyId, Guid recruiterId, Guid jobId, CancellationToken ct = default);
    Task<JobListItemResponse> UpdateJobAsync(Guid recruiterId, Guid jobId, UpdateJobRequest request, CancellationToken ct = default);
    Task<JobListItemResponse> UpdateJobAsync(Guid companyId, Guid recruiterId, Guid jobId, UpdateJobRequest request, CancellationToken ct = default);
    Task<JobListItemResponse> UpdateJobStatusAsync(Guid recruiterId, Guid jobId, UpdateJobStatusRequest request, CancellationToken ct = default);
    Task<JobListItemResponse> UpdateJobStatusAsync(Guid companyId, Guid recruiterId, Guid jobId, UpdateJobStatusRequest request, CancellationToken ct = default);
    Task<PagedResult<JobListItemResponse>> GetJobsAsync(Guid recruiterId, int pageNumber, int pageSize, string? search, string? department, string? sortBy, string? sortDir, CancellationToken ct = default);
    Task<PagedResult<JobListItemResponse>> GetJobsAsync(Guid companyId, Guid recruiterId, int pageNumber, int pageSize, string? search, string? department, string? sortBy, string? sortDir, CancellationToken ct = default);
    Task<JobListItemResponse?> GetJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default);
    Task<JobListItemResponse?> GetJobAsync(Guid companyId, Guid recruiterId, Guid jobId, CancellationToken ct = default);
    Task DeleteJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default);
    Task DeleteJobAsync(Guid companyId, Guid recruiterId, Guid jobId, CancellationToken ct = default);
    Task<RecruiterDashboardResponse> GetDashboardAsync(Guid recruiterId, DateTime? startDate, DateTime? endDate, string? department, string? jobRole, string? groupBy, CancellationToken ct = default);
    Task<RecruiterDashboardResponse> GetDashboardAsync(Guid companyId, Guid recruiterId, DateTime? startDate, DateTime? endDate, string? department, string? jobRole, string? groupBy, CancellationToken ct = default);
    Task<ApplicantScoresResponse> GetApplicantScoresAsync(Guid recruiterId, Guid? jobId, string? department, string? stage, string? search, int? recommendedTopPercent, int pageNumber, int pageSize, CancellationToken ct = default);
    Task<ApplicantScoresResponse> GetApplicantScoresAsync(Guid companyId, Guid recruiterId, Guid? jobId, string? department, string? stage, string? search, int? recommendedTopPercent, int pageNumber, int pageSize, CancellationToken ct = default);
    Task<ApplicantDetailResponse?> GetApplicantBySubmissionIdAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default);
    Task<ApplicantDetailResponse?> GetApplicantBySubmissionIdAsync(Guid companyId, Guid recruiterId, Guid submissionId, CancellationToken ct = default);
    Task<ApplicantResumeAccessResult> GetApplicantResumeAccessAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default);
    Task<ApplicantResumeAccessResult> GetApplicantResumeAccessAsync(Guid companyId, Guid recruiterId, Guid submissionId, CancellationToken ct = default);
    Task<IReadOnlyList<ShortlistedCandidateOptionDto>> GetShortlistedCandidatesByJobAsync(Guid companyId, Guid recruiterId, Guid jobId, string? department = null, CancellationToken ct = default);
    Task<ApplicantScoreItemResponse> UpdateApplicantStatusAsync(Guid recruiterId, Guid submissionId, UpdateApplicantStageRequest request, CancellationToken ct = default);
    Task<ApplicantScoreItemResponse> UpdateApplicantStatusAsync(Guid companyId, Guid recruiterId, Guid submissionId, UpdateApplicantStageRequest request, CancellationToken ct = default);
    Task<ApplicantScoreItemResponse> CreateOfferAsync(Guid recruiterId, Guid submissionId, SendOfferRequest request, CancellationToken ct = default);
    Task<ApplicantScoreItemResponse> CreateOfferAsync(Guid companyId, Guid recruiterId, Guid submissionId, SendOfferRequest request, CancellationToken ct = default);
    Task<OfferResponse?> GetOfferAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default);
    Task<OfferResponse?> GetOfferAsync(Guid companyId, Guid recruiterId, Guid submissionId, CancellationToken ct = default);
    Task<ApplicantScoreItemResponse> MarkHiredAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default);
    Task<ApplicantScoreItemResponse> MarkHiredAsync(Guid companyId, Guid recruiterId, Guid submissionId, CancellationToken ct = default);
    Task<BulkUpdateApplicantStageResponse> UpdateApplicantStatusesAsync(Guid recruiterId, BulkUpdateApplicantStageRequest request, CancellationToken ct = default);
    Task<BulkUpdateApplicantStageResponse> UpdateApplicantStatusesAsync(Guid companyId, Guid recruiterId, BulkUpdateApplicantStageRequest request, CancellationToken ct = default);
}
