using SkillSense.Application.Contracts.Interviews;
using SkillSense.Application.Interfaces;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services.Interviews;

public sealed class InterviewService(
    IInterviewRepository interviewRepository,
    IRecruiterRepository recruiterRepository,
    IJobRepository jobRepository,
    IDateTimeProvider dateTimeProvider) : IInterviewService
{
    public async Task<InterviewDto> ScheduleInterviewAsync(ScheduleInterviewRequest request, CancellationToken ct = default)
        => await ScheduleInterviewAsync(null, request, ct);

    public async Task<InterviewDto> ScheduleInterviewAsync(Guid? companyId, ScheduleInterviewRequest request, CancellationToken ct = default)
    {
        var now = dateTimeProvider.UtcNow;
        var scopedCompanyId = await ResolveCompanyIdAsync(companyId, request.RecruiterId, request.JobId, ct);

        var entity = new InterviewEntity
        {
            Id = Guid.NewGuid(),
            CompanyId = scopedCompanyId,
            JobId = request.JobId,
            RecruiterId = request.RecruiterId,
            JobSeekerId = request.JobSeekerId,
            ScheduledDateTimeUtc = request.ScheduledDateTimeUtc,
            LocationOrMeetingLink = request.LocationOrMeetingLink.Trim(),
            Message = string.IsNullOrWhiteSpace(request.Message) ? null : request.Message.Trim(),
            Status = InterviewStatus.Pending,
            CreatedAtUtc = now,
        };

        await interviewRepository.AddAsync(entity, ct);
        await interviewRepository.SaveChangesAsync(ct);

        return await GetRecruiterInterviewAsync(scopedCompanyId, request.RecruiterId, entity.Id, ct);
    }

    public async Task<InterviewDto> GetRecruiterInterviewAsync(Guid? companyId, Guid recruiterId, Guid interviewId, CancellationToken ct = default)
    {
        var entity = await GetInterviewForRecruiterAsync(interviewId, companyId, recruiterId, ct);
        return await MapAsync(entity, ct);
    }

    public async Task<InterviewDto> RescheduleInterviewAsync(Guid interviewId, RescheduleInterviewRequest request, CancellationToken ct = default)
    {
        var entity = await interviewRepository.GetByIdAsync(interviewId, ct)
            ?? throw new KeyNotFoundException("Interview not found.");

        entity.ScheduledDateTimeUtc = request.ScheduledDateTimeUtc;
        entity.Message = string.IsNullOrWhiteSpace(request.Message) ? entity.Message : request.Message.Trim();
        entity.Status = InterviewStatus.Rescheduled;

        await interviewRepository.SaveChangesAsync(ct);
        return await MapAsync(entity, ct);
    }

    public async Task<InterviewDto> RescheduleInterviewAsync(Guid? companyId, Guid recruiterId, Guid interviewId, RescheduleInterviewRequest request, CancellationToken ct = default)
    {
        var entity = await GetInterviewForRecruiterAsync(interviewId, companyId, recruiterId, ct);

        entity.ScheduledDateTimeUtc = request.ScheduledDateTimeUtc;
        entity.Message = string.IsNullOrWhiteSpace(request.Message) ? entity.Message : request.Message.Trim();
        entity.Status = InterviewStatus.Rescheduled;

        await interviewRepository.SaveChangesAsync(ct);
        return await MapAsync(entity, ct);
    }

    public async Task<InterviewDto> AcceptInterviewAsync(Guid interviewId, CancellationToken ct = default)
    {
        var entity = await interviewRepository.GetByIdAsync(interviewId, ct)
            ?? throw new KeyNotFoundException("Interview not found.");

        entity.Status = InterviewStatus.Accepted;
        await interviewRepository.SaveChangesAsync(ct);
        return await MapAsync(entity, ct);
    }

    public async Task<InterviewDto> AcceptInterviewAsync(Guid interviewId, Guid jobSeekerId, CancellationToken ct = default)
    {
        var entity = await GetInterviewForJobSeekerAsync(interviewId, jobSeekerId, ct);
        entity.Status = InterviewStatus.Accepted;
        await interviewRepository.SaveChangesAsync(ct);
        return await MapAsync(entity, ct);
    }

    public async Task<InterviewDto> DeclineInterviewAsync(Guid interviewId, CancellationToken ct = default)
    {
        var entity = await interviewRepository.GetByIdAsync(interviewId, ct)
            ?? throw new KeyNotFoundException("Interview not found.");

        entity.Status = InterviewStatus.Declined;
        await interviewRepository.SaveChangesAsync(ct);
        return await MapAsync(entity, ct);
    }

    public async Task<InterviewDto> DeclineInterviewAsync(Guid interviewId, Guid jobSeekerId, CancellationToken ct = default)
    {
        var entity = await GetInterviewForJobSeekerAsync(interviewId, jobSeekerId, ct);
        entity.Status = InterviewStatus.Declined;
        await interviewRepository.SaveChangesAsync(ct);
        return await MapAsync(entity, ct);
    }

    public async Task<InterviewDto> RequestRescheduleAsync(Guid interviewId, Guid jobSeekerId, RequestInterviewRescheduleRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            throw new ArgumentException("message is required");
        }

        var entity = await GetInterviewForJobSeekerAsync(interviewId, jobSeekerId, ct);

        var rescheduleRequest = new InterviewRescheduleRequestEntity
        {
            Id = Guid.NewGuid(),
            InterviewId = entity.Id,
            JobSeekerId = jobSeekerId,
            Message = request.Message.Trim(),
            AttachmentUrl = string.IsNullOrWhiteSpace(request.AttachmentFileName) ? null : request.AttachmentFileName.Trim(),
            CreatedAtUtc = dateTimeProvider.UtcNow,
        };

        entity.Status = InterviewStatus.RescheduleRequested;
        await interviewRepository.AddRescheduleRequestAsync(rescheduleRequest, ct);
        await interviewRepository.SaveChangesAsync(ct);

        return await MapAsync(entity, ct);
    }

    public async Task<IReadOnlyList<InterviewDto>> GetByRecruiterAsync(Guid recruiterId, CancellationToken ct = default)
        => await GetByRecruiterAsync(null, recruiterId, ct);

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

    public async Task<IReadOnlyList<InterviewDto>> GetByJobSeekerAsync(Guid jobSeekerId, CancellationToken ct = default)
    {
        var items = await interviewRepository.GetByJobSeekerAsync(jobSeekerId, ct);
        return await MapAsync(items, ct);
    }

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
                LocationOrMeetingLink = entity.LocationOrMeetingLink,
                Message = entity.Message,
                Status = entity.Status,
                CreatedAtUtc = entity.CreatedAtUtc,
                RecruiterName = recruiterContext?.RecruiterName,
                RecruiterEmail = recruiterContext?.RecruiterEmail,
                CompanyName = recruiterContext?.CompanyName,
                JobTitle = entity.Job?.Title,
                JobSeekerName = string.IsNullOrWhiteSpace(jobSeekerName) ? "Candidate" : jobSeekerName,
            };
        }).ToList();
    }

    private async Task<InterviewDto> MapAsync(InterviewEntity entity, CancellationToken ct)
        => (await MapAsync(new[] { entity }, ct)).Single();

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

    private sealed record RecruiterContext(string RecruiterName, string? RecruiterEmail, string? CompanyName);
}
