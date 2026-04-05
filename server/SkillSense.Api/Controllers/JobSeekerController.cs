using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSense.Api.Security;
using SkillSense.Application.Contracts.Interviews;
using SkillSense.Application.Contracts.Jobseeker.Request;
using SkillSense.Application.Contracts.Jobseeker.Response;
using SkillSense.Application.Contracts.Offers;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Jobseeker;
using SkillSense.Application.Validators;
using SkillSense.Persistence.Interfaces;
using System.Text;

namespace SkillSense.Api.Controllers
{
    /* =========================================
       JOBSEEKER CONTROLLER
       Handles the authenticated jobseeker workspace: applications, saved jobs, profile, and interviews.
    ========================================= */

    [Route("api/jobseeker")]
    [ApiController]
    [Authorize(Roles = "JobSeeker,Admin")]
    public sealed class JobSeekerController(
        IJobSeekerService jobSeekerService,
        IInterviewService interviewService,
        IInterviewRepository interviewRepository,
        IInterviewCalendarService interviewCalendarService) : ControllerBase
    {
        /* =========================================
           APPLICATIONS
        ========================================= */

        // Applies the requested operation.
        [HttpPost("jobs/{jobId:guid}/apply")]
        public async Task<ActionResult<ResumeUploadResponse>> Apply(Guid jobId, [FromForm] string full_name, [FromForm] string email, [FromForm] string postal_code, [FromForm] string location, [FromForm] IFormFile resume_file, CancellationToken ct)
        {
            // Validate uploads at the controller boundary so oversized or unsupported
            // resumes never enter the downstream parsing pipeline.
            var (isValid, error) = ResumeFileValidator.Validate(resume_file?.FileName ?? "", resume_file?.ContentType ?? "", resume_file?.Length ?? 0);
            if (!isValid) return BadRequest(new { message = error });
            var userId = CurrentUserContext.GetUserId(User);

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

        // Handles dashboard.
        [HttpGet("dashboard")]
        public async Task<IActionResult> Dashboard([FromQuery] string range = "this_week", CancellationToken ct = default)
            => Ok(await jobSeekerService.GetDashboardSummaryAsync(CurrentUserContext.GetUserId(User), range, ct));

        // Handles my applications.
        [HttpGet("applications")]
        public async Task<ActionResult<PagedResult<JobSeekerApplicationResponse>>> MyApplications([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] string? status = null, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null, CancellationToken ct = default)
            => Ok(await jobSeekerService.GetMyApplicationsAsync(CurrentUserContext.GetUserId(User), pageNumber, pageSize, search, status, startDate, endDate, false, ct));

        // Archives d applications.
        [HttpGet("applications/archived")]
        public async Task<ActionResult<PagedResult<JobSeekerApplicationResponse>>> ArchivedApplications([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] string? status = null, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null, CancellationToken ct = default)
            => Ok(await jobSeekerService.GetMyApplicationsAsync(CurrentUserContext.GetUserId(User), pageNumber, pageSize, search, status, startDate, endDate, true, ct));

        // Loads application.
        [HttpGet("applications/{applicationId:guid}")]
        public async Task<IActionResult> GetApplication(Guid applicationId, CancellationToken ct = default)
            => Ok(await jobSeekerService.GetApplicationDetailAsync(CurrentUserContext.GetUserId(User), applicationId, ct));

        // Loads offer.
        [HttpGet("applications/{applicationId:guid}/offer")]
        public async Task<ActionResult<OfferResponse>> GetOffer(Guid applicationId, CancellationToken ct = default)
            => Ok(await jobSeekerService.GetOfferAsync(CurrentUserContext.GetUserId(User), applicationId, ct));

        // Handles accept offer.
        [HttpPost("applications/{applicationId:guid}/offer/accept")]
        public async Task<ActionResult<OfferResponse>> AcceptOffer(Guid applicationId, CancellationToken ct = default)
            => Ok(await jobSeekerService.AcceptOfferAsync(CurrentUserContext.GetUserId(User), applicationId, ct));

        // Handles decline offer.
        [HttpPost("applications/{applicationId:guid}/offer/decline")]
        public async Task<ActionResult<OfferResponse>> DeclineOffer(Guid applicationId, CancellationToken ct = default)
            => Ok(await jobSeekerService.DeclineOfferAsync(CurrentUserContext.GetUserId(User), applicationId, ct));

        // Handles withdraw.
        [HttpPatch("applications/{applicationId:guid}/withdraw")]
        public async Task<IActionResult> Withdraw(Guid applicationId, CancellationToken ct = default)
        {
            await jobSeekerService.WithdrawApplicationAsync(CurrentUserContext.GetUserId(User), applicationId, ct);
            return Ok(new { message = "Application withdrawn." });
        }

        // Archives history.
        [HttpPost("applications/{applicationId:guid}/history/archive")]
        public async Task<IActionResult> ArchiveHistory(Guid applicationId, CancellationToken ct = default)
        {
            await jobSeekerService.ArchiveApplicationHistoryAsync(CurrentUserContext.GetUserId(User), applicationId, ct);
            return Ok(new { message = "Application archived." });
        }

        // Restores history.
        [HttpPost("applications/{applicationId:guid}/history/unarchive")]
        public async Task<IActionResult> UnarchiveHistory(Guid applicationId, CancellationToken ct = default)
        {
            await jobSeekerService.UnarchiveApplicationHistoryAsync(CurrentUserContext.GetUserId(User), applicationId, ct);
            return Ok(new { message = "Application restored to your active history." });
        }

        // Deletes history.
        [HttpDelete("applications/{applicationId:guid}/history")]
        public async Task<IActionResult> DeleteHistory(Guid applicationId, CancellationToken ct = default)
        {
            await jobSeekerService.DeleteApplicationHistoryAsync(CurrentUserContext.GetUserId(User), applicationId, ct);
            return NoContent();
        }

        /* =========================================
           SAVED JOBS AND PROFILE
        ========================================= */

        // Loads saved jobs.
        [HttpGet("saved-jobs")]
        public async Task<IActionResult> GetSavedJobs([FromQuery] string? search = null, CancellationToken ct = default)
            => Ok(await jobSeekerService.GetSavedJobsAsync(CurrentUserContext.GetUserId(User), search, ct));

        // Saves job.
        [HttpPost("saved-jobs/{jobId:guid}")]
        public async Task<IActionResult> SaveJob(Guid jobId, CancellationToken ct = default)
        {
            await jobSeekerService.SaveJobAsync(CurrentUserContext.GetUserId(User), jobId, ct);
            return Ok(new { message = "Job saved." });
        }

        // Removes saved job.
        [HttpDelete("saved-jobs/{jobId:guid}")]
        public async Task<IActionResult> RemoveSavedJob(Guid jobId, CancellationToken ct = default)
        {
            await jobSeekerService.RemoveSavedJobAsync(CurrentUserContext.GetUserId(User), jobId, ct);
            return NoContent();
        }

        // Loads profile.
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile(CancellationToken ct = default)
            => Ok(await jobSeekerService.GetMyProfileAsync(CurrentUserContext.GetUserId(User), ct));

        // Updates profile.
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] JobSeekerProfileRequest request, CancellationToken ct = default)
            => Ok(await jobSeekerService.UpdateMyProfileAsync(CurrentUserContext.GetUserId(User), request, ct));

