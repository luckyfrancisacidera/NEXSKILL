using System.Text.Json;
using Microsoft.Extensions.Logging;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Recruiter;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services.Recruiter;

/// <summary>
/// Generates recruiter-facing candidate explanations for shortlisted submissions.
/// </summary>
/// <remarks>
/// The service combines deterministic ATS scoring facts with the configured explanation provider output,
/// then persists a normalized explanation record for later retrieval by recruiter workflows.
/// </remarks>
public sealed class CandidateExplanationService(
    ICandidateExplanationRepository candidateExplanationRepository,
    IGenerativeExplanationProvider explanationProvider,
    ILogger<CandidateExplanationService> logger) : ICandidateExplanationService
{
    private const float MatchThreshold = 0.64f;

    /// <summary>
    /// Creates or refreshes the persisted explanation for a shortlisted submission when recruiter access is valid.
    /// </summary>
    public async Task GenerateForShortlistedAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default)
    {
        var existing = await candidateExplanationRepository.GetBySubmissionIdAsync(submissionId, ct);

        if (existing is not null && existing.Status is ExplanationStatus.Pending or ExplanationStatus.Succeeded)
        {
            return;
        }

        var payload = await candidateExplanationRepository.GetExplanationPayloadAsync(recruiterId, submissionId, ct);
        if (payload is null || payload.Submission.Status != ResumeSubmissionStatus.Shortlisted)
        {
            return;
        }

        var facts = BuildFacts(payload.Submission, payload.Job, payload.Score);

        var explanationEntity = existing ?? new CandidateExplanationEntity
        {
            Id = Guid.NewGuid(),
            ResumeSubmissionId = payload.Submission.Id,
            JobId = payload.Job.Id,
            ApplicantUserId = payload.Submission.JobSeekerUserId,
            CreatedAtUtc = DateTime.UtcNow,
        };

        explanationEntity.Provider = explanationProvider.ProviderName;
        explanationEntity.Model = explanationProvider.ModelName;
        explanationEntity.StructuredDataJson = JsonSerializer.Serialize(facts);
        explanationEntity.Status = ExplanationStatus.Pending;
        explanationEntity.ExplanationText = string.Empty;
        explanationEntity.Summary = null;
        explanationEntity.StrengthsJson = "[]";
        explanationEntity.GapsJson = "[]";
        explanationEntity.RawProviderResponse = null;
        explanationEntity.GeneratedAtUtc = null;
        explanationEntity.FailureReason = null;
        explanationEntity.UpdatedAtUtc = DateTime.UtcNow;

        if (existing is null)
        {
            await candidateExplanationRepository.AddAsync(explanationEntity, ct);
        }
        else
        {
            await candidateExplanationRepository.SaveChangesAsync(ct);
        }

        try
        {
            var result = await explanationProvider.GenerateRecruiterExplanationAsync(facts, ct);
            var normalized = NormalizeStructuredExplanation(result.Explanation, facts);

            if (normalized.Strengths.Count < 2)
            {
                throw new InvalidOperationException("Explanation did not contain enough strengths.");
            }

            explanationEntity.Summary = normalized.Summary;
            explanationEntity.StrengthsJson = JsonSerializer.Serialize(normalized.Strengths);
            explanationEntity.GapsJson = JsonSerializer.Serialize(normalized.Gaps);
            explanationEntity.ExplanationText = ComposeFallbackText(normalized);
            explanationEntity.RawProviderResponse = result.RawProviderResponse;
            explanationEntity.Status = ExplanationStatus.Succeeded;
            explanationEntity.GeneratedAtUtc = DateTime.UtcNow;
            explanationEntity.FailureReason = null;
            explanationEntity.UpdatedAtUtc = DateTime.UtcNow;

            await candidateExplanationRepository.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed generating candidate explanation for submission {SubmissionId}", submissionId);

            explanationEntity.Status = ExplanationStatus.Failed;
            explanationEntity.FailureReason = ex.Message.Length > 400 ? ex.Message[..400] : ex.Message;
            explanationEntity.UpdatedAtUtc = DateTime.UtcNow;

            await candidateExplanationRepository.SaveChangesAsync(ct);
        }
    }

    private static CandidateExplanationFacts BuildFacts(
        ResumeSubmissionEntity submission,
        JobEntity job,
        ResumeScoreEntity score)
    {
        var parsedResume = ParseResume(submission.ParsedResumeJson);
        var finalScore = ParseFinalScore(score.ScoreBreakdownJson);

        var requiredMatches = finalScore?.Matches.RequiredSkills ?? [];
        var preferredMatches = finalScore?.Matches.PreferredSkills ?? [];
        var responsibilityMatches = finalScore?.Matches.Responsibilities ?? [];
        var descriptionMatches = finalScore?.Matches.DescriptionTopMatches ?? [];

        var responsibilitiesSectionScore = finalScore?.SectionScores.GetValueOrDefault("responsibilities");
        var descriptionSectionScore = finalScore?.SectionScores.GetValueOrDefault("description");

        var matchedRequired = requiredMatches
            .Where(x => x.Similarity >= MatchThreshold && !string.IsNullOrWhiteSpace(x.BestResumeEvidence))
            .Select(x => x.JdItem)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var missingRequired = requiredMatches
            .Where(x => x.Similarity < MatchThreshold || string.IsNullOrWhiteSpace(x.BestResumeEvidence))
            .Select(x => x.JdItem)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var matchedPreferred = preferredMatches
            .Where(x => x.Similarity >= MatchThreshold && !string.IsNullOrWhiteSpace(x.BestResumeEvidence))
            .Select(x => x.JdItem)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var matchedResponsibilities = responsibilityMatches
            .Where(x => x.Similarity >= MatchThreshold && !string.IsNullOrWhiteSpace(x.BestResumeEvidence))
            .Select(x => x.JdItem)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var missingResponsibilities = responsibilityMatches
            .Where(x => x.Similarity < MatchThreshold || string.IsNullOrWhiteSpace(x.BestResumeEvidence))
            .Select(x => x.JdItem)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var topDescriptionAlignmentEvidence = descriptionMatches
            .Where(x => !string.IsNullOrWhiteSpace(x.BestResumeEvidence))
            .OrderByDescending(x => x.Similarity)
            .Select(x => new CandidateExplanationEvidenceItem
            {
                JdItem = x.JdItem,
                BestResumeEvidence = x.BestResumeEvidence!
            })
            .GroupBy(x => new
            {
                JdItem = x.JdItem.ToLowerInvariant(),
                Evidence = x.BestResumeEvidence.ToLowerInvariant(),
            })
            .Select(group => group.First())
            .Take(3)
            .ToList();

        var descriptionTopMatches = descriptionMatches
            .OrderByDescending(x => x.Similarity)
            .Select(x => x.JdItem)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(3)
            .ToList();

        var roleRelevantExperienceEvidence = responsibilityMatches
            .Concat(requiredMatches)
            .Where(x => !string.IsNullOrWhiteSpace(x.Source))
            .Where(x => x.Source.StartsWith("work_experience", StringComparison.OrdinalIgnoreCase))
            .Where(x => x.Similarity >= MatchThreshold && !string.IsNullOrWhiteSpace(x.BestResumeEvidence))
            .OrderByDescending(x => x.Similarity)
            .Select(x => new CandidateExplanationEvidenceItem
            {
                JdItem = x.JdItem,
                BestResumeEvidence = x.BestResumeEvidence!
            })
            .GroupBy(x => new
            {
                JdItem = x.JdItem.ToLowerInvariant(),
                Evidence = x.BestResumeEvidence.ToLowerInvariant(),
            })
            .Select(group => group.First())
            .Take(4)
            .ToList();

        var notableEvidence = requiredMatches
            .Concat(preferredMatches)
            .Concat(responsibilityMatches)
            .Where(x => !string.IsNullOrWhiteSpace(x.BestResumeEvidence))
            .OrderByDescending(x => x.Similarity)
            .Select(x => new CandidateExplanationEvidenceItem
            {
                JdItem = x.JdItem,
                BestResumeEvidence = x.BestResumeEvidence!
            })
            .GroupBy(x => new
            {
                JdItem = x.JdItem.ToLowerInvariant(),
                Evidence = x.BestResumeEvidence.ToLowerInvariant(),
            })
            .Select(group => group.First())
            .Take(5)
            .ToList();

        return new CandidateExplanationFacts
        {
            Job = new CandidateExplanationJobFacts
            {
                Title = job.Title,
                RequiredSkills = DeserializeStringList(job.RequiredSkillsJson),
                PreferredSkills = DeserializeStringList(job.PreferredSkillsJson),
                MinimumYears = job.MinYears,
                Education = job.Education,
                Location = job.Location,
                WorkSetup = job.WorkSetup.ToString(),
                EmploymentType = job.EmploymentType.ToString(),
            },
            Candidate = new CandidateExplanationCandidateFacts
            {
                Name = submission.FullName ?? "Unknown Applicant",
                Email = submission.Email ?? string.Empty,
                Location = submission.Location,
                TotalExperienceMonths = parsedResume?.Derived?.TotalExperienceMonths,
                EducationMaxLevel = parsedResume?.Derived?.EducationMaxLevel,
                NormalizedSkills = parsedResume?.Derived?.NormalizedSkills ?? [],
            },
            Compatibility = BuildCompatibilityFacts(submission, job),
            Scoring = new CandidateExplanationScoringFacts
            {
                FinalWeightedScore = score.FinalWeightedScore,
                SkillsScore = score.SkillsScore,
                ExperienceScore = score.ExperienceScore,
                EducationScore = score.EducationScore,
                SummaryScore = score.SummaryScore,
                ResponsibilitiesSectionScore = responsibilitiesSectionScore,
                DescriptionSectionScore = descriptionSectionScore,
                MinimumYearsMet = finalScore?.HardRequirements.MinimumYearsExperienceMet,
                MinimumEducationMet = finalScore?.HardRequirements.MinimumEducationMet,
            },
            MatchSummary = new CandidateExplanationMatchSummaryFacts
            {
                MatchedRequiredSkills = matchedRequired,
                MissingRequiredSkills = missingRequired,
                MatchedPreferredSkills = matchedPreferred,
                MatchedResponsibilities = matchedResponsibilities,
                MissingResponsibilities = missingResponsibilities,
                TopDescriptionAlignmentEvidence = topDescriptionAlignmentEvidence,
                DescriptionTopMatches = descriptionTopMatches,
                RoleRelevantExperienceEvidence = roleRelevantExperienceEvidence,
                NotableEvidence = notableEvidence,
            }
        };
    }

    private static CandidateStructuredExplanation NormalizeStructuredExplanation(
        CandidateStructuredExplanation explanation,
        CandidateExplanationFacts facts)
    {
        var strengths = explanation.Strengths
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(4)
            .ToList();

        if (strengths.Count < 2)
        {
            strengths.AddRange(
                BuildFallbackStrengths(facts)
                    .Where(x => strengths.All(existing => !existing.Equals(x, StringComparison.OrdinalIgnoreCase))));
        }

        var gaps = explanation.Gaps
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(2)
            .ToList();

        if (gaps.Count == 0)
        {
            gaps.AddRange(BuildFallbackGaps(facts));
            gaps = gaps.Distinct(StringComparer.OrdinalIgnoreCase).Take(2).ToList();
        }

        return new CandidateStructuredExplanation
        {
            Summary = string.IsNullOrWhiteSpace(explanation.Summary) ? null : explanation.Summary.Trim(),
            Strengths = strengths.Take(4).ToList(),
            Gaps = gaps,
        };
    }

    private static List<string> BuildFallbackStrengths(CandidateExplanationFacts facts)
    {
        var strengths = new List<string>();

        if (facts.MatchSummary.MatchedRequiredSkills.Count > 0)
        {
            strengths.Add($"Strong overlap with required skills: {string.Join(", ", facts.MatchSummary.MatchedRequiredSkills.Take(3))}");
        }

        if (facts.MatchSummary.MatchedResponsibilities.Count > 0)
        {
            strengths.Add($"Responsibility alignment includes {string.Join(", ", facts.MatchSummary.MatchedResponsibilities.Take(2))}");
        }

        if (facts.MatchSummary.TopDescriptionAlignmentEvidence.Count > 0)
        {
            var descriptionEvidence = facts.MatchSummary.TopDescriptionAlignmentEvidence.First();
            strengths.Add($"Description alignment evidence: {descriptionEvidence.JdItem} - {descriptionEvidence.BestResumeEvidence}");
        }

        if (facts.MatchSummary.RoleRelevantExperienceEvidence.Count > 0)
        {
            var roleEvidence = facts.MatchSummary.RoleRelevantExperienceEvidence.First();
            strengths.Add($"Role-relevant experience evidence: {roleEvidence.JdItem} - {roleEvidence.BestResumeEvidence}");
        }

        if (facts.MatchSummary.MatchedPreferredSkills.Count > 0)
        {
            strengths.Add($"Supporting preferred-skill alignment: {string.Join(", ", facts.MatchSummary.MatchedPreferredSkills.Take(2))}");
        }

        if (facts.Scoring.MinimumYearsMet == true)
        {
            strengths.Add("Minimum experience requirement appears satisfied");
        }

        return strengths
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(4)
            .ToList();
    }

    private static List<string> BuildFallbackGaps(CandidateExplanationFacts facts)
    {
        var gaps = new List<string>();

        if (facts.MatchSummary.MissingRequiredSkills.Count > 0)
        {
            gaps.Add($"Some required skills remain to be validated: {string.Join(", ", facts.MatchSummary.MissingRequiredSkills.Take(2))}");
        }

        if (facts.MatchSummary.MissingResponsibilities.Count > 0)
        {
            gaps.Add($"Some core responsibilities need deeper verification: {string.Join("; ", facts.MatchSummary.MissingResponsibilities.Take(1))}");
        }

        if (facts.Scoring.MinimumYearsMet == false)
        {
            gaps.Add("Minimum years-of-experience requirement appears unmet");
        }

        if (facts.Scoring.MinimumEducationMet == false)
        {
            gaps.Add("Minimum education requirement appears unmet");
        }

        return gaps
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(2)
            .ToList();
    }

    private static string ComposeFallbackText(CandidateStructuredExplanation explanation)
    {
        var parts = new List<string>();

        if (!string.IsNullOrWhiteSpace(explanation.Summary))
        {
            parts.Add(explanation.Summary.Trim());
        }

        parts.AddRange(explanation.Strengths);

        if (explanation.Gaps.Count > 0)
        {
            parts.Add($"Possible gaps: {string.Join("; ", explanation.Gaps)}");
        }

        return string.Join(" ", parts);
    }

    private static CandidateExplanationCompatibilityFacts BuildCompatibilityFacts(
        ResumeSubmissionEntity submission,
        JobEntity job)
    {
        var locationCompatibility = EvaluateLocationCompatibility(submission.Location, job.Location);

        return new CandidateExplanationCompatibilityFacts
        {
            LocationCompatibility = locationCompatibility,
            WorkSetupCompatibility = "unknown",
            EmploymentType = job.EmploymentType.ToString(),
            EmploymentTypeCompatibility = "unknown",
            Notes =
            [
                "Candidate work setup preference is not currently captured in structured profile data.",
                "Candidate employment type preference is not currently captured in structured profile data."
            ]
        };
    }

    private static string EvaluateLocationCompatibility(string? candidateLocation, string jobLocation)
    {
        if (string.IsNullOrWhiteSpace(jobLocation) || string.IsNullOrWhiteSpace(candidateLocation))
        {
            return "unknown";
        }

        var candidate = candidateLocation.Trim().ToLowerInvariant();
        var job = jobLocation.Trim().ToLowerInvariant();

        if (candidate == job || candidate.Contains(job) || job.Contains(candidate))
        {
            return "compatible";
        }

        return "potential_mismatch";
    }

    private static List<string> DeserializeStringList(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return [];
        }

        return JsonSerializer.Deserialize<List<string>>(json) ?? [];
    }

    private static FinalMatchScore? ParseFinalScore(string? scoreBreakdownJson)
    {
        if (string.IsNullOrWhiteSpace(scoreBreakdownJson))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<FinalMatchScore>(scoreBreakdownJson);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static ParsedResumeRoot? ParseResume(string? parsedResumeJson)
    {
        if (string.IsNullOrWhiteSpace(parsedResumeJson))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<ParsedResumeRoot>(parsedResumeJson);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private sealed class ParsedResumeRoot
    {
        public ParsedResumeDerived? Derived { get; set; }
    }

    private sealed class ParsedResumeDerived
    {
        public int? TotalExperienceMonths { get; set; }
        public string? EducationMaxLevel { get; set; }
        public List<string> NormalizedSkills { get; set; } = [];
    }
}
