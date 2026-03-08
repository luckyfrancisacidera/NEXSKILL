using SkillSense.Application.Contracts.Recruiter.Response;

namespace SkillSense.Application.Interfaces;

public interface IGenerativeExplanationProvider
{
    string ProviderName { get; }
    string ModelName { get; }
    Task<CandidateExplanationGenerationResult> GenerateRecruiterExplanationAsync(CandidateExplanationFacts facts, CancellationToken ct = default);
}