        /* =========================================
           INTERVIEWS
        ========================================= */

        // Loads interviews.
        [HttpGet("interviews")]
        public async Task<ActionResult<IReadOnlyList<InterviewDto>>> GetInterviews(CancellationToken ct = default)
            => Ok(await interviewService.GetByJobSeekerAsync(CurrentUserContext.GetUserId(User), ct));

        // Loads archived interviews.
        [HttpGet("interviews/archived")]
        public async Task<ActionResult<PagedResult<InterviewDto>>> GetArchivedInterviews(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? status = null,
            CancellationToken ct = default)
            => Ok(await interviewService.GetArchivedByJobSeekerAsync(
                CurrentUserContext.GetUserId(User),
                new ArchivedInterviewsQuery
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    Search = search,
                    Status = status,
                },
                ct));

        // Handles accept interview.
        [HttpPost("interviews/{interviewId:guid}/accept")]
        public async Task<ActionResult<InterviewDto>> AcceptInterview(Guid interviewId, CancellationToken ct = default)
            => Ok(await interviewService.AcceptInterviewAsync(interviewId, CurrentUserContext.GetUserId(User), ct));

        // Handles decline interview.
        [HttpPost("interviews/{interviewId:guid}/decline")]
        public async Task<ActionResult<InterviewDto>> DeclineInterview(Guid interviewId, CancellationToken ct = default)
            => Ok(await interviewService.DeclineInterviewAsync(interviewId, CurrentUserContext.GetUserId(User), ct));

        // Requests reschedule.
        [HttpPost("interviews/{interviewId:guid}/request-reschedule")]
        public async Task<ActionResult<InterviewDto>> RequestReschedule(Guid interviewId, [FromForm] string message, CancellationToken ct = default)
            => Ok(await interviewService.RequestRescheduleAsync(
                interviewId,
                CurrentUserContext.GetUserId(User),
                new RequestInterviewRescheduleRequest
                {
                    Message = message,
                },
                ct));

        // Archives interview.
        [HttpPost("interviews/{interviewId:guid}/archive")]
        public async Task<ActionResult<InterviewDto>> ArchiveInterview(Guid interviewId, CancellationToken ct = default)
            => Ok(await interviewService.ArchiveInterviewAsync(interviewId, CurrentUserContext.GetUserId(User), ct));

        // Restores interview.
        [HttpPost("interviews/{interviewId:guid}/unarchive")]
        public async Task<ActionResult<InterviewDto>> UnarchiveInterview(Guid interviewId, CancellationToken ct = default)
            => Ok(await interviewService.UnarchiveInterviewAsync(interviewId, CurrentUserContext.GetUserId(User), ct));

        // Downloads interview calendar.
        [HttpGet("interviews/{interviewId:guid}/ics")]
        public async Task<IActionResult> DownloadInterviewCalendar(Guid interviewId, CancellationToken ct = default)
        {
            var userId = CurrentUserContext.GetUserId(User);
            var interview = await interviewRepository.GetByIdForJobSeekerAsync(interviewId, userId, ct);
            if (interview is null)
            {
                return NotFound();
            }

            // Generate ICS content on demand so jobseekers always download the
            // latest interview schedule without storing a separate calendar artifact.
            var calendarContent = interviewCalendarService.BuildCalendarContent(interview);
            return File(Encoding.UTF8.GetBytes(calendarContent), "text/calendar", $"interview-{interviewId}.ics");
        }
    }
}
