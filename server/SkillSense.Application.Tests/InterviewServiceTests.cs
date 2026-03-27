using SkillSense.Application.Contracts.Interviews;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Services.Interviews;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;
using Microsoft.Extensions.Logging.Abstractions;
using SkillSense.Application.Contracts.Notifications;

namespace SkillSense.Application.Tests;

public sealed class InterviewServiceTests
{
    [Fact]
    public async Task ScheduleInterviewAsync_SendsCalendarInviteToRecruiterAndJobSeeker()
    {
        var companyId = Guid.NewGuid();
        var recruiterId = Guid.NewGuid();
        var jobId = Guid.NewGuid();
        var jobSeekerId = Guid.NewGuid();
        var scheduledUtc = new DateTime(2026, 3, 20, 9, 30, 0, DateTimeKind.Utc);

        var interviewRepository = new InMemoryInterviewRepository();
        var recruiterRepository = new StubRecruiterRepository(companyId, recruiterId, jobSeekerId, "recruiter@nexskill.test");
        var jobRepository = new StubJobRepository(companyId, jobId);
        var calendarService = new RecordingInterviewCalendarService();
        var inviteSender = new RecordingInterviewInviteEmailSender();
        var dateTimeProvider = new StubDateTimeProvider(new DateTime(2026, 3, 13, 0, 0, 0, DateTimeKind.Utc));

        var service = new InterviewService(
            interviewRepository,
            recruiterRepository,
            jobRepository,
            calendarService,
            inviteSender,
            dateTimeProvider,
            new RecordingNotificationService(),
            NullLogger<InterviewService>.Instance);

        var result = await service.ScheduleInterviewAsync(
            companyId,
            new ScheduleInterviewRequest
            {
                JobId = jobId,
                RecruiterId = recruiterId,
                JobSeekerId = jobSeekerId,
                ScheduledDateTimeUtc = scheduledUtc,
                InterviewType = InterviewTypeDto.Virtual,
                LocationOrMeetingLink = "https://meet.nexskill.test/interview-123",
                Message = "Please join five minutes early.",
            },
            CancellationToken.None);

        Assert.Equal(jobId, result.JobId);
        Assert.Equal(ResumeSubmissionStatus.Interview, recruiterRepository.Submission.Status);
        Assert.Equal(2, inviteSender.SentInvites.Count);
        Assert.Contains(inviteSender.SentInvites, invite => invite.ToEmail == "recruiter@nexskill.test");
        Assert.Contains(inviteSender.SentInvites, invite => invite.ToEmail == "jobseeker@nexskill.test");
        Assert.All(inviteSender.SentInvites, invite => Assert.Equal($"interview-{result.Id}.ics", invite.AttachmentFileName));
        Assert.Contains("Interview with Job Seeker", calendarService.LastCalendarContent);
        Assert.Contains("Job title: Senior Backend Engineer", calendarService.LastCalendarContent);
        Assert.Contains("Interview type: Virtual", calendarService.LastCalendarContent);
        Assert.Contains("Meeting link: https://meet.nexskill.test/interview-123", calendarService.LastCalendarContent);
    }

