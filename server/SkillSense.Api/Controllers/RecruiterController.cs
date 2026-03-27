using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSense.Api.Security;
using SkillSense.Application.Contracts.Interviews;
using SkillSense.Application.Contracts.Employees;
using SkillSense.Application.Contracts.Offers;
using SkillSense.Application.Contracts.Recruiter.Request;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Recruiter;
using SkillSense.Persistence.Interfaces;
using System.Text;

namespace SkillSense.Api.Controllers;

[Route("api/recruiter")]
[ApiController]
[Authorize(Roles = "Recruiter")]
public sealed class RecruiterController(
    IRecruiterService recruiterService,
    IInterviewService interviewService,
    IInterviewRepository interviewRepository,
    IInterviewCalendarService interviewCalendarService,
    IObjectStorageService objectStorageService,
    ILogger<RecruiterController> logger) : ControllerBase
{
    public sealed record RecruiterScheduleInterviewRequest(
        Guid JobId,
        Guid JobSeekerId,
        DateTime ScheduledDateTimeUtc,
        InterviewTypeDto InterviewType,
        string LocationOrMeetingLink,
        string? Message);

    public sealed record RecruiterRescheduleInterviewRequest(
        DateTime ScheduledDateTimeUtc,
        InterviewTypeDto InterviewType,
        string LocationOrMeetingLink,
        string? Message);

    public sealed record RecruiterCancelInterviewRequest(string? Reason);

    [HttpGet("profile")]
    public async Task<ActionResult<RecruiterProfileResponse>> GetProfile(CancellationToken ct)
        => Ok(await recruiterService.GetProfileAsync(CurrentUserContext.GetUserId(User), ct));

    [HttpPut("profile")]
    public async Task<ActionResult<RecruiterProfileResponse>> UpdateProfile([FromBody] RecruiterProfileRequest request, CancellationToken ct)
        => Ok(await recruiterService.UpsertProfileAsync(CurrentUserContext.GetUserId(User), request, ct));

    [HttpPost("jobs")]
    public async Task<ActionResult<JobListItemResponse>> CreateJob([FromBody] CreateJobRequest request, CancellationToken ct)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        var recruiterProfileId = CurrentUserContext.GetActiveRecruiterProfileId(HttpContext);
        logger.LogInformation("Recruiter create job requested by {UserId} for title {Title}. Company={CompanyId} RecruiterProfile={RecruiterProfileId}", userId, request.Title, companyId, recruiterProfileId);

        var result = await recruiterService.CreateJobAsync(companyId, userId, request, ct);
        logger.LogInformation("Recruiter created job {JobId} by {UserId}", result.Id, userId);

        return CreatedAtAction(nameof(GetJob), new { id = result.Id }, result);
    }

    [HttpPut("jobs/{id:guid}")]
    public async Task<ActionResult<JobListItemResponse>> UpdateJob(Guid id, [FromBody] UpdateJobRequest request, CancellationToken ct)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        var recruiterProfileId = CurrentUserContext.GetActiveRecruiterProfileId(HttpContext);
        logger.LogInformation("Recruiter update job requested by {UserId} for job {JobId}. Company={CompanyId} RecruiterProfile={RecruiterProfileId}", userId, id, companyId, recruiterProfileId);

        var response = await recruiterService.UpdateJobAsync(companyId, userId, id, request, ct);
        logger.LogInformation("Recruiter updated job {JobId} by {UserId}", id, userId);

        return Ok(response);
    }

    [HttpPost("jobs/{id:guid}/duplicate")]
    [HttpPost("~/api/jobs/{id:guid}/duplicate")]
    public async Task<ActionResult<JobListItemResponse>> DuplicateJob(Guid id, CancellationToken ct)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        var recruiterProfileId = CurrentUserContext.GetActiveRecruiterProfileId(HttpContext);
        logger.LogInformation("Recruiter duplicate job requested by {UserId} for job {JobId}. Company={CompanyId} RecruiterProfile={RecruiterProfileId}", userId, id, companyId, recruiterProfileId);

        var response = await recruiterService.DuplicateJobAsync(companyId, userId, id, ct);
        logger.LogInformation("Recruiter duplicated job {OriginalJobId} into {DuplicateJobId} by {UserId}", id, response.Id, userId);

        return CreatedAtAction(nameof(GetJob), new { id = response.Id }, response);
    }

    [HttpPut("jobs/{id:guid}/status")]
    public async Task<ActionResult<JobListItemResponse>> UpdateJobStatus(Guid id, [FromBody] UpdateJobStatusRequest request, CancellationToken ct)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        return Ok(await recruiterService.UpdateJobStatusAsync(companyId, userId, id, request, ct));
    }

    [HttpGet("jobs")]
    public async Task<ActionResult<PagedResult<JobListItemResponse>>> GetJobs([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] string? department = null, [FromQuery] string? sortBy = null, [FromQuery] string? sortDir = null, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        return Ok(await recruiterService.GetJobsAsync(companyId, userId, pageNumber, pageSize, search, department, sortBy, sortDir, ct));
    }

    [HttpGet("jobs/{id:guid}")]
    public async Task<ActionResult<JobListItemResponse>> GetJob(Guid id, CancellationToken ct)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        var item = await recruiterService.GetJobAsync(companyId, userId, id, ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpGet("jobs/{id:guid}/shortlisted-candidates")]
    public async Task<ActionResult<IReadOnlyList<ShortlistedCandidateOptionDto>>> GetShortlistedCandidates(Guid id, [FromQuery] string? department = null, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        return Ok(await recruiterService.GetShortlistedCandidatesByJobAsync(companyId, userId, id, department, ct));
    }

    [HttpDelete("jobs/{id:guid}")]
    public async Task<IActionResult> DeleteJob(Guid id, CancellationToken ct)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        await recruiterService.DeleteJobAsync(companyId, userId, id, ct);
        return NoContent();
    }

    [HttpPost("jobs/{id:guid}/publish")]
    public async Task<ActionResult<JobListItemResponse>> PublishJob(Guid id, CancellationToken ct)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        return Ok(await recruiterService.UpdateJobStatusAsync(companyId, userId, id, new UpdateJobStatusRequest { Status = "Published" }, ct));
    }

    [HttpPost("jobs/{id:guid}/close")]
    public async Task<ActionResult<JobListItemResponse>> CloseJob(Guid id, CancellationToken ct)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        return Ok(await recruiterService.UpdateJobStatusAsync(companyId, userId, id, new UpdateJobStatusRequest { Status = "Closed" }, ct));
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<RecruiterDashboardResponse>> Dashboard([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null, [FromQuery] string? department = null, [FromQuery] string? jobRole = null, [FromQuery] string? groupBy = "month", CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext);
        var response = companyId.HasValue
            ? await recruiterService.GetDashboardAsync(companyId.Value, userId, startDate, endDate, department, jobRole, groupBy, ct)
            : await recruiterService.GetDashboardAsync(userId, startDate, endDate, department, jobRole, groupBy, ct);

        return Ok(response);
    }

    [HttpGet("applicants/scores")]
    public async Task<ActionResult<ApplicantScoresResponse>> GetApplicantScores([FromQuery] Guid? jobId = null, [FromQuery] string? department = null, [FromQuery] string? stage = "all", [FromQuery] string? search = null, [FromQuery] int? recommendedTopPercent = null, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        return Ok(await recruiterService.GetApplicantScoresAsync(companyId, userId, jobId, department, stage, search, recommendedTopPercent, pageNumber, pageSize, ct));
    }

    [HttpGet("applicants/scores/{submissionId:guid}")]
    public async Task<ActionResult<ApplicantDetailResponse>> GetApplicantBySubmission(Guid submissionId, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        var item = await recruiterService.GetApplicantBySubmissionIdAsync(companyId, userId, submissionId, ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpGet("applicants/{id:guid}/resume/download")]
    public async Task<ActionResult<ApplicantResumeDownloadResponse>> GetApplicantResumeDownload(Guid id, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");

        var result = await recruiterService.GetApplicantResumeAccessAsync(companyId, userId, id, ct);
        var downloadUrl = result.DownloadUrl;

        if (string.IsNullOrWhiteSpace(downloadUrl))
        {
            downloadUrl = Url.ActionLink(nameof(DownloadApplicantResumeFile), values: new { id })
                ?? $"{Request.Scheme}://{Request.Host}{Request.PathBase}/api/recruiter/applicants/{id}/resume/file";
        }

        return Ok(new ApplicantResumeDownloadResponse
        {
            DownloadUrl = downloadUrl,
            FileName = result.FileName,
        });
    }

    [HttpGet("applicants/{id:guid}/resume/file")]
    public async Task<IActionResult> DownloadApplicantResumeFile(Guid id, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");

        var result = await recruiterService.GetApplicantResumeAccessAsync(companyId, userId, id, ct);
        if (!string.IsNullOrWhiteSpace(result.DownloadUrl))
        {
            return Redirect(result.DownloadUrl);
        }

        var stream = await objectStorageService.DownloadAsync(result.ObjectKey, ct);
        return File(stream, result.ContentType, result.FileName, enableRangeProcessing: true);
    }

    [HttpPut("applicants/scores/{submissionId:guid}/status")]
    public async Task<ActionResult<ApplicantScoreItemResponse>> UpdateApplicantStatus(Guid submissionId, [FromBody] UpdateApplicantStageRequest request, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        return Ok(await recruiterService.UpdateApplicantStatusAsync(companyId, userId, submissionId, request, ct));
    }

    [HttpPut("applicants/scores/status")]
    public async Task<ActionResult<BulkUpdateApplicantStageResponse>> UpdateApplicantStatuses([FromBody] BulkUpdateApplicantStageRequest request, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        var result = await recruiterService.UpdateApplicantStatusesAsync(companyId, userId, request, ct);

        if (result.SuccessCount == 0 && result.FailureCount > 0)
        {
            return Conflict(result);
        }

        return Ok(result);
    }

    [HttpGet("applicants/{id:guid}/offer")]
    public async Task<ActionResult<OfferResponse>> GetOffer(Guid id, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        var offer = await recruiterService.GetOfferAsync(companyId, userId, id, ct);
        return offer is null ? NotFound() : Ok(offer);
    }

    [HttpGet("employees")]
    public async Task<ActionResult<PagedResult<EmployeeRecordResponse>>> GetHiredEmployees([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");

        return Ok(await recruiterService.GetHiredEmployeesAsync(companyId, userId, page, pageSize, search, ct));
    }

    [HttpPost("applicants/{id:guid}/offer")]
    public async Task<ActionResult<ApplicantScoreItemResponse>> CreateOffer(Guid id, [FromBody] SendOfferRequest request, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        return Ok(await recruiterService.CreateOfferAsync(companyId, userId, id, request, ct));
    }

    [HttpPost("applicants/{id:guid}/hire")]
    public async Task<ActionResult<ApplicantScoreItemResponse>> MarkHired(Guid id, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        return Ok(await recruiterService.MarkHiredAsync(companyId, userId, id, ct));
    }

    [HttpGet("interviews")]
    public async Task<ActionResult<IReadOnlyList<InterviewDto>>> GetInterviews(CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        return Ok(await interviewService.GetByRecruiterAsync(companyId, userId, ct));
    }

    [HttpGet("interviews/{id:guid}")]
    public async Task<ActionResult<InterviewDto>> GetInterview(Guid id, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        return Ok(await interviewService.GetRecruiterInterviewAsync(companyId, userId, id, ct));
    }

    [HttpPost("interviews")]
    public async Task<ActionResult<InterviewDto>> ScheduleInterview([FromBody] RecruiterScheduleInterviewRequest request, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");

        var result = await interviewService.ScheduleInterviewAsync(
            companyId,
            new ScheduleInterviewRequest
            {
                JobId = request.JobId,
                RecruiterId = userId,
                JobSeekerId = request.JobSeekerId,
                ScheduledDateTimeUtc = request.ScheduledDateTimeUtc,
                InterviewType = request.InterviewType,
                LocationOrMeetingLink = request.LocationOrMeetingLink,
                Message = request.Message,
            },
            ct);

        return CreatedAtAction(nameof(GetInterview), new { id = result.Id }, result);
    }

    [HttpPut("interviews/{id:guid}")]
    public async Task<ActionResult<InterviewDto>> RescheduleInterview(Guid id, [FromBody] RecruiterRescheduleInterviewRequest request, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        return Ok(await interviewService.RescheduleInterviewAsync(
            companyId,
            userId,
            id,
            new RescheduleInterviewRequest
            {
                ScheduledDateTimeUtc = request.ScheduledDateTimeUtc,
                InterviewType = request.InterviewType,
                LocationOrMeetingLink = request.LocationOrMeetingLink,
                Message = request.Message,
            },
            ct));
    }

    [HttpPost("interviews/{id:guid}/cancel")]
    public async Task<ActionResult<InterviewDto>> CancelInterview(Guid id, [FromBody] RecruiterCancelInterviewRequest request, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        return Ok(await interviewService.CancelInterviewAsync(companyId, userId, id, new CancelInterviewRequest
        {
            Reason = request.Reason,
        }, ct));
    }

    [HttpPost("interviews/{id:guid}/complete")]
    public async Task<ActionResult<InterviewDto>> MarkInterviewCompleted(Guid id, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        return Ok(await interviewService.MarkInterviewCompletedAsync(companyId, userId, id, ct));
    }

    [HttpPost("interviews/{id:guid}/archive")]
    public async Task<ActionResult<InterviewDto>> ArchiveInterview(Guid id, CancellationToken ct = default)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");
        return Ok(await interviewService.ArchiveInterviewAsync(companyId, userId, id, ct));
    }

    [HttpGet("interviews/{id:guid}/ics")]
    public async Task<IActionResult> DownloadInterviewCalendar(Guid id, CancellationToken ct)
    {
        var userId = CurrentUserContext.GetUserId(User);
        var companyId = CurrentUserContext.GetActiveCompanyId(HttpContext)
            ?? throw new UnauthorizedAccessException("Active company context is required.");

        var interview = await interviewRepository.GetByIdForRecruiterAsync(id, userId, companyId, ct);
        if (interview is null)
        {
            return NotFound();
        }

        var calendarContent = interviewCalendarService.BuildCalendarContent(interview);
        return File(Encoding.UTF8.GetBytes(calendarContent), "text/calendar", $"interview-{id}.ics");
    }
}
