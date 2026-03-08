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
            var userId = GetUserId();

            await using var stream = resume_file!.OpenReadStream();
            var result = await jobSeekerService.ApplyAsync(jobId, new ApplyToJobRequest
            {
                FullName = full_name,
                Email = email,
                PostalCode = postal_code,
                Location = location
            }, stream, resume_file.FileName, resume_file.ContentType, userId, ct);

            return Accepted(result);
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> Dashboard([FromQuery] string range = "this_week", CancellationToken ct = default)
            => Ok(await jobSeekerService.GetDashboardSummaryAsync(GetUserId(), range, ct));

        [HttpGet("applications")]
        public async Task<ActionResult<PagedResult<object>>> MyApplications([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] string? status = null, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null, CancellationToken ct = default)
            => Ok(await jobSeekerService.GetMyApplicationsAsync(GetUserId(), pageNumber, pageSize, search, status, startDate, endDate, ct));

        [HttpGet("applications/{applicationId:guid}")]
        public async Task<IActionResult> GetApplication(Guid applicationId, CancellationToken ct = default)
            => Ok(await jobSeekerService.GetApplicationDetailAsync(GetUserId(), applicationId, ct));

        [HttpPatch("applications/{applicationId:guid}/withdraw")]
        public async Task<IActionResult> Withdraw(Guid applicationId, CancellationToken ct = default)
        {
            await jobSeekerService.WithdrawApplicationAsync(GetUserId(), applicationId, ct);
            return Ok(new { message = "Application withdrawn." });
        }

        [HttpGet("saved-jobs")]
        public async Task<IActionResult> GetSavedJobs([FromQuery] string? search = null, CancellationToken ct = default)
            => Ok(await jobSeekerService.GetSavedJobsAsync(GetUserId(), search, ct));

        [HttpPost("saved-jobs/{jobId:guid}")]
        public async Task<IActionResult> SaveJob(Guid jobId, CancellationToken ct = default)
        {
            await jobSeekerService.SaveJobAsync(GetUserId(), jobId, ct);
            return Ok(new { message = "Job saved." });
        }

        [HttpDelete("saved-jobs/{jobId:guid}")]
        public async Task<IActionResult> RemoveSavedJob(Guid jobId, CancellationToken ct = default)
        {
            await jobSeekerService.RemoveSavedJobAsync(GetUserId(), jobId, ct);
            return NoContent();
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile(CancellationToken ct = default)
            => Ok(await jobSeekerService.GetMyProfileAsync(GetUserId(), ct));

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] JobSeekerProfileRequest request, CancellationToken ct = default)
            => Ok(await jobSeekerService.UpdateMyProfileAsync(GetUserId(), request, ct));

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue("userId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException());
    }
}
