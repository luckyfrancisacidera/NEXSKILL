using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSense.Application.Contracts.Recruiter.Request;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces.Recruiter;

namespace SkillSense.Api.Controllers;

[Route("api/recruiter")]
[ApiController]
[Authorize(Roles = "Recruiter,Admin")]
public sealed class RecruiterController(IRecruiterService recruiterService, ILogger<RecruiterController> logger) : ControllerBase
{
    [HttpGet("profile")]
    public async Task<ActionResult<RecruiterProfileResponse>> GetProfile(CancellationToken ct)
        => Ok(await recruiterService.GetProfileAsync(GetUserId(), ct));

    [HttpPut("profile")]
    public async Task<ActionResult<RecruiterProfileResponse>> UpdateProfile([FromBody] RecruiterProfileRequest request, CancellationToken ct)
        => Ok(await recruiterService.UpsertProfileAsync(GetUserId(), request, ct));

    [HttpPost("jobs")]
    public async Task<ActionResult<JobListItemResponse>> CreateJob([FromBody] CreateJobRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        logger.LogInformation("Recruiter create job requested by {UserId} for title {Title}", userId, request.Title);

        var result = await recruiterService.CreateJobAsync(userId, request, ct);
        logger.LogInformation("Recruiter created job {JobId} by {UserId}", result.Id, userId);

        return CreatedAtAction(nameof(GetJob), new { id = result.Id }, result);
    }

    [HttpPut("jobs/{id:guid}")]
    public async Task<ActionResult<JobListItemResponse>> UpdateJob(Guid id, [FromBody] UpdateJobRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        logger.LogInformation("Recruiter update job requested by {UserId} for job {JobId}", userId, id);

        var response = await recruiterService.UpdateJobAsync(userId, id, request, ct);
        logger.LogInformation("Recruiter updated job {JobId} by {UserId}", id, userId);

        return Ok(response);
    }

    [HttpGet("jobs")]
    public async Task<ActionResult<PagedResult<JobListItemResponse>>> GetJobs([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] string? sortBy = null, [FromQuery] string? sortDir = null, CancellationToken ct = default)
        => Ok(await recruiterService.GetJobsAsync(GetUserId(), pageNumber, pageSize, search, sortBy, sortDir, ct));

    [HttpGet("jobs/{id:guid}")]
    public async Task<ActionResult<JobListItemResponse>> GetJob(Guid id, CancellationToken ct)
    {
        var item = await recruiterService.GetJobAsync(GetUserId(), id, ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpDelete("jobs/{id:guid}")]
    public async Task<IActionResult> DeleteJob(Guid id, CancellationToken ct)
    {
        await recruiterService.DeleteDraftJobAsync(GetUserId(), id, ct);
        return NoContent();
    }

    [HttpPost("jobs/{id:guid}/publish")]
    public async Task<IActionResult> PublishJob(Guid id, CancellationToken ct)
    {
        await recruiterService.PublishJobAsync(GetUserId(), id, ct);
        return NoContent();
    }

    [HttpPost("jobs/{id:guid}/close")]
    public async Task<IActionResult> CloseJob(Guid id, CancellationToken ct)
    {
        await recruiterService.CloseJobAsync(GetUserId(), id, ct);
        return NoContent();
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<RecruiterDashboardResponse>> Dashboard([FromQuery] string? range = "last30", CancellationToken ct = default)
        => Ok(await recruiterService.GetDashboardAsync(GetUserId(), range, ct));

    [HttpGet("applicants/scores")]
    public async Task<ActionResult<ApplicantScoresResponse>> GetApplicantScores([FromQuery] Guid? jobId = null, [FromQuery] string? stage = "all", [FromQuery] string? search = null, CancellationToken ct = default)
        => Ok(await recruiterService.GetApplicantScoresAsync(GetUserId(), jobId, stage, search, ct));

    private Guid GetUserId()
        => Guid.Parse(User.FindFirstValue("userId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException());
}
