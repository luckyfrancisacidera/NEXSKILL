using SkillSense.Application.Contracts.Recruiter.Request;
using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces;

/// <summary>
/// Provides job creation operations used by application entry points.
/// </summary>
public interface IJobService
{
    /// <summary>
    /// Creates a job and returns the persisted response contract.
    /// </summary>
    Task<JobResponse> CreateAsync(CreateJobRequest request, CancellationToken ct = default);
}
