using System.Text.Json;
using Microsoft.Extensions.Logging;
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
    IResumeScoringOrchestrator scoringOrchestrator,
    ILogger<ResumeScoringService> logger) : IResumeScoringService
{
    /// <summary>
    /// Builds a fresh match score for an existing submission and persists the score snapshot.
    /// </summary>
    public async Task<FinalMatchScore> ScoreResumeAsync(ResumeScoreRequest request, CancellationToken ct = default)
    {
        var totalTimer = global::System.Diagnostics.Stopwatch.StartNew();
        var submission = await resumeSubmissionRepository.GetByIdAsync(request.SubmissionId, ct)
            ?? throw new InvalidOperationException("Submission not found.");

        var parsed = JsonSerializer.Deserialize<ParsedResume>(submission.ParsedResumeJson)
            ?? throw new InvalidOperationException("Parsed resume payload is not available.");

        var buildTimer = global::System.Diagnostics.Stopwatch.StartNew();
        var result = await scoringOrchestrator.BuildAsync(submission.Id, parsed, request.JobDescription, ct);
        buildTimer.Stop();

        var persistTimer = global::System.Diagnostics.Stopwatch.StartNew();
        await SaveScoreAsync(submission, request.JobDescription.Description, result.Score, ct);
        persistTimer.Stop();
        totalTimer.Stop();

        logger.LogInformation(
            "Resume re-score completed for submission {SubmissionId} in {TotalMs} ms (build={BuildMs} ms, persist={PersistMs} ms).",
            submission.Id,
            totalTimer.ElapsedMilliseconds,
            buildTimer.ElapsedMilliseconds,
            persistTimer.ElapsedMilliseconds);

        return result.Score;
    }

    private async Task SaveScoreAsync(ResumeSubmissionEntity submission, string jobDescriptionText, FinalMatchScore score, CancellationToken ct)
        => await resumeScoreRepository.AddAsync(ResumeScoreEntityFactory.Create(submission, jobDescriptionText, score), saveChanges: true, ct);
}
