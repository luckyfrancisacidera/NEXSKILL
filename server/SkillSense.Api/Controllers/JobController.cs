using Microsoft.AspNetCore.Mvc;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;

namespace SkillSense.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobController: ControllerBase
    {
        private readonly IJobService _jobService;

        public JobController(IJobService jobService) => _jobService = jobService;

        [HttpPost]
        public async Task<ActionResult<JobResponse>> Create([FromBody] CreateJobRequest request, CancellationToken ct)
        {
            var result = await _jobService.CreateAsync(request, ct);
            return CreatedAtAction(nameof(Create), new { jobId = result.JobId }, result);
        }
    }
}
