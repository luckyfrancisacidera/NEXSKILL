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
    public async Task<ActionResult<PagedResult<JobListItemResponse>>> GetJobs([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] string? department = null, [FromQuery] string? sortBy = null, [FromQuery] string? sortDir = null, CancellationToken ct = default)
        => Ok(await recruiterService.GetJobsAsync(GetUserId(), pageNumber, pageSize, search, department, sortBy, sortDir, ct));

    [HttpGet("jobs/{id:guid}")]
    public async Task<ActionResult<JobListItemResponse>> GetJob(Guid id, CancellationToken ct)
    {
        var item = await recruiterService.GetJobAsync(GetUserId(), id, ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpDelete("jobs/{id:guid}")]
    public async Task<IActionResult> DeleteJob(Guid id, CancellationToken ct)
    {
        await recruiterService.DeleteJobAsync(GetUserId(), id, ct);
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
    public async Task<ActionResult<RecruiterDashboardResponse>> Dashboard([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null, [FromQuery] string? department = null, [FromQuery] string? jobRole = null, [FromQuery] string? groupBy = "month", CancellationToken ct = default)
        => Ok(await recruiterService.GetDashboardAsync(GetUserId(), startDate, endDate, department, jobRole, groupBy, ct));

    [HttpGet("applicants/scores")]
    public async Task<ActionResult<ApplicantScoresResponse>> GetApplicantScores([FromQuery] Guid? jobId = null, [FromQuery] string? department = null, [FromQuery] string? stage = "all", [FromQuery] string? search = null, [FromQuery] int? recommendedTopPercent = null, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
        => Ok(await recruiterService.GetApplicantScoresAsync(GetUserId(), jobId, department, stage, search, recommendedTopPercent, pageNumber, pageSize, ct));

    [HttpGet("applicants/scores/{submissionId:guid}")]
    public async Task<ActionResult<ApplicantDetailResponse>> GetApplicantBySubmission(Guid submissionId, CancellationToken ct = default)
    {
        var item = await recruiterService.GetApplicantBySubmissionIdAsync(GetUserId(), submissionId, ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPut("applicants/scores/{submissionId:guid}/status")]
    public async Task<IActionResult> UpdateApplicantStatus(Guid submissionId, [FromBody] UpdateApplicantStageRequest request, CancellationToken ct = default)
    {
        await recruiterService.UpdateApplicantStatusAsync(GetUserId(), submissionId, request, ct);
        return NoContent();
    }

    [HttpPut("applicants/scores/status")]
    public async Task<ActionResult<BulkUpdateApplicantStageResponse>> UpdateApplicantStatuses([FromBody] BulkUpdateApplicantStageRequest request, CancellationToken ct = default)
    {
        var result = await recruiterService.UpdateApplicantStatusesAsync(GetUserId(), request, ct);

        if (result.SuccessCount == 0 && result.FailureCount > 0)
        {
            return Conflict(result);
        }

        return Ok(result);
    }

    private Guid GetUserId()
        => Guid.Parse(User.FindFirstValue("userId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException());
}
