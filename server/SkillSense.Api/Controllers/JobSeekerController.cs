using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSense.Application.Contracts.Jobseeker.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces.Jobseeker;
using SkillSense.Application.Validators;

namespace SkillSense.Api.Controllers
{
    [Route("api/jobseeker")]
    [ApiController]
    [Authorize(Roles = "JobSeeker,Admin")]
    public sealed class JobSeekerController(IJobSeekerService jobSeekerService) : ControllerBase
    {
        [HttpPost("jobs/{jobId:guid}/apply")]
        public async Task<ActionResult<ResumeUploadResponse>> Apply(Guid jobId, [FromForm] string full_name, [FromForm] string email, [FromForm] string postal_code, [FromForm] string location, [FromForm] IFormFile resume_file, CancellationToken ct)
        {
            var (isValid, error) = ResumeFileValidator.Validate(resume_file?.FileName ?? "", resume_file?.ContentType ?? "", resume_file?.Length ?? 0);
            if (!isValid) return BadRequest(error);

            await using var stream = resume_file!.OpenReadStream();
            var result = await jobSeekerService.ApplyAsync(jobId, new ApplyToJobRequest
            {
                FullName = full_name,
                Email = email,
                PostalCode = postal_code,
                Location = location
            }, stream, resume_file.FileName, resume_file.ContentType, ct);

            return Accepted(result);
        }

        [HttpGet("applications")]
        public async Task<ActionResult<PagedResult<object>>> MyApplications([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
        {
            var userId = Guid.Parse(User.FindFirstValue("userId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException());
            return Ok(await jobSeekerService.GetMyApplicationsAsync(userId, pageNumber, pageSize, ct));
        }
    }
}