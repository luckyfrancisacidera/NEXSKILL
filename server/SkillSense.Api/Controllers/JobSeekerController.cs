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
    [Route("api/jobseeker")]
    [ApiController]
    [Authorize(Roles = "JobSeeker,Admin")]
    public sealed class JobSeekerController(
        IJobSeekerService jobSeekerService,
        IInterviewService interviewService,
        IInterviewRepository interviewRepository,
        IInterviewCalendarService interviewCalendarService) : ControllerBase
    {
        [HttpPost("jobs/{jobId:guid}/apply")]
        public async Task<ActionResult<ResumeUploadResponse>> Apply(Guid jobId, [FromForm] string full_name, [FromForm] string email, [FromForm] string postal_code, [FromForm] string location, [FromForm] IFormFile resume_file, CancellationToken ct)
        {
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

        [HttpGet("dashboard")]
        public async Task<IActionResult> Dashboard([FromQuery] string range = "this_week", CancellationToken ct = default)
            => Ok(await jobSeekerService.GetDashboardSummaryAsync(CurrentUserContext.GetUserId(User), range, ct));

        [HttpGet("applications")]
        public async Task<ActionResult<PagedResult<JobSeekerApplicationResponse>>> MyApplications([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] string? status = null, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null, CancellationToken ct = default)
            => Ok(await jobSeekerService.GetMyApplicationsAsync(CurrentUserContext.GetUserId(User), pageNumber, pageSize, search, status, startDate, endDate, ct));

        [HttpGet("applications/{applicationId:guid}")]
        public async Task<IActionResult> GetApplication(Guid applicationId, CancellationToken ct = default)
            => Ok(await jobSeekerService.GetApplicationDetailAsync(CurrentUserContext.GetUserId(User), applicationId, ct));

        [HttpGet("applications/{applicationId:guid}/offer")]
        public async Task<ActionResult<OfferResponse>> GetOffer(Guid applicationId, CancellationToken ct = default)
            => Ok(await jobSeekerService.GetOfferAsync(CurrentUserContext.GetUserId(User), applicationId, ct));

        [HttpPost("applications/{applicationId:guid}/offer/accept")]
        public async Task<ActionResult<OfferResponse>> AcceptOffer(Guid applicationId, CancellationToken ct = default)
            => Ok(await jobSeekerService.AcceptOfferAsync(CurrentUserContext.GetUserId(User), applicationId, ct));

        [HttpPost("applications/{applicationId:guid}/offer/decline")]
        public async Task<ActionResult<OfferResponse>> DeclineOffer(Guid applicationId, CancellationToken ct = default)
            => Ok(await jobSeekerService.DeclineOfferAsync(CurrentUserContext.GetUserId(User), applicationId, ct));

        [HttpPatch("applications/{applicationId:guid}/withdraw")]
        public async Task<IActionResult> Withdraw(Guid applicationId, CancellationToken ct = default)
        {
            await jobSeekerService.WithdrawApplicationAsync(CurrentUserContext.GetUserId(User), applicationId, ct);
            return Ok(new { message = "Application withdrawn." });
        }

        [HttpDelete("applications/{applicationId:guid}/history")]
        public async Task<IActionResult> DeleteHistory(Guid applicationId, CancellationToken ct = default)
        {
            await jobSeekerService.HideApplicationFromHistoryAsync(CurrentUserContext.GetUserId(User), applicationId, ct);
            return NoContent();
        }

        [HttpGet("saved-jobs")]
        public async Task<IActionResult> GetSavedJobs([FromQuery] string? search = null, CancellationToken ct = default)
            => Ok(await jobSeekerService.GetSavedJobsAsync(CurrentUserContext.GetUserId(User), search, ct));

        [HttpPost("saved-jobs/{jobId:guid}")]
        public async Task<IActionResult> SaveJob(Guid jobId, CancellationToken ct = default)
        {
            await jobSeekerService.SaveJobAsync(CurrentUserContext.GetUserId(User), jobId, ct);
            return Ok(new { message = "Job saved." });
        }

        [HttpDelete("saved-jobs/{jobId:guid}")]
        public async Task<IActionResult> RemoveSavedJob(Guid jobId, CancellationToken ct = default)
        {
            await jobSeekerService.RemoveSavedJobAsync(CurrentUserContext.GetUserId(User), jobId, ct);
            return NoContent();
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile(CancellationToken ct = default)
            => Ok(await jobSeekerService.GetMyProfileAsync(CurrentUserContext.GetUserId(User), ct));

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] JobSeekerProfileRequest request, CancellationToken ct = default)
            => Ok(await jobSeekerService.UpdateMyProfileAsync(CurrentUserContext.GetUserId(User), request, ct));

        [HttpGet("interviews")]
        public async Task<ActionResult<IReadOnlyList<InterviewDto>>> GetInterviews(CancellationToken ct = default)
            => Ok(await interviewService.GetByJobSeekerAsync(CurrentUserContext.GetUserId(User), ct));

        [HttpPost("interviews/{interviewId:guid}/accept")]
        public async Task<ActionResult<InterviewDto>> AcceptInterview(Guid interviewId, CancellationToken ct = default)
            => Ok(await interviewService.AcceptInterviewAsync(interviewId, CurrentUserContext.GetUserId(User), ct));

        [HttpPost("interviews/{interviewId:guid}/decline")]
        public async Task<ActionResult<InterviewDto>> DeclineInterview(Guid interviewId, CancellationToken ct = default)
            => Ok(await interviewService.DeclineInterviewAsync(interviewId, CurrentUserContext.GetUserId(User), ct));

        [HttpPost("interviews/{interviewId:guid}/request-reschedule")]
        public async Task<ActionResult<InterviewDto>> RequestReschedule(Guid interviewId, [FromForm] string message, [FromForm] IFormFile? attachment, CancellationToken ct = default)
            => Ok(await interviewService.RequestRescheduleAsync(
                interviewId,
                CurrentUserContext.GetUserId(User),
                new RequestInterviewRescheduleRequest
                {
                    Message = message,
                    AttachmentFileName = attachment?.FileName,
                },
                ct));

        [HttpPost("interviews/{interviewId:guid}/archive")]
        public async Task<ActionResult<InterviewDto>> ArchiveInterview(Guid interviewId, CancellationToken ct = default)
            => Ok(await interviewService.ArchiveInterviewAsync(interviewId, CurrentUserContext.GetUserId(User), ct));

        [HttpGet("interviews/{interviewId:guid}/ics")]
        public async Task<IActionResult> DownloadInterviewCalendar(Guid interviewId, CancellationToken ct = default)
        {
            var userId = CurrentUserContext.GetUserId(User);
            var interview = await interviewRepository.GetByIdForJobSeekerAsync(interviewId, userId, ct);
            if (interview is null)
            {
                return NotFound();
            }

            var calendarContent = interviewCalendarService.BuildCalendarContent(interview);
            return File(Encoding.UTF8.GetBytes(calendarContent), "text/calendar", $"interview-{interviewId}.ics");
        }
    }
}
