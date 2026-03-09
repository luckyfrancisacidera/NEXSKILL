using System.Text.Json;
using SkillSense.Application.Common.Scoring;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services.Scoring;

/// <summary>
/// Re-scores an existing parsed resume against a supplied normalized job description.
/// </summary>
public sealed class ResumeScoringService(
    IResumeSubmissionRepository resumeSubmissionRepository,
    IResumeScoreRepository resumeScoreRepository,
    IResumeScoringOrchestrator scoringOrchestrator) : IResumeScoringService
{
    /// <summary>
    /// Builds a fresh match score for an existing submission and persists the score snapshot.
    /// </summary>
    public async Task<FinalMatchScore> ScoreResumeAsync(ResumeScoreRequest request, CancellationToken ct = default)
    {
        var submission = await resumeSubmissionRepository.GetByIdAsync(request.SubmissionId, ct)
            ?? throw new InvalidOperationException("Submission not found.");

        var parsed = JsonSerializer.Deserialize<ParsedResume>(submission.ParsedResumeJson)
            ?? throw new InvalidOperationException("Parsed resume payload is not available.");

        var result = await scoringOrchestrator.BuildAsync(submission.Id, parsed, request.JobDescription, ct);
        await SaveScoreAsync(submission, request.JobDescription.Description, result.Score, ct);
        return result.Score;
    }

    private async Task SaveScoreAsync(ResumeSubmissionEntity submission, string jobDescriptionText, FinalMatchScore score, CancellationToken ct)
        => await resumeScoreRepository.AddAsync(ResumeScoreEntityFactory.Create(submission, jobDescriptionText, score), ct);
}
