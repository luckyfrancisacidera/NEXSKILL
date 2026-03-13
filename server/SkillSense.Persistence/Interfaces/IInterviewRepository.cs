using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Interfaces;

public interface IInterviewRepository
{
    Task AddAsync(InterviewEntity interview, CancellationToken ct = default);
    Task<InterviewEntity?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<InterviewEntity?> GetByIdForRecruiterAsync(Guid id, Guid recruiterId, Guid companyId, CancellationToken ct = default);
    Task<InterviewEntity?> GetByIdForJobSeekerAsync(Guid id, Guid jobSeekerId, CancellationToken ct = default);
    Task<InterviewEntity?> GetActiveByIdAsync(Guid id, CancellationToken ct = default);
    Task<InterviewEntity?> GetActiveByIdForRecruiterAsync(Guid id, Guid recruiterId, Guid companyId, CancellationToken ct = default);
    Task<InterviewEntity?> GetActiveByIdForJobSeekerAsync(Guid id, Guid jobSeekerId, CancellationToken ct = default);
    Task<IReadOnlyList<InterviewEntity>> GetInterviewsForCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<IReadOnlyList<InterviewEntity>> GetByRecruiterAsync(Guid recruiterId, CancellationToken ct = default);
    Task<IReadOnlyList<InterviewEntity>> GetByJobSeekerAsync(Guid jobSeekerId, CancellationToken ct = default);
    Task AddRescheduleRequestAsync(InterviewRescheduleRequestEntity request, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
