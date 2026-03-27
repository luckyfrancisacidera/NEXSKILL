using SkillSense.Application.Contracts.Interviews;
using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces;

public interface IInterviewService
{
    Task<InterviewDto> ScheduleInterviewAsync(ScheduleInterviewRequest request, CancellationToken ct = default);
    Task<InterviewDto> ScheduleInterviewAsync(Guid? companyId, ScheduleInterviewRequest request, CancellationToken ct = default);
    Task<InterviewDto> GetRecruiterInterviewAsync(Guid? companyId, Guid recruiterId, Guid interviewId, CancellationToken ct = default);
    Task<InterviewDto> RescheduleInterviewAsync(Guid interviewId, RescheduleInterviewRequest request, CancellationToken ct = default);
    Task<InterviewDto> RescheduleInterviewAsync(Guid? companyId, Guid recruiterId, Guid interviewId, RescheduleInterviewRequest request, CancellationToken ct = default);
    Task<InterviewDto> AcceptInterviewAsync(Guid interviewId, CancellationToken ct = default);
    Task<InterviewDto> AcceptInterviewAsync(Guid interviewId, Guid jobSeekerId, CancellationToken ct = default);
    Task<InterviewDto> DeclineInterviewAsync(Guid interviewId, CancellationToken ct = default);
    Task<InterviewDto> DeclineInterviewAsync(Guid interviewId, Guid jobSeekerId, CancellationToken ct = default);
    Task<InterviewDto> RequestRescheduleAsync(Guid interviewId, Guid jobSeekerId, RequestInterviewRescheduleRequest request, CancellationToken ct = default);
    Task<InterviewDto> CancelInterviewAsync(Guid? companyId, Guid recruiterId, Guid interviewId, CancelInterviewRequest request, CancellationToken ct = default);
    Task<InterviewDto> MarkInterviewCompletedAsync(Guid? companyId, Guid recruiterId, Guid interviewId, CancellationToken ct = default);
    Task<InterviewDto> ArchiveInterviewAsync(Guid? companyId, Guid recruiterId, Guid interviewId, CancellationToken ct = default);
    Task<InterviewDto> ArchiveInterviewAsync(Guid interviewId, Guid jobSeekerId, CancellationToken ct = default);
    Task<InterviewDto> UnarchiveInterviewAsync(Guid interviewId, Guid jobSeekerId, CancellationToken ct = default);
    Task<IReadOnlyList<InterviewDto>> GetByRecruiterAsync(Guid recruiterId, CancellationToken ct = default);
    Task<IReadOnlyList<InterviewDto>> GetByRecruiterAsync(Guid? companyId, Guid recruiterId, CancellationToken ct = default);
    Task<IReadOnlyList<InterviewDto>> GetByJobSeekerAsync(Guid jobSeekerId, CancellationToken ct = default);
    Task<IReadOnlyList<InterviewDto>> GetArchivedByJobSeekerAsync(Guid jobSeekerId, CancellationToken ct = default);
    Task<PagedResult<InterviewDto>> GetArchivedByJobSeekerAsync(Guid jobSeekerId, ArchivedInterviewsQuery query, CancellationToken ct = default);
}
