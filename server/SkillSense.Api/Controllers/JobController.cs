using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces.Jobseeker;

namespace SkillSense.Api.Controllers
{
    [Route("api/jobs")]
    [ApiController]
    public sealed class JobController(IJobSeekerService jobSeekerService) : ControllerBase
    {
        // Loads jobs.
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<PagedResult<JobListItemResponse>>> GetJobs([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] string? sortBy = null, [FromQuery] string? sortDir = null, CancellationToken ct = default)
            => Ok(await jobSeekerService.GetPublicJobsAsync(pageNumber, pageSize, search, sortBy, sortDir, ct));

        // Loads by ID.
        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<ActionResult<JobListItemResponse>> GetById(Guid id, CancellationToken ct)
        {
            var job = await jobSeekerService.GetPublicJobAsync(id, ct);
            return job is null ? NotFound() : Ok(job);
        }
    }
}
