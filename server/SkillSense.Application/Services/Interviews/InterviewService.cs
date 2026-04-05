using SkillSense.Application.Contracts.Interviews;
using SkillSense.Application.Contracts.Notifications;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Common.Recruiter;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Exceptions;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace SkillSense.Application.Services.Interviews;

public sealed class InterviewService(
    IInterviewRepository interviewRepository,
    IRecruiterRepository recruiterRepository,
    IJobRepository jobRepository,
    IInterviewCalendarService interviewCalendarService,
    IInterviewInviteEmailSender interviewInviteEmailSender,
    IDateTimeProvider dateTimeProvider,
    INotificationService notificationService,
    ILogger<InterviewService> logger) : IInterviewService
{
    private const int DefaultInterviewDurationMinutes = 60;

    // Handles schedule interview.
    public async Task<InterviewDto> ScheduleInterviewAsync(ScheduleInterviewRequest request, CancellationToken ct = default)
        => await ScheduleInterviewAsync(null, request, ct);

    // Handles schedule interview.
    public async Task<InterviewDto> ScheduleInterviewAsync(Guid? companyId, ScheduleInterviewRequest request, CancellationToken ct = default)
    {
        var now = dateTimeProvider.UtcNow;
        var scopedCompanyId = await ResolveCompanyIdAsync(companyId, request.RecruiterId, request.JobId, ct);
        var interviewType = MapInterviewType(request.InterviewType);
        ValidateScheduledDate(request.ScheduledDateTimeUtc, now);
        ValidateInterviewDetails(interviewType, request.LocationOrMeetingLink);
        await EnsureCandidateIsShortlistedAsync(request.JobId, request.JobSeekerId, ct);
        await EnsureNoScheduleConflictsAsync(request.RecruiterId, request.JobSeekerId, request.ScheduledDateTimeUtc.ToUniversalTime(), null, ct);

        var entity = new InterviewEntity
        {
            Id = Guid.NewGuid(),
            CompanyId = scopedCompanyId,
            JobId = request.JobId,
            RecruiterId = request.RecruiterId,
            JobSeekerId = request.JobSeekerId,
            ScheduledDateTimeUtc = request.ScheduledDateTimeUtc,
            InterviewType = interviewType,
            LocationOrMeetingLink = request.LocationOrMeetingLink.Trim(),
            Message = string.IsNullOrWhiteSpace(request.Message) ? null : request.Message.Trim(),
            Status = InterviewStatus.Pending,
            CreatedAtUtc = now,
        };

        await interviewRepository.AddAsync(entity, ct);
        await SyncSubmissionToInterviewStageAsync(entity, ct);
        await interviewRepository.SaveChangesAsync(ct);

        var scheduledInterview = await interviewRepository.GetByIdForRecruiterAsync(entity.Id, request.RecruiterId, scopedCompanyId, ct)
            ?? throw new KeyNotFoundException("Interview not found.");

        var warnings = new List<string>();

        await TryRunSideEffectAsync(
            warnings,
            "Calendar invites could not be delivered automatically.",
            () => CreateCalendarInvite(scheduledInterview, ct));
        await TryRunSideEffectAsync(
            warnings,
            "The candidate notification could not be delivered automatically.",
            () => CreateJobSeekerNotificationAsync(
                scheduledInterview,
                NotificationType.Info,
                "Interview scheduled",
                BuildScheduleNotificationMessage(scheduledInterview),
                ct));

        var response = await MapAsync(scheduledInterview, ct);
        if (warnings.Count > 0)
        {
            response.WarningMessage = string.Join(" ", warnings.Distinct());
        }

        return response;
    }

    // Loads recruiter interview.
    public async Task<InterviewDto> GetRecruiterInterviewAsync(Guid? companyId, Guid recruiterId, Guid interviewId, CancellationToken ct = default)
    {
        var entity = await GetInterviewForRecruiterAsync(interviewId, companyId, recruiterId, ct);
        return await MapAsync(entity, ct);
    }

    // Handles reschedule interview.
    public async Task<InterviewDto> RescheduleInterviewAsync(Guid interviewId, RescheduleInterviewRequest request, CancellationToken ct = default)
    {
        var entity = await interviewRepository.GetByIdAsync(interviewId, ct)
            ?? throw new KeyNotFoundException("Interview not found.");

        EnsureCanReschedule(entity);
        ApplyReschedule(entity, request);
        await EnsureNoScheduleConflictsAsync(entity.RecruiterId, entity.JobSeekerId, entity.ScheduledDateTimeUtc, entity.Id, ct);
        await SaveInterviewChangesAsync(interviewId, ct);
        var updatedInterview = await interviewRepository.GetByIdAsync(interviewId, ct)
            ?? throw new KeyNotFoundException("Interview not found.");

        await CreateCalendarInvite(updatedInterview, ct);
        await CreateJobSeekerNotificationAsync(
            updatedInterview,
            NotificationType.Warning,
            "Interview rescheduled",
            BuildRescheduleNotificationMessage(updatedInterview),
            ct);
        return await MapAsync(updatedInterview, ct);
    }

    // Handles reschedule interview.
    public async Task<InterviewDto> RescheduleInterviewAsync(Guid? companyId, Guid recruiterId, Guid interviewId, RescheduleInterviewRequest request, CancellationToken ct = default)
    {
        var entity = await GetInterviewForRecruiterAsync(interviewId, companyId, recruiterId, ct);

        EnsureCanReschedule(entity);
        ApplyReschedule(entity, request);
        await EnsureNoScheduleConflictsAsync(entity.RecruiterId, entity.JobSeekerId, entity.ScheduledDateTimeUtc, entity.Id, ct);
        await SaveInterviewChangesAsync(interviewId, ct);
        var updatedInterview = companyId.HasValue && companyId.Value != Guid.Empty
            ? await interviewRepository.GetByIdForRecruiterAsync(interviewId, recruiterId, companyId.Value, ct)
            : await interviewRepository.GetByIdAsync(interviewId, ct);

        if (updatedInterview is null)
        {
            throw new KeyNotFoundException("Interview not found.");
        }

        await CreateCalendarInvite(updatedInterview, ct);
        await CreateJobSeekerNotificationAsync(
            updatedInterview,
            NotificationType.Warning,
            "Interview rescheduled",
            BuildRescheduleNotificationMessage(updatedInterview),
            ct);
        return await MapAsync(updatedInterview, ct);
    }

    // Handles accept interview.
    public async Task<InterviewDto> AcceptInterviewAsync(Guid interviewId, CancellationToken ct = default)
    {
        var entity = await interviewRepository.GetByIdAsync(interviewId, ct)
            ?? throw new KeyNotFoundException("Interview not found.");

        EnsureCanRespond(entity);
        entity.Status = InterviewStatus.Accepted;
        await interviewRepository.SaveChangesAsync(ct);
        return await MapAsync(entity, ct);
    }

    // Handles accept interview.
    public async Task<InterviewDto> AcceptInterviewAsync(Guid interviewId, Guid jobSeekerId, CancellationToken ct = default)
    {
        var entity = await GetInterviewForJobSeekerAsync(interviewId, jobSeekerId, ct);
        EnsureCanRespond(entity);
        if (entity.Status == InterviewStatus.Accepted)
        {
            return await MapAsync(entity, ct);
        }

        entity.Status = InterviewStatus.Accepted;
        await SyncSubmissionToInterviewStageAsync(entity, ct);
        await interviewRepository.SaveChangesAsync(ct);
        await CreateRecruiterNotificationAsync(
            entity,
            NotificationType.Success,
            "Interview accepted",
            $"{ResolveCandidateName(entity)} accepted the interview for {entity.Job.Title}.",
            ct);
        return await MapAsync(entity, ct);
    }

    // Handles decline interview.
    public async Task<InterviewDto> DeclineInterviewAsync(Guid interviewId, CancellationToken ct = default)
    {
        var entity = await interviewRepository.GetByIdAsync(interviewId, ct)
            ?? throw new KeyNotFoundException("Interview not found.");

        EnsureCanRespond(entity);
        entity.Status = InterviewStatus.Declined;
        await interviewRepository.SaveChangesAsync(ct);
        return await MapAsync(entity, ct);
    }

    // Handles decline interview.
    public async Task<InterviewDto> DeclineInterviewAsync(Guid interviewId, Guid jobSeekerId, CancellationToken ct = default)
    {
        var entity = await GetInterviewForJobSeekerAsync(interviewId, jobSeekerId, ct);
        EnsureCanRespond(entity);
        if (entity.Status == InterviewStatus.Declined)
        {
            return await MapAsync(entity, ct);
        }

        entity.Status = InterviewStatus.Declined;
        await interviewRepository.SaveChangesAsync(ct);
        await CreateRecruiterNotificationAsync(
            entity,
            NotificationType.Warning,
            "Interview declined",
            $"{ResolveCandidateName(entity)} declined the interview for {entity.Job.Title}.",
            ct);
        return await MapAsync(entity, ct);
    }

    // Requests reschedule.
    public async Task<InterviewDto> RequestRescheduleAsync(Guid interviewId, Guid jobSeekerId, RequestInterviewRescheduleRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            throw new ArgumentException("message is required");
        }

        var entity = await GetInterviewForJobSeekerAsync(interviewId, jobSeekerId, ct);
        EnsureCanReschedule(entity);
        if (entity.Status == InterviewStatus.RescheduleRequested)
        {
            return await MapAsync(entity, ct);
        }

        var rescheduleRequest = new InterviewRescheduleRequestEntity
        {
            Id = Guid.NewGuid(),
            InterviewId = entity.Id,
            JobSeekerId = jobSeekerId,
            Message = request.Message.Trim(),
            CreatedAtUtc = dateTimeProvider.UtcNow,
        };

        entity.Status = InterviewStatus.RescheduleRequested;
        await interviewRepository.AddRescheduleRequestAsync(rescheduleRequest, ct);
        await interviewRepository.SaveChangesAsync(ct);
        await CreateRecruiterNotificationAsync(
            entity,
            NotificationType.Info,
            "Interview reschedule requested",
            $"{ResolveCandidateName(entity)} requested to reschedule the interview for {entity.Job.Title}.",
            ct);

        return await MapAsync(entity, ct);
    }

    // Determines whether cel interview.
    public async Task<InterviewDto> CancelInterviewAsync(Guid? companyId, Guid recruiterId, Guid interviewId, CancelInterviewRequest request, CancellationToken ct = default)
    {
        var entity = await GetInterviewForRecruiterAsync(interviewId, companyId, recruiterId, ct);
        EnsureCanCancel(entity);

        entity.Status = InterviewStatus.Cancelled;
        entity.CancelReason = string.IsNullOrWhiteSpace(request.Reason) ? "Cancelled by recruiter." : request.Reason.Trim();
        entity.CancelledAtUtc = dateTimeProvider.UtcNow;

        await SaveInterviewChangesAsync(interviewId, ct);
        await CreateJobSeekerNotificationAsync(
            entity,
            NotificationType.Warning,
            "Interview cancelled",
            BuildCancelNotificationMessage(entity),
            ct);

        return await MapAsync(entity, ct);
    }

    // Marks interview completed.
    public async Task<InterviewDto> MarkInterviewCompletedAsync(Guid? companyId, Guid recruiterId, Guid interviewId, CancellationToken ct = default)
    {
        var entity = await GetInterviewForRecruiterAsync(interviewId, companyId, recruiterId, ct);
        EnsureCanMarkCompleted(entity);

        entity.Status = InterviewStatus.Completed;
        await SaveInterviewChangesAsync(interviewId, ct);
        return await MapAsync(entity, ct);
    }

    // Archives interview.
    public async Task<InterviewDto> ArchiveInterviewAsync(Guid? companyId, Guid recruiterId, Guid interviewId, CancellationToken ct = default)
    {
        var entity = await GetInterviewForRecruiterAsync(interviewId, companyId, recruiterId, ct);
        EnsureCanArchive(entity);

        entity.IsArchived = true;
        entity.ArchivedAtUtc = dateTimeProvider.UtcNow;
        await SaveInterviewChangesAsync(interviewId, ct);
        return await MapAsync(entity, ct);
    }

    // Archives interview.
    public async Task<InterviewDto> ArchiveInterviewAsync(Guid interviewId, Guid jobSeekerId, CancellationToken ct = default)
    {
        var entity = await GetInterviewForJobSeekerAsync(interviewId, jobSeekerId, ct);
        EnsureCanArchive(entity);

        entity.IsArchived = true;
        entity.ArchivedAtUtc = dateTimeProvider.UtcNow;
        await SaveInterviewChangesAsync(interviewId, ct);
        return await MapAsync(entity, ct);
    }

    // Restores interview.
    public async Task<InterviewDto> UnarchiveInterviewAsync(Guid interviewId, Guid jobSeekerId, CancellationToken ct = default)
    {
        var entity = await GetInterviewForJobSeekerAsync(interviewId, jobSeekerId, ct);
        EnsureCanUnarchive(entity);

        entity.IsArchived = false;
        entity.ArchivedAtUtc = null;
        await SaveInterviewChangesAsync(interviewId, ct);
        return await MapAsync(entity, ct);
    }

    // Loads by recruiter.
    public async Task<IReadOnlyList<InterviewDto>> GetByRecruiterAsync(Guid recruiterId, CancellationToken ct = default)
        => await GetByRecruiterAsync(null, recruiterId, ct);

    // Loads by recruiter.
    public async Task<IReadOnlyList<InterviewDto>> GetByRecruiterAsync(Guid? companyId, Guid recruiterId, CancellationToken ct = default)
    {
        var items = companyId.HasValue && companyId.Value != Guid.Empty
            ? await interviewRepository.GetInterviewsForCompanyAsync(companyId.Value, ct)
            : await interviewRepository.GetByRecruiterAsync(recruiterId, ct);

        var scopedItems = items
            .Where(item => item.RecruiterId == recruiterId)
            .ToList();

        return await MapAsync(scopedItems, ct);
    }

    // Loads by job seeker.
    public async Task<IReadOnlyList<InterviewDto>> GetByJobSeekerAsync(Guid jobSeekerId, CancellationToken ct = default)
    {
        var items = await interviewRepository.GetByJobSeekerAsync(jobSeekerId, ct);
        return await MapAsync(items, ct);
    }

    // Loads archived by job seeker.
    public async Task<IReadOnlyList<InterviewDto>> GetArchivedByJobSeekerAsync(Guid jobSeekerId, CancellationToken ct = default)
    {
        var items = await interviewRepository.GetArchivedByJobSeekerAsync(jobSeekerId, ct);
        return await MapAsync(items, ct);
    }

    // Loads archived by job seeker.
    public async Task<PagedResult<InterviewDto>> GetArchivedByJobSeekerAsync(Guid jobSeekerId, ArchivedInterviewsQuery query, CancellationToken ct = default)
    {
        var normalizedPageNumber = Math.Max(1, query.PageNumber);
        var normalizedPageSize = Math.Clamp(query.PageSize, 1, 100);
        var result = await interviewRepository.GetArchivedByJobSeekerAsync(
            jobSeekerId,
            normalizedPageNumber,
            normalizedPageSize,
            query.Search,
            query.Status,
            ct);

        var items = await MapAsync(result.Items, ct);
        return new PagedResult<InterviewDto>
        {
            Items = items,
            PageNumber = result.PageNumber,
            PageSize = result.PageSize,
            TotalCount = result.TotalCount,
            TotalPages = result.TotalPages,
        };
    }

    /// <summary>
    /// Generates and emails the ICS invite immediately after interview scheduling so both participants
    /// receive the same canonical calendar event.
    /// </summary>
    private async Task CreateCalendarInvite(InterviewEntity interview, CancellationToken ct)
    {
        var calendarContent = interviewCalendarService.BuildCalendarContent(interview);
        var fileName = $"interview-{interview.Id}.ics";
        var subject = $"Interview scheduled: {ResolveCandidateName(interview)} for {interview.Job.Title}";
        var body = BuildInviteEmailBody(interview);

        if (!string.IsNullOrWhiteSpace(interview.Recruiter.Email))
        {
            await interviewInviteEmailSender.SendCalendarInviteAsync(
                interview.Recruiter.Email,
                subject,
                body,
                fileName,
                calendarContent,
                ct);
        }

        if (!string.IsNullOrWhiteSpace(interview.JobSeeker.Email))
        {
            await interviewInviteEmailSender.SendCalendarInviteAsync(
                interview.JobSeeker.Email,
                subject,
                body,
                fileName,
                calendarContent,
                ct);
        }
    }

    // Creates recruiter notification.
    private async Task CreateRecruiterNotificationAsync(
        InterviewEntity interview,
        NotificationType type,
        string title,
        string message,
        CancellationToken ct)
    {
        if (interview.RecruiterId == Guid.Empty)
        {
            logger.LogWarning("Skipping recruiter notification for interview {InterviewId} because RecruiterId is empty.", interview.Id);
            return;
        }

        await notificationService.CreateNotificationAsync(
            new CreateNotificationRequest
            {
                UserId = interview.RecruiterId,
                Title = title,
                Message = message,
                Type = type,
                RelatedEntityId = interview.Id,
            },
            ct);
    }

    // Loads interview for recruiter.
    private async Task<InterviewEntity> GetInterviewForRecruiterAsync(Guid interviewId, Guid? companyId, Guid recruiterId, CancellationToken ct)
    {
        InterviewEntity? entity;
        if (companyId.HasValue && companyId.Value != Guid.Empty)
        {
            entity = await interviewRepository.GetByIdForRecruiterAsync(interviewId, recruiterId, companyId.Value, ct);
        }
        else
        {
            entity = await interviewRepository.GetByIdAsync(interviewId, ct);
            if (entity is not null && entity.RecruiterId != recruiterId)
            {
                entity = null;
            }
        }

        return entity ?? throw new KeyNotFoundException("Interview not found.");
    }

    // Loads interview for job seeker.
    private async Task<InterviewEntity> GetInterviewForJobSeekerAsync(Guid interviewId, Guid jobSeekerId, CancellationToken ct)
    {
        var entity = await interviewRepository.GetByIdAsync(interviewId, ct)
            ?? throw new KeyNotFoundException("Interview not found.");

        if (entity.JobSeekerId != jobSeekerId)
        {
            throw new UnauthorizedAccessException("Interview does not belong to the current jobseeker.");
        }

        return entity;
    }

    // Handles map.
    private async Task<IReadOnlyList<InterviewDto>> MapAsync(IReadOnlyCollection<InterviewEntity> entities, CancellationToken ct)
    {
        var recruiterLookup = await BuildRecruiterLookupAsync(entities.Select(entity => entity.RecruiterId).Distinct().ToArray(), ct);

        return entities.Select(entity =>
        {
            recruiterLookup.TryGetValue(entity.RecruiterId, out var recruiterContext);
            var jobSeekerName = entity.JobSeeker.UserName;
            if (string.IsNullOrWhiteSpace(jobSeekerName))
            {
                jobSeekerName = entity.JobSeeker.Email;
            }

            return new InterviewDto
            {
                Id = entity.Id,
                JobId = entity.JobId,
                RecruiterId = entity.RecruiterId,
                JobSeekerId = entity.JobSeekerId,
                ScheduledDateTimeUtc = entity.ScheduledDateTimeUtc,
                InterviewType = MapInterviewType(entity.InterviewType),
                LocationOrMeetingLink = entity.LocationOrMeetingLink,
                Message = entity.Message,
                Status = entity.Status,
                CancelReason = entity.CancelReason,
                IsArchived = entity.IsArchived,
                ArchivedAtUtc = entity.ArchivedAtUtc,
                CreatedAtUtc = entity.CreatedAtUtc,
                RecruiterName = recruiterContext?.RecruiterName,
                RecruiterEmail = recruiterContext?.RecruiterEmail,
                CompanyName = recruiterContext?.CompanyName,
                JobTitle = entity.Job?.Title,
                JobSeekerName = string.IsNullOrWhiteSpace(jobSeekerName) ? "Candidate" : jobSeekerName,
                WarningMessage = null,
            };
        }).ToList();
    }

    // Handles map.
    private async Task<InterviewDto> MapAsync(InterviewEntity entity, CancellationToken ct)
        => (await MapAsync(new[] { entity }, ct)).Single();

    // Handles try run side effect.
    private async Task TryRunSideEffectAsync(
        List<string> warnings,
        string warningMessage,
        Func<Task> sideEffect)
    {
        try
        {
            await sideEffect();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Interview side effect failed: {WarningMessage}", warningMessage);
            warnings.Add(warningMessage);
        }
    }

    // Builds recruiter lookup.
    private async Task<Dictionary<Guid, RecruiterContext>> BuildRecruiterLookupAsync(IReadOnlyCollection<Guid> recruiterIds, CancellationToken ct)
    {
        var profiles = await recruiterRepository.GetProfilesByUserIdsAsync(recruiterIds, ct);
        return profiles
            .GroupBy(profile => profile.UserId)
            .ToDictionary(
                group => group.Key,
                group =>
                {
                    var profile = group.First();
                    var recruiterName = profile.User.UserName;
                    if (string.IsNullOrWhiteSpace(recruiterName))
                    {
                        recruiterName = profile.User.Email;
                    }

                    return new RecruiterContext(
                        string.IsNullOrWhiteSpace(recruiterName) ? "Recruiter" : recruiterName,
                        profile.User.Email,
                        profile.Company?.Name);
                });
    }

    // Resolves company ID.
    private async Task<Guid> ResolveCompanyIdAsync(Guid? claimedCompanyId, Guid recruiterId, Guid jobId, CancellationToken ct)
    {
        var profile = await recruiterRepository.GetProfileByUserIdAsync(recruiterId, ct);
        if (profile is not null && profile.CompanyId != Guid.Empty)
        {
            if (claimedCompanyId.HasValue && claimedCompanyId.Value != Guid.Empty && claimedCompanyId.Value != profile.CompanyId)
            {
                throw new UnauthorizedAccessException("Recruiter company context does not match the active profile.");
            }

            return profile.CompanyId;
        }

        var job = await jobRepository.GetByIdAsync(jobId, ct)
            ?? throw new KeyNotFoundException("Job not found.");

        if (claimedCompanyId.HasValue && claimedCompanyId.Value != Guid.Empty && claimedCompanyId.Value != job.CompanyId)
        {
            throw new UnauthorizedAccessException("Interview company context does not match the job company.");
        }

        return job.CompanyId;
    }

    // Ensures candidate is shortlisted.
    private async Task EnsureCandidateIsShortlistedAsync(Guid jobId, Guid jobSeekerId, CancellationToken ct)
    {
        // Interview scheduling is restricted to shortlisted candidates so recruiters cannot
        // create interview records for arbitrary accounts outside the review workflow.
        var matches = await recruiterRepository.GetShortlistedCandidatesByJobAsync(jobId, ct);
        if (!matches.Any(candidate => candidate.JobSeekerUserId == jobSeekerId))
        {
            throw new ArgumentException("Only shortlisted candidates can be scheduled for interviews.");
        }
    }

    // Synchronizes submission to interview stage.
    private async Task SyncSubmissionToInterviewStageAsync(InterviewEntity interview, CancellationToken ct)
    {
        var submission = await recruiterRepository.GetSubmissionForInterviewAsync(
            interview.RecruiterId,
            interview.CompanyId,
            interview.JobId,
            interview.JobSeekerId,
            ct);

        if (submission is null)
        {
            logger.LogWarning(
                "No resume submission found while syncing interview stage for recruiter {RecruiterId}, job {JobId}, jobseeker {JobSeekerId}.",
                interview.RecruiterId,
                interview.JobId,
                interview.JobSeekerId);
            return;
        }

        // Scheduling moves the linked application into Interview stage so every recruiter entry
        // point stays aligned and accepted interviews never remain stuck in Shortlisted.
        if (submission.Status == ResumeSubmissionStatus.Shortlisted)
        {
            submission.Status = ApplicantStageTransitionPolicy.ResolveNextStatus(
                submission.Status,
                "set-interview");
            submission.UpdatedAtUtc = dateTimeProvider.UtcNow;
        }
    }

    // Builds invite email body.
    private static string BuildInviteEmailBody(InterviewEntity interview)
    {
        var candidateName = ResolveCandidateName(interview);
        var recruiterName = ResolveRecruiterName(interview);
        var interviewType = interview.InterviewType.ToString();
        var statusLabel = interview.Status == InterviewStatus.Rescheduled ? "rescheduled" : "scheduled";
        var locationLabel = interview.InterviewType == InterviewType.Virtual ? "Meeting link" : "Location / Address";

        return string.Join(Environment.NewLine, new[]
        {
            $"Interview {statusLabel} for {candidateName}.",
            $"Job title: {interview.Job.Title}",
            $"Recruiter: {recruiterName}",
            $"Interview date (UTC): {interview.ScheduledDateTimeUtc:yyyy-MM-dd}",
            $"Interview time (UTC): {interview.ScheduledDateTimeUtc:HH:mm}",
            $"Interview type: {interviewType}",
            $"{locationLabel}: {interview.LocationOrMeetingLink}",
        });
    }

    // Resolves candidate name.
    private static string ResolveCandidateName(InterviewEntity interview)
        => string.IsNullOrWhiteSpace(interview.JobSeeker.UserName)
            ? interview.JobSeeker.Email ?? "Candidate"
            : interview.JobSeeker.UserName;

    // Resolves recruiter name.
    private static string ResolveRecruiterName(InterviewEntity interview)
        => string.IsNullOrWhiteSpace(interview.Recruiter.UserName)
            ? interview.Recruiter.Email ?? "Recruiter"
            : interview.Recruiter.UserName;

    // Validates interview details.
    private static void ValidateInterviewDetails(InterviewType interviewType, string locationOrMeetingLink)
    {
        if (string.IsNullOrWhiteSpace(locationOrMeetingLink))
        {
            throw new ArgumentException(
                interviewType == InterviewType.Virtual
                    ? "Meeting link is required for virtual interviews."
                    : "Location / Address is required for onsite interviews.");
        }

        if (interviewType == InterviewType.Virtual
            && (!Uri.TryCreate(locationOrMeetingLink.Trim(), UriKind.Absolute, out var uri)
                || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)))
        {
            throw new ArgumentException("A valid meeting link is required for virtual interviews.");
        }
    }

    // Validates scheduled date.
    private static void ValidateScheduledDate(DateTime scheduledDateTimeUtc, DateTime utcNow)
    {
        if (scheduledDateTimeUtc == default)
        {
            throw new ArgumentException("Interview date and time is required.");
        }

        if (scheduledDateTimeUtc.Kind == DateTimeKind.Unspecified)
        {
            throw new ArgumentException("Interview date and time must include a timezone.");
        }

        if (scheduledDateTimeUtc.ToUniversalTime() <= utcNow.AddMinutes(-1))
        {
            throw new ArgumentException("Interview date and time must be in the future.");
        }
    }

    // Handles apply reschedule.
    private void ApplyReschedule(InterviewEntity entity, RescheduleInterviewRequest request)
    {
        var interviewType = MapInterviewType(request.InterviewType);
        ValidateScheduledDate(request.ScheduledDateTimeUtc, dateTimeProvider.UtcNow);
        ValidateInterviewDetails(interviewType, request.LocationOrMeetingLink);

        entity.ScheduledDateTimeUtc = request.ScheduledDateTimeUtc.ToUniversalTime();
        entity.InterviewType = interviewType;
        entity.LocationOrMeetingLink = request.LocationOrMeetingLink.Trim();
        entity.Message = string.IsNullOrWhiteSpace(request.Message) ? null : request.Message.Trim();
        entity.Status = InterviewStatus.Rescheduled;
    }

    // Ensures can reschedule.
    private static void EnsureCanReschedule(InterviewEntity entity)
    {
        // Declined and cancelled interviews are terminal scheduling states.
        // They may be archived, but they cannot be rescheduled in-place.
        if (entity.IsArchived)
        {
            throw new ArgumentException("Archived interviews cannot be modified.");
        }

        if (entity.Status == InterviewStatus.Declined)
        {
            throw new ArgumentException("Declined interviews cannot be rescheduled.");
        }

        if (entity.Status == InterviewStatus.Cancelled)
        {
            throw new ArgumentException("Cancelled interviews cannot be rescheduled.");
        }

        if (entity.Status == InterviewStatus.Completed)
        {
            throw new ArgumentException("Completed interviews cannot be rescheduled.");
        }
    }

    // Ensures can respond.
    private static void EnsureCanRespond(InterviewEntity entity)
    {
        if (entity.IsArchived)
        {
            throw new ArgumentException("Archived interviews cannot be updated.");
        }

        if (entity.Status == InterviewStatus.Cancelled)
        {
            throw new ArgumentException("Cancelled interviews cannot be updated.");
        }

        if (entity.Status == InterviewStatus.Completed)
        {
            throw new ArgumentException("Completed interviews cannot be updated.");
        }
    }

    // Ensures can cancel.
    private static void EnsureCanCancel(InterviewEntity entity)
    {
        if (entity.IsArchived)
        {
            throw new ArgumentException("Archived interviews cannot be cancelled.");
        }

        if (entity.Status == InterviewStatus.Cancelled)
        {
            throw new ArgumentException("Interview is already cancelled.");
        }

        if (entity.Status == InterviewStatus.Completed)
        {
            throw new ArgumentException("Completed interviews cannot be cancelled.");
        }
    }

    // Ensures can archive.
    private static void EnsureCanArchive(InterviewEntity entity)
    {
        if (entity.IsArchived)
        {
            throw new ArgumentException("Interview is already archived.");
        }

        if (entity.Status is not InterviewStatus.Declined and not InterviewStatus.Cancelled and not InterviewStatus.Completed)
        {
            throw new ArgumentException("Only completed, declined, or cancelled interviews can be archived.");
        }
    }

    // Ensures can unarchive.
    private static void EnsureCanUnarchive(InterviewEntity entity)
    {
        if (!entity.IsArchived)
        {
            throw new ArgumentException("Interview is not archived.");
        }
    }

    // Saves interview changes.
    private async Task SaveInterviewChangesAsync(Guid interviewId, CancellationToken ct)
    {
        try
        {
            await interviewRepository.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(
                ex,
                "Failed to save interview changes for interview {InterviewId}. Inner exception: {InnerMessage}",
                interviewId,
                ex.InnerException?.Message);
            throw;
        }
    }

    // Ensures can mark completed.
    private static void EnsureCanMarkCompleted(InterviewEntity entity)
    {
        if (entity.IsArchived)
        {
            throw new ArgumentException("Archived interviews cannot be completed.");
        }

        if (entity.Status == InterviewStatus.Completed)
        {
            throw new ArgumentException("Interview is already marked as completed.");
        }

        if (entity.Status == InterviewStatus.Declined)
        {
            throw new ArgumentException("Declined interviews cannot be completed.");
        }

        if (entity.Status == InterviewStatus.Cancelled)
        {
            throw new ArgumentException("Cancelled interviews cannot be completed.");
        }

        if (entity.Status != InterviewStatus.Accepted)
        {
            throw new ArgumentException("Only accepted interviews can be marked as completed.");
        }
    }

    // Ensures no schedule conflicts.
    private async Task EnsureNoScheduleConflictsAsync(Guid recruiterId, Guid jobSeekerId, DateTime startsAtUtc, Guid? excludeInterviewId, CancellationToken ct)
    {
        var normalizedStart = startsAtUtc.ToUniversalTime();
        var normalizedEnd = normalizedStart.AddMinutes(DefaultInterviewDurationMinutes);

        if (await interviewRepository.HasRecruiterConflictAsync(recruiterId, normalizedStart, normalizedEnd, excludeInterviewId, ct))
        {
            throw new ArgumentException("This recruiter already has an interview scheduled at that time.");
        }

        if (await interviewRepository.HasJobSeekerConflictAsync(jobSeekerId, normalizedStart, normalizedEnd, excludeInterviewId, ct))
        {
            throw new ArgumentException("This candidate already has an interview scheduled at that time.");
        }
    }

    // Creates job seeker notification.
    private async Task CreateJobSeekerNotificationAsync(
        InterviewEntity interview,
        NotificationType type,
        string title,
        string message,
        CancellationToken ct)
    {
        if (interview.JobSeekerId == Guid.Empty)
        {
            logger.LogWarning("Skipping jobseeker notification for interview {InterviewId} because JobSeekerId is empty.", interview.Id);
            return;
        }

        await notificationService.CreateNotificationAsync(
            new CreateNotificationRequest
            {
                UserId = interview.JobSeekerId,
                Title = title,
                Message = message,
                Type = type,
                RelatedEntityId = interview.Id,
            },
            ct);
    }

    // Builds schedule notification message.
    private static string BuildScheduleNotificationMessage(InterviewEntity interview)
        => $"{interview.Job.Title} at {ResolveCompanyName(interview)} was scheduled for {interview.ScheduledDateTimeUtc:yyyy-MM-dd HH:mm} UTC.";

    // Builds reschedule notification message.
    private static string BuildRescheduleNotificationMessage(InterviewEntity interview)
        => $"{interview.Job.Title} at {ResolveCompanyName(interview)} was rescheduled to {interview.ScheduledDateTimeUtc:yyyy-MM-dd HH:mm} UTC.";

    // Builds cancel notification message.
    private static string BuildCancelNotificationMessage(InterviewEntity interview)
        => $"{interview.Job.Title} at {ResolveCompanyName(interview)} was cancelled."
            + (string.IsNullOrWhiteSpace(interview.CancelReason) ? string.Empty : $" Reason: {interview.CancelReason.Trim()}");

    // Resolves company name.
    private static string ResolveCompanyName(InterviewEntity interview)
        => string.IsNullOrWhiteSpace(interview.Job.CompanyNameSnapshot) ? "the company" : interview.Job.CompanyNameSnapshot;

    // Maps interview type.
    private static InterviewType MapInterviewType(InterviewTypeDto interviewType)
        => interviewType switch
        {
            InterviewTypeDto.Virtual => InterviewType.Virtual,
            InterviewTypeDto.Onsite => InterviewType.Onsite,
            _ => throw new ArgumentOutOfRangeException(nameof(interviewType), interviewType, "Unsupported interview type."),
        };

    // Maps interview type.
    private static InterviewTypeDto MapInterviewType(InterviewType interviewType)
        => interviewType switch
        {
            InterviewType.Virtual => InterviewTypeDto.Virtual,
            InterviewType.Onsite => InterviewTypeDto.Onsite,
            _ => throw new ArgumentOutOfRangeException(nameof(interviewType), interviewType, "Unsupported interview type."),
        };

    private sealed record RecruiterContext(string RecruiterName, string? RecruiterEmail, string? CompanyName);
}
