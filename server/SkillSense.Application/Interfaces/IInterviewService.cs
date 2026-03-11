using SkillSense.Application.Contracts.Interviews;

namespace SkillSense.Application.Interfaces;

public interface IInterviewService
{
    Task<InterviewDto> ScheduleInterviewAsync(ScheduleInterviewRequest request, CancellationToken ct = default);
    Task<InterviewDto> ScheduleInterviewAsync(Guid? companyId, ScheduleInterviewRequest request, CancellationToken ct = default);
    Task<InterviewDto> RescheduleInterviewAsync(Guid interviewId, RescheduleInterviewRequest request, CancellationToken ct = default);
    Task<InterviewDto> AcceptInterviewAsync(Guid interviewId, CancellationToken ct = default);
    Task<InterviewDto> AcceptInterviewAsync(Guid interviewId, Guid jobSeekerId, CancellationToken ct = default);
    Task<InterviewDto> DeclineInterviewAsync(Guid interviewId, CancellationToken ct = default);
    Task<InterviewDto> DeclineInterviewAsync(Guid interviewId, Guid jobSeekerId, CancellationToken ct = default);
    Task<InterviewDto> RequestRescheduleAsync(Guid interviewId, Guid jobSeekerId, RequestInterviewRescheduleRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<InterviewDto>> GetByRecruiterAsync(Guid recruiterId, CancellationToken ct = default);
    Task<IReadOnlyList<InterviewDto>> GetByRecruiterAsync(Guid? companyId, Guid recruiterId, CancellationToken ct = default);
    Task<IReadOnlyList<InterviewDto>> GetByJobSeekerAsync(Guid jobSeekerId, CancellationToken ct = default);
}
