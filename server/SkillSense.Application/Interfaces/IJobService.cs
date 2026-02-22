using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces
{
    public interface IJobService
    {
        Task<JobResponse> CreateAsync(CreateJobRequest request, CancellationToken ct = default);
    }
}