    [Fact]
    public async Task RescheduleInterviewAsync_UpdatesScheduleTypeLocationAndStatus()
    {
        var companyId = Guid.NewGuid();
        var recruiterId = Guid.NewGuid();
        var jobId = Guid.NewGuid();
        var jobSeekerId = Guid.NewGuid();

        var interviewRepository = new InMemoryInterviewRepository();
        var recruiterRepository = new StubRecruiterRepository(companyId, recruiterId, jobSeekerId, "recruiter@nexskill.test");
        var jobRepository = new StubJobRepository(companyId, jobId);
        var calendarService = new RecordingInterviewCalendarService();
        var inviteSender = new RecordingInterviewInviteEmailSender();
        var dateTimeProvider = new StubDateTimeProvider(new DateTime(2026, 3, 13, 0, 0, 0, DateTimeKind.Utc));

        var existingInterview = new InterviewEntity
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            JobId = jobId,
            RecruiterId = recruiterId,
            JobSeekerId = jobSeekerId,
            ScheduledDateTimeUtc = new DateTime(2026, 3, 20, 9, 30, 0, DateTimeKind.Utc),
            InterviewType = InterviewType.Virtual,
            LocationOrMeetingLink = "https://meet.nexskill.test/original",
            Message = "Original",
            Status = InterviewStatus.Pending,
            CreatedAtUtc = dateTimeProvider.UtcNow,
            Job = new JobEntity { Id = jobId, CompanyId = companyId, RecruiterId = recruiterId, Title = "Senior Backend Engineer" },
            Recruiter = new AppUser { Id = recruiterId, Email = "recruiter@nexskill.test", UserName = "Recruiter User" },
            JobSeeker = new AppUser { Id = jobSeekerId, Email = "jobseeker@nexskill.test", UserName = "Job Seeker" },
        };
        interviewRepository.Seed(existingInterview);

        var service = new InterviewService(
            interviewRepository,
            recruiterRepository,
            jobRepository,
            calendarService,
            inviteSender,
            dateTimeProvider,
            new RecordingNotificationService(),
            NullLogger<InterviewService>.Instance);

        var result = await service.RescheduleInterviewAsync(
            companyId,
            recruiterId,
            existingInterview.Id,
            new RescheduleInterviewRequest
            {
                ScheduledDateTimeUtc = new DateTime(2026, 3, 21, 11, 0, 0, DateTimeKind.Utc),
                InterviewType = InterviewTypeDto.Onsite,
                LocationOrMeetingLink = "HQ - Floor 8",
                Message = "Please check in at reception.",
            },
            CancellationToken.None);

        Assert.Equal(InterviewStatus.Rescheduled, result.Status);
        Assert.Equal(InterviewTypeDto.Onsite, result.InterviewType);
        Assert.Equal("HQ - Floor 8", result.LocationOrMeetingLink);
        Assert.Equal("Please check in at reception.", result.Message);
        Assert.Equal(new DateTime(2026, 3, 21, 11, 0, 0, DateTimeKind.Utc), result.ScheduledDateTimeUtc);
        Assert.Contains("Interview rescheduled for Job Seeker.", string.Join('\n', inviteSender.SentInvites.Select(invite => invite.Body)));
    }

    [Fact]
    public async Task AcceptInterviewAsync_ForJobSeeker_CreatesRecruiterNotification()
    {
        var companyId = Guid.NewGuid();
        var recruiterId = Guid.NewGuid();
        var jobId = Guid.NewGuid();
        var jobSeekerId = Guid.NewGuid();
        var notificationService = new RecordingNotificationService();
        var interviewRepository = new InMemoryInterviewRepository();
        var recruiterRepository = new StubRecruiterRepository(companyId, recruiterId, jobSeekerId, "recruiter@nexskill.test");
        var jobRepository = new StubJobRepository(companyId, jobId);
        var calendarService = new RecordingInterviewCalendarService();
        var inviteSender = new RecordingInterviewInviteEmailSender();
        var dateTimeProvider = new StubDateTimeProvider(new DateTime(2026, 3, 13, 0, 0, 0, DateTimeKind.Utc));

        interviewRepository.Seed(new InterviewEntity
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            JobId = jobId,
            RecruiterId = recruiterId,
            JobSeekerId = jobSeekerId,
            ScheduledDateTimeUtc = new DateTime(2026, 3, 20, 9, 30, 0, DateTimeKind.Utc),
            InterviewType = InterviewType.Virtual,
            LocationOrMeetingLink = "https://meet.nexskill.test/original",
            Status = InterviewStatus.Pending,
            CreatedAtUtc = dateTimeProvider.UtcNow,
            Job = new JobEntity { Id = jobId, CompanyId = companyId, RecruiterId = recruiterId, Title = "Senior Backend Engineer" },
            Recruiter = new AppUser { Id = recruiterId, Email = "recruiter@nexskill.test", UserName = "Recruiter User" },
            JobSeeker = new AppUser { Id = jobSeekerId, Email = "jobseeker@nexskill.test", UserName = "Job Seeker" },
        });

        var service = new InterviewService(
            interviewRepository,
            recruiterRepository,
            jobRepository,
            calendarService,
            inviteSender,
            dateTimeProvider,
            notificationService,
            NullLogger<InterviewService>.Instance);

        await service.AcceptInterviewAsync(interviewRepository.SingleId, jobSeekerId, CancellationToken.None);

        Assert.Contains(notificationService.Created, item => item.UserId == recruiterId && item.Title == "Interview accepted");
    }

    [Fact]
    public async Task MarkInterviewCompletedAsync_RequiresAcceptedInterview()
    {
        var companyId = Guid.NewGuid();
        var recruiterId = Guid.NewGuid();
        var jobId = Guid.NewGuid();
        var jobSeekerId = Guid.NewGuid();
        var interviewRepository = new InMemoryInterviewRepository();
        var recruiterRepository = new StubRecruiterRepository(companyId, recruiterId, jobSeekerId, "recruiter@nexskill.test");
        var jobRepository = new StubJobRepository(companyId, jobId);
        var service = new InterviewService(
            interviewRepository,
            recruiterRepository,
            jobRepository,
            new RecordingInterviewCalendarService(),
            new RecordingInterviewInviteEmailSender(),
            new StubDateTimeProvider(new DateTime(2026, 3, 13, 0, 0, 0, DateTimeKind.Utc)),
            new RecordingNotificationService(),
            NullLogger<InterviewService>.Instance);

        var interview = new InterviewEntity
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            JobId = jobId,
            RecruiterId = recruiterId,
            JobSeekerId = jobSeekerId,
            ScheduledDateTimeUtc = new DateTime(2026, 3, 20, 9, 30, 0, DateTimeKind.Utc),
            InterviewType = InterviewType.Virtual,
            LocationOrMeetingLink = "https://meet.nexskill.test/original",
            Status = InterviewStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow,
        };
        interviewRepository.Seed(interview);

        var error = await Assert.ThrowsAsync<ArgumentException>(() =>
            service.MarkInterviewCompletedAsync(companyId, recruiterId, interview.Id, CancellationToken.None));

        Assert.Equal("Only accepted interviews can be marked as completed.", error.Message);
    }

    [Fact]
    public async Task ArchiveInterviewAsync_AllowsCompletedInterview()
    {
        var companyId = Guid.NewGuid();
        var recruiterId = Guid.NewGuid();
        var jobId = Guid.NewGuid();
        var jobSeekerId = Guid.NewGuid();
        var interviewRepository = new InMemoryInterviewRepository();
        var recruiterRepository = new StubRecruiterRepository(companyId, recruiterId, jobSeekerId, "recruiter@nexskill.test");
        var jobRepository = new StubJobRepository(companyId, jobId);
        var dateTimeProvider = new StubDateTimeProvider(new DateTime(2026, 3, 13, 0, 0, 0, DateTimeKind.Utc));
        var service = new InterviewService(
            interviewRepository,
            recruiterRepository,
            jobRepository,
            new RecordingInterviewCalendarService(),
            new RecordingInterviewInviteEmailSender(),
            dateTimeProvider,
            new RecordingNotificationService(),
            NullLogger<InterviewService>.Instance);

        var interview = new InterviewEntity
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            JobId = jobId,
            RecruiterId = recruiterId,
            JobSeekerId = jobSeekerId,
            ScheduledDateTimeUtc = new DateTime(2026, 3, 20, 9, 30, 0, DateTimeKind.Utc),
            InterviewType = InterviewType.Virtual,
            LocationOrMeetingLink = "https://meet.nexskill.test/original",
            Status = InterviewStatus.Completed,
            CreatedAtUtc = DateTime.UtcNow,
            Job = new JobEntity { Id = jobId, CompanyId = companyId, RecruiterId = recruiterId, Title = "Senior Backend Engineer" },
            Recruiter = new AppUser { Id = recruiterId, Email = "recruiter@nexskill.test", UserName = "Recruiter User" },
            JobSeeker = new AppUser { Id = jobSeekerId, Email = "jobseeker@nexskill.test", UserName = "Job Seeker" },
        };
        interviewRepository.Seed(interview);

        var result = await service.ArchiveInterviewAsync(interview.Id, jobSeekerId, CancellationToken.None);

        Assert.True(result.IsArchived);
    }

    [Fact]
    public async Task ScheduleInterviewAsync_RejectsRecruiterConflicts()
    {
        var companyId = Guid.NewGuid();
        var recruiterId = Guid.NewGuid();
        var jobId = Guid.NewGuid();
        var jobSeekerId = Guid.NewGuid();
        var scheduledUtc = new DateTime(2026, 3, 20, 9, 30, 0, DateTimeKind.Utc);

        var interviewRepository = new InMemoryInterviewRepository();
        interviewRepository.Seed(new InterviewEntity
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            JobId = Guid.NewGuid(),
            RecruiterId = recruiterId,
            JobSeekerId = Guid.NewGuid(),
            ScheduledDateTimeUtc = scheduledUtc.AddMinutes(15),
            InterviewType = InterviewType.Virtual,
            LocationOrMeetingLink = "https://meet.nexskill.test/conflict",
            Status = InterviewStatus.Accepted,
            CreatedAtUtc = DateTime.UtcNow,
        });

        var recruiterRepository = new StubRecruiterRepository(companyId, recruiterId, jobSeekerId, "recruiter@nexskill.test");
        var jobRepository = new StubJobRepository(companyId, jobId);
        var service = new InterviewService(
            interviewRepository,
            recruiterRepository,
            jobRepository,
            new RecordingInterviewCalendarService(),
            new RecordingInterviewInviteEmailSender(),
            new StubDateTimeProvider(new DateTime(2026, 3, 13, 0, 0, 0, DateTimeKind.Utc)),
            new RecordingNotificationService(),
            NullLogger<InterviewService>.Instance);

        var error = await Assert.ThrowsAsync<ArgumentException>(() =>
            service.ScheduleInterviewAsync(
                companyId,
                new ScheduleInterviewRequest
                {
                    JobId = jobId,
                    RecruiterId = recruiterId,
                    JobSeekerId = jobSeekerId,
                    ScheduledDateTimeUtc = scheduledUtc,
                    InterviewType = InterviewTypeDto.Virtual,
                    LocationOrMeetingLink = "https://meet.nexskill.test/interview-456",
                },
                CancellationToken.None));

        Assert.Equal("This recruiter already has an interview scheduled at that time.", error.Message);
    }

    private sealed class StubDateTimeProvider(DateTime utcNow) : IDateTimeProvider
    {
        public DateTime UtcNow { get; } = utcNow;
    }

    private sealed class RecordingInterviewCalendarService : IInterviewCalendarService
    {
        public string LastCalendarContent { get; private set; } = string.Empty;

        public string BuildCalendarContent(InterviewEntity interview, TimeSpan? duration = null)
        {
            LastCalendarContent = string.Join(
                "\n",
                "BEGIN:VCALENDAR",
                "BEGIN:VEVENT",
                $"SUMMARY:Interview with {interview.JobSeeker.UserName}",
                $"DESCRIPTION:Job title: {interview.Job.Title}\\nInterview type: Virtual\\nMeeting link: {interview.LocationOrMeetingLink}",
                "END:VEVENT",
                "END:VCALENDAR");

            return LastCalendarContent;
        }
    }

    private sealed class RecordingInterviewInviteEmailSender : IInterviewInviteEmailSender
    {
        public List<SentInvite> SentInvites { get; } = [];

        public Task SendCalendarInviteAsync(
            string toEmail,
            string subject,
            string body,
            string attachmentFileName,
            string calendarContent,
            CancellationToken ct = default)
        {
            SentInvites.Add(new SentInvite(toEmail, subject, body, attachmentFileName, calendarContent));
            return Task.CompletedTask;
        }
    }

    private sealed record SentInvite(
        string ToEmail,
        string Subject,
        string Body,
        string AttachmentFileName,
        string CalendarContent);

    private sealed class RecordingNotificationService : INotificationService
    {
        public List<CreateNotificationRequest> Created { get; } = [];

        public Task<NotificationDto> CreateNotificationAsync(CreateNotificationRequest request, CancellationToken ct = default)
        {
            Created.Add(request);
            return Task.FromResult(new NotificationDto
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Title = request.Title,
                Message = request.Message,
                Type = request.Type,
                IsRead = false,
                CreatedAtUtc = DateTime.UtcNow,
                RelatedEntityId = request.RelatedEntityId,
            });
        }

        public Task<IReadOnlyList<NotificationDto>> GetNotificationsByUserAsync(Guid userId, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyList<NotificationDto>>([]);

        public Task MarkAsReadAsync(Guid userId, Guid notificationId, CancellationToken ct = default)
            => Task.CompletedTask;

        public Task MarkAllAsReadAsync(Guid userId, CancellationToken ct = default)
            => Task.CompletedTask;

        public Task<int> DeleteNotificationsAsync(Guid userId, IReadOnlyList<Guid> notificationIds, CancellationToken ct = default)
            => Task.FromResult(0);

        public Task<int> DeleteAllNotificationsAsync(Guid userId, CancellationToken ct = default)
            => Task.FromResult(0);
    }

    private sealed class InMemoryInterviewRepository : IInterviewRepository
    {
        private readonly List<InterviewEntity> _interviews = [];
        public Guid SingleId => _interviews.Single().Id;

        public void Seed(InterviewEntity interview)
        {
            _interviews.Add(interview);
        }

        public Task AddAsync(InterviewEntity interview, CancellationToken ct = default)
        {
            interview.Job = new JobEntity
            {
                Id = interview.JobId,
                CompanyId = interview.CompanyId,
                RecruiterId = interview.RecruiterId,
                Title = "Senior Backend Engineer",
            };
            interview.Recruiter = new AppUser
            {
                Id = interview.RecruiterId,
                Email = "recruiter@nexskill.test",
                UserName = "Recruiter User",
            };
            interview.JobSeeker = new AppUser
            {
                Id = interview.JobSeekerId,
                Email = "jobseeker@nexskill.test",
                UserName = "Job Seeker",
            };

            _interviews.Add(interview);
            return Task.CompletedTask;
        }

        public Task<InterviewEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)
            => Task.FromResult(_interviews.SingleOrDefault(item => item.Id == id));

        public Task<InterviewEntity?> GetByIdForRecruiterAsync(Guid id, Guid recruiterId, Guid companyId, CancellationToken ct = default)
            => Task.FromResult(_interviews.SingleOrDefault(item => item.Id == id && item.RecruiterId == recruiterId && item.CompanyId == companyId));

        public Task<InterviewEntity?> GetByIdForJobSeekerAsync(Guid id, Guid jobSeekerId, CancellationToken ct = default)
            => Task.FromResult(_interviews.SingleOrDefault(item => item.Id == id && item.JobSeekerId == jobSeekerId));

        public Task<InterviewEntity?> GetActiveByIdAsync(Guid id, CancellationToken ct = default)
            => Task.FromResult(_interviews.SingleOrDefault(item => item.Id == id && !item.IsArchived));

        public Task<InterviewEntity?> GetActiveByIdForRecruiterAsync(Guid id, Guid recruiterId, Guid companyId, CancellationToken ct = default)
            => Task.FromResult(_interviews.SingleOrDefault(item => item.Id == id && item.RecruiterId == recruiterId && item.CompanyId == companyId && !item.IsArchived));

        public Task<InterviewEntity?> GetActiveByIdForJobSeekerAsync(Guid id, Guid jobSeekerId, CancellationToken ct = default)
            => Task.FromResult(_interviews.SingleOrDefault(item => item.Id == id && item.JobSeekerId == jobSeekerId && !item.IsArchived));

        public Task<IReadOnlyList<InterviewEntity>> GetInterviewsForCompanyAsync(Guid companyId, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyList<InterviewEntity>>(_interviews.Where(item => item.CompanyId == companyId).ToList());

        public Task<IReadOnlyList<InterviewEntity>> GetByRecruiterAsync(Guid recruiterId, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyList<InterviewEntity>>(_interviews.Where(item => item.RecruiterId == recruiterId).ToList());

        public Task<IReadOnlyList<InterviewEntity>> GetByJobSeekerAsync(Guid jobSeekerId, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyList<InterviewEntity>>(_interviews.Where(item => item.JobSeekerId == jobSeekerId).ToList());

        public Task<IReadOnlyList<InterviewEntity>> GetArchivedByJobSeekerAsync(Guid jobSeekerId, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyList<InterviewEntity>>(
                _interviews.Where(item => item.JobSeekerId == jobSeekerId && item.IsArchived).ToList());

        public Task<PagedData<InterviewEntity>> GetArchivedByJobSeekerAsync(Guid jobSeekerId, int pageNumber, int pageSize, string? search, string? status, CancellationToken ct = default)
        {
            IEnumerable<InterviewEntity> query = _interviews.Where(item => item.JobSeekerId == jobSeekerId && item.IsArchived);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalizedSearch = search.Trim().ToLowerInvariant();
                query = query.Where(item =>
                    (item.Job?.Title?.ToLowerInvariant().Contains(normalizedSearch) ?? false) ||
                    (item.Job?.CompanyNameSnapshot?.ToLowerInvariant().Contains(normalizedSearch) ?? false) ||
                    (item.Recruiter?.UserName?.ToLowerInvariant().Contains(normalizedSearch) ?? false) ||
                    (item.Recruiter?.Email?.ToLowerInvariant().Contains(normalizedSearch) ?? false) ||
                    item.LocationOrMeetingLink.ToLowerInvariant().Contains(normalizedSearch));
            }

            if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<InterviewStatus>(status, true, out var parsedStatus))
            {
                query = query.Where(item => item.Status == parsedStatus);
            }

            var totalCount = query.Count();
            var totalPages = totalCount == 0 ? 1 : (int)Math.Ceiling(totalCount / (double)pageSize);
            var items = query
                .OrderByDescending(item => item.ArchivedAtUtc ?? item.ScheduledDateTimeUtc)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Task.FromResult(new PagedData<InterviewEntity>
            {
                Items = items,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages,
            });
        }

        public Task<bool> HasRecruiterConflictAsync(Guid recruiterId, DateTime rangeStartUtc, DateTime rangeEndUtc, Guid? excludeInterviewId = null, CancellationToken ct = default)
            => Task.FromResult(_interviews.Any(item =>
                item.RecruiterId == recruiterId
                && item.Id != excludeInterviewId
                && !item.IsArchived
                && item.Status is InterviewStatus.Pending or InterviewStatus.Accepted or InterviewStatus.RescheduleRequested or InterviewStatus.Rescheduled
                && item.ScheduledDateTimeUtc < rangeEndUtc
                && item.ScheduledDateTimeUtc.AddHours(1) > rangeStartUtc));

        public Task<bool> HasJobSeekerConflictAsync(Guid jobSeekerId, DateTime rangeStartUtc, DateTime rangeEndUtc, Guid? excludeInterviewId = null, CancellationToken ct = default)
            => Task.FromResult(_interviews.Any(item =>
                item.JobSeekerId == jobSeekerId
                && item.Id != excludeInterviewId
                && !item.IsArchived
                && item.Status is InterviewStatus.Pending or InterviewStatus.Accepted or InterviewStatus.RescheduleRequested or InterviewStatus.Rescheduled
                && item.ScheduledDateTimeUtc < rangeEndUtc
                && item.ScheduledDateTimeUtc.AddHours(1) > rangeStartUtc));

        public Task AddRescheduleRequestAsync(InterviewRescheduleRequestEntity request, CancellationToken ct = default)
            => Task.CompletedTask;

        public Task SaveChangesAsync(CancellationToken ct = default)
            => Task.CompletedTask;
    }

    private sealed class StubRecruiterRepository(Guid companyId, Guid recruiterId, Guid shortlistedJobSeekerId, string recruiterEmail) : IRecruiterRepository
    {
        public ResumeSubmissionEntity Submission { get; } = new()
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            JobId = Guid.Empty,
            AppliedJobPosition = "Senior Backend Engineer",
            JobSeekerUserId = shortlistedJobSeekerId,
            Status = ResumeSubmissionStatus.Shortlisted,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow,
        };

        public Task<RecruiterProfileEntity?> GetProfileByUserIdAsync(Guid requestedRecruiterId, CancellationToken ct = default)
            => Task.FromResult(
                requestedRecruiterId == recruiterId
                    ? new RecruiterProfileEntity
                    {
                        Id = Guid.NewGuid(),
                        UserId = recruiterId,
                        CompanyId = companyId,
                        User = new AppUser
                        {
                            Id = recruiterId,
                            Email = recruiterEmail,
                            UserName = "Recruiter User",
                        },
                        Company = new CompanyEntity
                        {
                            Id = companyId,
                            Name = "Nexskill",
                        },
                    }
                    : null);

        public Task<IReadOnlyList<RecruiterProfileEntity>> GetProfilesByUserIdsAsync(IReadOnlyCollection<Guid> recruiterIds, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyList<RecruiterProfileEntity>>(
                recruiterIds.Contains(recruiterId)
                    ? [GetProfileByUserIdAsync(recruiterId, ct).Result!]
                    : []);

        public Task<RecruiterProfileEntity?> GetProfileByUserAndProfileIdAsync(Guid recruiterId, Guid recruiterProfileId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task SaveChangesAsync(CancellationToken ct = default)
            => Task.CompletedTask;

        public Task<Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction> BeginSerializableTransactionAsync(CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<List<ResumeSubmissionEntity>> GetDashboardApplicationsAsync(IReadOnlyCollection<Guid> jobIds, DateTime? startUtc, DateTime? endExclusiveUtc, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<List<DashboardOfferMetricData>> GetLatestDashboardOffersAsync(IReadOnlyCollection<Guid> applicationIds, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<List<Guid>> GetDashboardJobIdsAsync(Guid recruiterId, Guid companyId, string? department, string? jobRole, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<SkillSense.Persistence.Models.RecruiterDashboardFilterData> GetDashboardFilterDataAsync(Guid recruiterId, Guid companyId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<List<SkillSense.Persistence.Models.ApplicantScoreData>> GetApplicantScoreDataAsync(Guid recruiterId, Guid companyId, string? department, string? search, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<SkillSense.Persistence.Models.ApplicantScoreData?> GetApplicantScoreBySubmissionIdAsync(Guid recruiterId, Guid companyId, Guid submissionId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<PagedData<EmployeeRecordData>> GetHiredEmployeeDataAsync(Guid recruiterId, Guid companyId, int pageNumber, int pageSize, string? search, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<SkillSense.Persistence.Models.ApplicantStageContextData?> GetApplicantStageContextAsync(Guid recruiterId, Guid companyId, Guid submissionId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<IReadOnlyList<ShortlistedCandidateData>> GetShortlistedCandidatesByJobAsync(Guid jobId, CancellationToken ct = default)
        {
            Submission.JobId = jobId;
            return Task.FromResult<IReadOnlyList<ShortlistedCandidateData>>(
                [
                    new ShortlistedCandidateData
                    {
                        ResumeSubmissionId = Submission.Id,
                        JobId = jobId,
                        JobSeekerUserId = shortlistedJobSeekerId,
                        CandidateName = "Job Seeker",
                        CandidateEmail = "jobseeker@nexskill.test",
                    }
                ]);
        }

        public Task<ResumeSubmissionEntity?> GetSubmissionForInterviewAsync(Guid requestedRecruiterId, Guid requestedCompanyId, Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default)
        {
            Submission.JobId = jobId;
            return Task.FromResult<ResumeSubmissionEntity?>(
                requestedRecruiterId == recruiterId
                && requestedCompanyId == companyId
                && jobSeekerUserId == shortlistedJobSeekerId
                    ? Submission
                    : null);
        }

        public Task<ResumeSubmissionEntity?> GetSubmissionByIdForRecruiterAsync(Guid requestedRecruiterId, Guid requestedCompanyId, Guid submissionId, CancellationToken ct = default)
            => Task.FromResult<ResumeSubmissionEntity?>(
                requestedRecruiterId == recruiterId
                && requestedCompanyId == companyId
                && submissionId == Submission.Id
                    ? Submission
                    : null);

        public Task<JobOfferEntity?> GetLatestOfferByApplicationIdAsync(Guid applicationId, CancellationToken ct = default)
            => Task.FromResult<JobOfferEntity?>(null);

        public Task<InterviewEntity?> GetLatestInterviewForSubmissionAsync(Guid requestedRecruiterId, Guid requestedCompanyId, Guid jobId, Guid jobSeekerUserId, CancellationToken ct = default)
            => Task.FromResult<InterviewEntity?>(null);

        public Task AddOfferAsync(JobOfferEntity offer, CancellationToken ct = default)
            => Task.CompletedTask;

        public Task<Dictionary<Guid, int>> GetHiredCountsByJobIdsAsync(IReadOnlyCollection<Guid> jobIds, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<int> GetHiredCountByJobIdAsync(Guid jobId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<Dictionary<Guid, (string Title, string Department)>> GetJobLookupAsync(Guid recruiterId, Guid companyId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<List<SkillSense.Persistence.Models.JobFilterData>> GetJobFiltersAsync(Guid recruiterId, Guid companyId, string? department, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<string?> GetParsedResumeJsonAsync(Guid recruiterId, Guid companyId, Guid submissionId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<SkillSense.Persistence.Models.PagedData<JobEntity>> GetRecruiterJobsAsync(Guid recruiterId, Guid companyId, int pageNumber, int pageSize, string? search, string? department, string? sortBy, string? sortDir, CancellationToken ct = default)
            => throw new NotImplementedException();
    }

    private sealed class StubJobRepository(Guid companyId, Guid jobId) : IJobRepository
    {
        public Task AddAsync(JobEntity job, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task UpdateAsync(JobEntity job, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task DeleteAsync(JobEntity job, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<JobEntity?> GetByIdAsync(Guid requestedJobId, CancellationToken ct = default)
            => Task.FromResult(
                requestedJobId == jobId
                    ? new JobEntity
                    {
                        Id = jobId,
                        CompanyId = companyId,
                        RecruiterId = Guid.NewGuid(),
                        Title = "Senior Backend Engineer",
                    }
                    : null);

        public Task<JobEntity?> GetByIdForCompanyAsync(Guid id, Guid companyId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public Task<JobEntity?> GetByIdForRecruiterAsync(Guid id, Guid recruiterId, CancellationToken ct = default)
            => throw new NotImplementedException();

        public IQueryable<JobEntity> Query()
            => throw new NotImplementedException();
    }
}
