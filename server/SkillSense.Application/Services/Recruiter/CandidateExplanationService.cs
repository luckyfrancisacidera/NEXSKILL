using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Contracts.Scoring.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Recruiter;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services.Recruiter;

public sealed partial class CandidateExplanationService(
    ICandidateExplanationRepository candidateExplanationRepository,
    IGenerativeExplanationProvider explanationProvider,
    ILogger<CandidateExplanationService> logger) : ICandidateExplanationService
{
    private const float StrongSemanticThreshold = 0.78f;
    private const float PartialEvidenceThreshold = 0.58f;
    private const float LimitedEvidenceThreshold = 0.42f;

    private static readonly string[] LeadInWords =
    [
        "build",
        "built",
        "design",
        "develop",
        "developed",
        "maintain",
        "maintained",
        "ensure",
        "ensured",
        "support",
        "supported",
        "collaborate",
        "collaborated",
        "work",
        "worked",
        "drive",
        "drove",
        "own",
        "owned",
        "deliver",
        "delivered",
        "using",
        "with",
        "across",
        "for",
        "to",
    ];

    // Handles generate for shortlisted.
    public async Task GenerateForShortlistedAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default)
    {
        var existing = await candidateExplanationRepository.GetBySubmissionIdAsync(submissionId, ct);

        if (existing?.Status is ExplanationStatus.Pending or ExplanationStatus.Succeeded)
        {
            return;
        }

        var payload = await candidateExplanationRepository.GetExplanationPayloadAsync(recruiterId, submissionId, ct);
        if (payload is null || payload.Submission.Status != ResumeSubmissionStatus.Shortlisted)
        {
            return;
        }

        var context = BuildEvaluationContext(payload.Submission, payload.Job, payload.Score);

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
        explanationEntity.StructuredDataJson = JsonSerializer.Serialize(context);
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
            var result = await explanationProvider.GenerateRecruiterExplanationAsync(context, ct);
            var normalized = NormalizeStructuredExplanation(context);

            explanationEntity.Summary = normalized.OverallFit;
            explanationEntity.StrengthsJson = JsonSerializer.Serialize(normalized.Strengths);
            explanationEntity.GapsJson = JsonSerializer.Serialize(normalized.PotentialRisks);
            explanationEntity.ExplanationText = ComposeFallbackText(normalized);
            explanationEntity.StructuredDataJson = JsonSerializer.Serialize(new
            {
                context,
                explanation = normalized,
            });
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

    // Builds evaluation context.
    private static CandidateEvaluationContext BuildEvaluationContext(
        ResumeSubmissionEntity submission,
        JobEntity job,
        ResumeScoreEntity score)
    {
        var parsedResume = ParseResume(submission.ParsedResumeJson);
        var finalScore = ParseFinalScore(score.ScoreBreakdownJson);

        var requiredDetails = BuildMatchDetails(finalScore?.Matches.RequiredSkills ?? []);
        var preferredDetails = BuildMatchDetails(finalScore?.Matches.PreferredSkills ?? []);
        var responsibilityDetails = BuildMatchDetails(finalScore?.Matches.Responsibilities ?? []);
        var descriptionDetails = BuildMatchDetails(finalScore?.Matches.DescriptionTopMatches ?? []);

        var candidateSkills = NormalizeSkillList(parsedResume?.Derived?.NormalizedSkills ?? []);
        var requiredSkills = BuildSkillSignals(DeserializeStringList(job.RequiredSkillsJson), requiredDetails);
        var preferredSkills = BuildSkillSignals(DeserializeStringList(job.PreferredSkillsJson), preferredDetails);
        var highlights = BuildHighlights(requiredDetails, responsibilityDetails, descriptionDetails);
        var experienceAssessment = BuildExperienceAssessment(finalScore?.HardRequirements.MinimumYearsExperienceMet, parsedResume?.Derived?.TotalExperienceMonths, job.MinYears);
        var educationAssessment = BuildEducationAssessment(finalScore?.HardRequirements.MinimumEducationMet);

        return new CandidateEvaluationContext
        {
            Job = new CandidateEvaluationJobContext
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
            Candidate = new CandidateEvaluationCandidateContext
            {
                Name = submission.FullName ?? "Unknown Applicant",
                Location = submission.Location,
                TotalExperienceMonths = parsedResume?.Derived?.TotalExperienceMonths,
                EducationMaxLevel = parsedResume?.Derived?.EducationMaxLevel,
                NormalizedSkills = candidateSkills,
            },
            Compatibility = BuildCompatibilityContext(submission, job),
            Evaluation = new CandidateEvaluationSignals
            {
                RequiredSkills = requiredSkills,
                PreferredSkills = preferredSkills,
                Strengths = BuildStrengthSignals(requiredSkills, preferredSkills, highlights, experienceAssessment),
                WeakSignals = BuildWeakSignals(requiredSkills, responsibilityDetails, descriptionDetails),
                MissingSkills =
                [
                    .. requiredSkills
                        .Where(signal => signal.Level == CandidateEvaluationSignalLevels.Missing)
                        .Select(signal => signal.Name)
                        .Take(3)
                ],
                Highlights = highlights,
                ExperienceAssessment = experienceAssessment,
                EducationAssessment = educationAssessment,
            }
        };
    }

    // Normalizes structured explanation.
    private static CandidateStructuredExplanation NormalizeStructuredExplanation(CandidateEvaluationContext context)
    {
        var strengths = BuildDeterministicStrengths(context);
        var areasToValidate = BuildDeterministicAreasToValidate(context);
        var potentialRisks = BuildDeterministicGaps(context);
        var interviewFocus = BuildDeterministicInterviewFocus(context, areasToValidate, potentialRisks);

        RemoveOverlaps(strengths, areasToValidate);
        RemoveOverlaps(strengths, potentialRisks);
        RemoveOverlaps(strengths, interviewFocus);
        RemoveOverlaps(areasToValidate, potentialRisks);
        RemoveOverlaps(areasToValidate, interviewFocus);

        var overallFit = BuildDeterministicSummary(context, strengths, potentialRisks);

        return new CandidateStructuredExplanation
        {
            OverallFit = overallFit,
            Strengths = strengths,
            AreasToValidate = areasToValidate,
            PotentialRisks = potentialRisks,
            RecommendedInterviewFocus = interviewFocus,
        };
    }

    private static void RemoveOverlaps(List<string> source, List<string> target)
    {
        if (source.Count == 0 || target.Count == 0)
        {
            return;
        }

        var normalizedSource = source
            .Select(NormalizeForComparison)
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .ToHashSet(StringComparer.Ordinal);

        target.RemoveAll(item => normalizedSource.Contains(NormalizeForComparison(item)));
    }

    // Builds skill signals.
    private static List<CandidateEvaluationSkillSignal> BuildSkillSignals(
        IEnumerable<string> jobSkills,
        IEnumerable<CandidateExplanationMatchItem> details)
    {
        var signals = new Dictionary<string, CandidateEvaluationSkillSignal>(StringComparer.OrdinalIgnoreCase);

        foreach (var skill in jobSkills)
        {
            var cleanedName = CleanSkillName(skill);
            var key = NormalizeForComparison(cleanedName);
            if (string.IsNullOrWhiteSpace(key))
            {
                continue;
            }

            signals[key] = new CandidateEvaluationSkillSignal
            {
                Name = cleanedName,
                Level = CandidateEvaluationSignalLevels.Missing,
            };
        }

        foreach (var detail in details)
        {
            var cleanedName = CleanSkillName(detail.JdItem);
            var key = NormalizeForComparison(cleanedName);
            if (string.IsNullOrWhiteSpace(key))
            {
                continue;
            }

            var candidate = new CandidateEvaluationSkillSignal
            {
                Name = cleanedName,
                Level = ToSignalLevel(detail.MatchState),
                Signal = NormalizeCapabilityPhrase(detail.JdItem, detail.BestResumeEvidence),
            };

            if (!signals.TryGetValue(key, out var existing) || GetSignalRank(candidate.Level) > GetSignalRank(existing.Level))
            {
                signals[key] = candidate;
            }
            else if (string.IsNullOrWhiteSpace(existing.Signal) && !string.IsNullOrWhiteSpace(candidate.Signal))
            {
                existing.Signal = candidate.Signal;
            }
        }

        return
        [
            .. signals.Values
                .OrderByDescending(signal => GetSignalRank(signal.Level))
                .ThenBy(signal => signal.Name, StringComparer.OrdinalIgnoreCase)
        ];
    }

    // Builds highlights.
    private static List<string> BuildHighlights(params IEnumerable<CandidateExplanationMatchItem>[] groups)
    {
        List<string> highlights = [];

        foreach (var item in groups.SelectMany(group => group)
                     .Where(item => item.MatchState != CandidateExplanationMatchStates.NotFound))
        {
            AddPhrase(highlights, NormalizeCapabilityPhrase(item.JdItem, item.BestResumeEvidence));
        }

        return [.. highlights.Take(4)];
    }

    // Builds strength signals.
    private static List<string> BuildStrengthSignals(
        IReadOnlyList<CandidateEvaluationSkillSignal> requiredSkills,
        IReadOnlyList<CandidateEvaluationSkillSignal> preferredSkills,
        IReadOnlyList<string> highlights,
        string experienceAssessment)
    {
        List<string> strengths = [];

        foreach (var skill in requiredSkills.Where(skill => skill.Level == CandidateEvaluationSignalLevels.Strong).Take(3))
        {
            AddPhrase(strengths, skill.Name);
        }

        foreach (var highlight in highlights)
        {
            AddPhrase(strengths, highlight);
        }

        foreach (var skill in preferredSkills.Where(skill => skill.Level == CandidateEvaluationSignalLevels.Strong).Take(2))
        {
            AddPhrase(strengths, skill.Name);
        }

        if (experienceAssessment == "meets requirement")
        {
            AddPhrase(strengths, "Required experience level");
        }

        return [.. strengths.Take(4)];
    }

    // Builds weak signals.
    private static List<string> BuildWeakSignals(
        IReadOnlyList<CandidateEvaluationSkillSignal> requiredSkills,
        IEnumerable<CandidateExplanationMatchItem> responsibilityDetails,
        IEnumerable<CandidateExplanationMatchItem> descriptionDetails)
    {
        List<string> weakSignals = [];

        foreach (var skill in requiredSkills.Where(skill => skill.Level == CandidateEvaluationSignalLevels.Related).Take(3))
        {
            AddPhrase(weakSignals, string.IsNullOrWhiteSpace(skill.Signal) ? skill.Name : skill.Signal);
        }

        foreach (var item in responsibilityDetails.Concat(descriptionDetails)
                     .Where(item => item.MatchState is CandidateExplanationMatchStates.RelatedEvidence
                         or CandidateExplanationMatchStates.PartialEvidence
                         or CandidateExplanationMatchStates.LimitedEvidence))
        {
            AddPhrase(weakSignals, NormalizeCapabilityPhrase(item.JdItem, item.BestResumeEvidence));
        }

        return [.. weakSignals.Take(3)];
    }

    // Builds deterministic strengths.
    private static List<string> BuildDeterministicStrengths(CandidateEvaluationContext context)
    {
        List<string> strengths = [];

        List<string> strongRequired =
        [
            .. context.Evaluation.RequiredSkills
                .Where(signal => signal.Level == CandidateEvaluationSignalLevels.Strong)
                .Select(signal => signal.Name)
                .Take(3)
        ];

        if (strongRequired.Count > 0)
        {
            AddInsight(strengths, $"Strong experience in {JoinItems(strongRequired)}.");
        }

        if (context.Evaluation.Highlights.Count > 0)
        {
            AddInsight(strengths, $"Solid background in role responsibilities such as {JoinItems(context.Evaluation.Highlights.Take(2))}.");
        }

        var strongPreferred = context.Evaluation.PreferredSkills
            .Where(signal => signal.Level == CandidateEvaluationSignalLevels.Strong)
            .Select(signal => signal.Name)
            .Take(2)
            .ToList();

        if (strongPreferred.Count > 0)
        {
            AddInsight(strengths, $"Additional exposure to {JoinItems(strongPreferred)}.");
        }

        if (context.Evaluation.ExperienceAssessment == "meets requirement")
        {
            AddInsight(strengths, "Meets the required years of experience.");
        }

        return [.. strengths.Take(4)];
    }

    // Builds deterministic gaps.
    private static List<string> BuildDeterministicGaps(CandidateEvaluationContext context)
    {
        List<string> gaps = [];

        var firstRelatedRequired = context.Evaluation.RequiredSkills
            .FirstOrDefault(signal => signal.Level == CandidateEvaluationSignalLevels.Related);

        if (firstRelatedRequired is not null)
        {
            var relatedSignal = string.IsNullOrWhiteSpace(firstRelatedRequired.Signal)
                || NormalizeForComparison(firstRelatedRequired.Signal) == NormalizeForComparison(firstRelatedRequired.Name)
                    ? null
                    : firstRelatedRequired.Signal.ToLowerInvariant();

            AddInsight(
                gaps,
                relatedSignal is null
                    ? $"Limited direct evidence of {firstRelatedRequired.Name}."
                    : $"Limited direct evidence of {firstRelatedRequired.Name}; related experience is closer to {relatedSignal}.");
        }

        foreach (var missingSkill in context.Evaluation.MissingSkills)
        {
            AddInsight(gaps, $"No clear evidence of {missingSkill}.");
            if (gaps.Count >= 2)
            {
                break;
            }
        }

        if (gaps.Count < 3 && context.Evaluation.ExperienceAssessment == "below requirement")
        {
            AddInsight(gaps, "May fall short of the stated years-of-experience requirement.");
        }

        if (gaps.Count < 3 && context.Evaluation.EducationAssessment == "below requirement")
        {
            AddInsight(gaps, "May not meet the stated education requirement.");
        }

        return [.. gaps.Take(3)];
    }

    // Builds deterministic summary.
    private static string BuildDeterministicSummary(
        CandidateEvaluationContext context,
        List<string> strengths,
        List<string> gaps)
    {
        var strongRequired = context.Evaluation.RequiredSkills
            .Where(signal => signal.Level == CandidateEvaluationSignalLevels.Strong)
            .Select(signal => signal.Name)
            .Take(3)
            .ToList();

        var summary = new StringBuilder();

        if (strongRequired.Count > 0)
        {
            summary.Append($"Strong alignment with required technologies, particularly {JoinItems(strongRequired)}.");
        }
        else if (strengths.Count > 0)
        {
            summary.Append(strengths[0]);
        }

        if (context.Evaluation.WeakSignals.Count > 0)
        {
            var relatedSkill = context.Evaluation.RequiredSkills.FirstOrDefault(signal => signal.Level == CandidateEvaluationSignalLevels.Related);
            summary.Append($" Validate depth in {relatedSkill?.Name ?? context.Evaluation.WeakSignals[0]} during interview.");
        }
        else if (gaps.Count > 0)
        {
            summary.Append($" {gaps[0]}");
        }

        return CleanupInsightText(summary.ToString());
    }

    // Builds deterministic areas to validate.
    private static List<string> BuildDeterministicAreasToValidate(CandidateEvaluationContext context)
    {
        List<string> validations = [];

        if (context.Evaluation.WeakSignals.Count > 0)
        {
            AddInsight(validations, $"Validate hands-on depth in {context.Evaluation.WeakSignals[0]} with implementation examples.");
        }

        var relatedRequired = context.Evaluation.RequiredSkills
            .FirstOrDefault(signal => signal.Level == CandidateEvaluationSignalLevels.Related);
        if (relatedRequired is not null)
        {
            AddInsight(validations, $"Probe production-level experience with {relatedRequired.Name} versus adjacent tooling.");
        }

        if (context.Job.MinimumYears.HasValue && context.Candidate.TotalExperienceMonths.HasValue)
        {
            var requiredMonths = context.Job.MinimumYears.Value * 12;
            if (context.Candidate.TotalExperienceMonths.Value < requiredMonths)
            {
                AddInsight(validations, $"Verify scope and ownership from recent roles because evidence is below the {context.Job.MinimumYears.Value}-year requirement.");
            }
        }

        return [.. validations.Take(3)];
    }

    // Builds deterministic interview focus.
    private static List<string> BuildDeterministicInterviewFocus(
        CandidateEvaluationContext context,
        IReadOnlyList<string> areasToValidate,
        IReadOnlyList<string> potentialRisks)
    {
        List<string> focus = [];

        var strongRequired = context.Evaluation.RequiredSkills
            .Where(signal => signal.Level == CandidateEvaluationSignalLevels.Strong)
            .Select(signal => signal.Name)
            .Take(2)
            .ToList();

        if (strongRequired.Count > 0)
        {
            AddInsight(focus, $"Run a technical deep dive on {JoinItems(strongRequired)} using one recent project as proof of ownership.");
        }

        if (areasToValidate.Count > 0)
        {
            AddInsight(focus, "Use scenario questions to test architecture choices, trade-offs, and debugging approach in the flagged validation areas.");
        }

        if (potentialRisks.Count > 0)
        {
            AddInsight(focus, "Add a practical exercise to confirm delivery speed and quality in the highest-risk requirement gap.");
        }

        if (focus.Count == 0)
        {
            AddInsight(focus, "Use one end-to-end case study to confirm technical depth, collaboration, and delivery outcomes.");
        }

        return [.. focus.Take(4)];
    }

    // Handles looks like resume fragment.
    private static bool LooksLikeResumeFragment(string value)
    {
        if (value.Contains('"'))
        {
            return true;
        }

        var wordCount = value.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).Length;
        return wordCount > 28 || value.Count(character => character == ',') >= 3 || value.Contains(';');
    }

    // Builds match details.
    private static List<CandidateExplanationMatchItem> BuildMatchDetails(IEnumerable<MatchEvidence> matches)
    {
        return
        [
            .. matches
                .Select(BuildMatchDetail)
                .OrderByDescending(item => item.FinalMatchConfidence)
                .ThenByDescending(item => item.EvidenceCountDistinct)
        ];
    }

    // Builds match detail.
    private static CandidateExplanationMatchItem BuildMatchDetail(MatchEvidence match)
    {
        return new CandidateExplanationMatchItem
        {
            JdItem = match.JdItem,
            MatchState = ClassifyMatchState(match),
            MatchType = string.IsNullOrWhiteSpace(match.MatchType) ? "unmatched" : match.MatchType,
            BaseMatchScore = match.BaseMatchScore,
            FinalMatchConfidence = GetEffectiveConfidence(match),
            BestResumeEvidence = match.BestResumeEvidence,
            StrongestEvidence = string.IsNullOrWhiteSpace(match.StrongestEvidence) ? match.BestResumeEvidence : match.StrongestEvidence,
            EvidenceSourcePath = match.EvidenceSourcePath,
            Source = match.Source,
            MatchReason = match.MatchReason,
            EvidenceCountTotal = match.EvidenceCountTotal,
            EvidenceCountDistinct = match.EvidenceCountDistinct,
            EvidenceTypesUsed = match.EvidenceTypesUsed ?? [],
        };
    }

    // Handles classify match state.
    private static string ClassifyMatchState(MatchEvidence match)
    {
        var hasEvidence = !string.IsNullOrWhiteSpace(match.BestResumeEvidence) || !string.IsNullOrWhiteSpace(match.StrongestEvidence);
        if (!hasEvidence)
        {
            return CandidateExplanationMatchStates.NotFound;
        }

        var matchType = match.MatchType?.Trim().ToLowerInvariant() ?? string.Empty;
        var confidence = GetEffectiveConfidence(match);

        return matchType switch
        {
            "exact" => CandidateExplanationMatchStates.ExactEvidence,
            "alias" => CandidateExplanationMatchStates.ExactEvidence,
            "related_cluster" => CandidateExplanationMatchStates.RelatedEvidence,
            "semantic" when confidence >= StrongSemanticThreshold => CandidateExplanationMatchStates.ExactEvidence,
            "semantic" when confidence >= PartialEvidenceThreshold => CandidateExplanationMatchStates.PartialEvidence,
            "semantic" when confidence >= LimitedEvidenceThreshold => CandidateExplanationMatchStates.LimitedEvidence,
            "weak_rule" when confidence >= LimitedEvidenceThreshold => CandidateExplanationMatchStates.LimitedEvidence,
            "rule" when confidence >= LimitedEvidenceThreshold => CandidateExplanationMatchStates.LimitedEvidence,
            _ when confidence >= PartialEvidenceThreshold => CandidateExplanationMatchStates.PartialEvidence,
            _ when confidence >= LimitedEvidenceThreshold => CandidateExplanationMatchStates.LimitedEvidence,
            _ => CandidateExplanationMatchStates.NotFound
        };
    }

    // Loads effective confidence.
    private static float GetEffectiveConfidence(MatchEvidence match)
    {
        return match.FinalMatchConfidence > 0f
            ? match.FinalMatchConfidence
            : Math.Max(match.Similarity, match.BaseMatchScore);
    }

    // Handles to signal level.
    private static string ToSignalLevel(string matchState)
    {
        return matchState switch
        {
            CandidateExplanationMatchStates.ExactEvidence => CandidateEvaluationSignalLevels.Strong,
            CandidateExplanationMatchStates.RelatedEvidence => CandidateEvaluationSignalLevels.Related,
            CandidateExplanationMatchStates.PartialEvidence => CandidateEvaluationSignalLevels.Related,
            CandidateExplanationMatchStates.LimitedEvidence => CandidateEvaluationSignalLevels.Related,
            _ => CandidateEvaluationSignalLevels.Missing,
        };
    }

    // Loads signal rank.
    private static int GetSignalRank(string level)
    {
        return level switch
        {
            CandidateEvaluationSignalLevels.Strong => 2,
            CandidateEvaluationSignalLevels.Related => 1,
            _ => 0,
        };
    }

    // Builds compatibility context.
    private static CandidateEvaluationCompatibilityContext BuildCompatibilityContext(
        ResumeSubmissionEntity submission,
        JobEntity job)
    {
        return new CandidateEvaluationCompatibilityContext
        {
            LocationCompatibility = EvaluateLocationCompatibility(submission.Location, job.Location),
            WorkSetupCompatibility = "unknown",
            EmploymentTypeCompatibility = "unknown",
        };
    }

    // Builds experience assessment.
    private static string BuildExperienceAssessment(bool? minimumYearsMet, int? totalExperienceMonths, int? minimumYears)
    {
        if (minimumYearsMet.HasValue)
        {
            return minimumYearsMet.Value ? "meets requirement" : "below requirement";
        }

        if (minimumYears.HasValue && totalExperienceMonths.HasValue)
        {
            return totalExperienceMonths.Value >= minimumYears.Value * 12 ? "meets requirement" : "below requirement";
        }

        return "unknown";
    }

    // Builds education assessment.
    private static string BuildEducationAssessment(bool? minimumEducationMet)
    {
        return minimumEducationMet.HasValue
            ? minimumEducationMet.Value ? "meets requirement" : "below requirement"
            : "unknown";
    }

    // Normalizes skill list.
    private static List<string> NormalizeSkillList(IEnumerable<string> values)
    {
        return
        [
            .. values
                .Select(CleanSkillName)
                .Where(value => !string.IsNullOrWhiteSpace(value))
                .Distinct(StringComparer.OrdinalIgnoreCase)
        ];
    }

    // Handles clean skill name.
    private static string CleanSkillName(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var cleaned = value.Trim();
        cleaned = WhitespaceRegex().Replace(cleaned, " ");
        return cleaned.Trim().TrimEnd('.', ';', ':');
    }

    // Normalizes capability phrase.
    private static string NormalizeCapabilityPhrase(string? primaryText, string? rawEvidence)
    {
        var combined = $"{primaryText} {rawEvidence}".Trim().ToLowerInvariant();
        combined = combined.Replace("restful", "rest");

        if (combined.Contains("typescript", StringComparison.Ordinal) && combined.Contains("next.js", StringComparison.Ordinal))
        {
            return "TypeScript and Next.js development";
        }

        if (combined.Contains("react", StringComparison.Ordinal) && combined.Contains("typescript", StringComparison.Ordinal))
        {
            return "React and TypeScript development";
        }

        if (combined.Contains("javascript", StringComparison.Ordinal) && combined.Contains("typescript", StringComparison.Ordinal))
        {
            return "TypeScript and JavaScript development";
        }

        if (combined.Contains("api", StringComparison.Ordinal) && combined.Contains("integrat", StringComparison.Ordinal))
        {
            return "API integration";
        }

        if (combined.Contains("rest", StringComparison.Ordinal) && combined.Contains("api", StringComparison.Ordinal))
        {
            return "REST API development";
        }

        if (combined.Contains("responsive", StringComparison.Ordinal)
            || combined.Contains("cross browser", StringComparison.Ordinal)
            || combined.Contains("cross-browser", StringComparison.Ordinal)
            || combined.Contains("device responsiveness", StringComparison.Ordinal))
        {
            return "Responsive frontend development";
        }

        if (combined.Contains("frontend", StringComparison.Ordinal)
            || combined.Contains("user interface", StringComparison.Ordinal)
            || combined.Contains("ui ", StringComparison.Ordinal))
        {
            return "Frontend application delivery";
        }

        if (combined.Contains("dashboard", StringComparison.Ordinal))
        {
            return "Dashboard development";
        }

        if (combined.Contains("stakeholder", StringComparison.Ordinal)
            || combined.Contains("cross functional", StringComparison.Ordinal)
            || combined.Contains("cross-functional", StringComparison.Ordinal)
            || combined.Contains("collaborat", StringComparison.Ordinal))
        {
            return "Cross-functional collaboration";
        }

        if (combined.Contains("performance", StringComparison.Ordinal) || combined.Contains("optimiz", StringComparison.Ordinal))
        {
            return "Performance optimization";
        }

        if (combined.Contains("scalab", StringComparison.Ordinal))
        {
            return "Scalable application development";
        }

        if (combined.Contains("backend", StringComparison.Ordinal))
        {
            return "Backend service development";
        }

        if (combined.Contains("architecture", StringComparison.Ordinal))
        {
            return "System architecture exposure";
        }

        if (combined.Contains("security", StringComparison.Ordinal)
            || combined.Contains("secure", StringComparison.Ordinal)
            || combined.Contains("authentication", StringComparison.Ordinal))
        {
            return "Security-focused development";
        }

        if (combined.Contains("testing", StringComparison.Ordinal) || combined.Contains("quality", StringComparison.Ordinal))
        {
            return "Testing and quality practices";
        }

        if (combined.Contains("maintain", StringComparison.Ordinal) || combined.Contains("maintenance", StringComparison.Ordinal))
        {
            return "Application maintenance";
        }

        var source = !string.IsNullOrWhiteSpace(primaryText) ? primaryText : rawEvidence;
        if (string.IsNullOrWhiteSpace(source))
        {
            return string.Empty;
        }

        var cleaned = NewlineRegex().Replace(source, " ");
        cleaned = NonWordSkillRegex().Replace(cleaned, " ");

        var tokens = cleaned
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToList();

        while (tokens.Count > 0 && LeadInWords.Contains(tokens[0], StringComparer.OrdinalIgnoreCase))
        {
            tokens.RemoveAt(0);
        }

        if (tokens.Count == 0)
        {
            return string.Empty;
        }

        var compactTokens = tokens
            .Take(6)
            .Select(PreserveTokenCase)
            .ToList();

        return ToSentenceCase(string.Join(' ', compactTokens));
    }

    // Handles preserve token case.
    private static string PreserveTokenCase(string token)
    {
        return token.ToLowerInvariant() switch
        {
            "api" => "API",
            "apis" => "APIs",
            "ui" => "UI",
            "ux" => "UX",
            "sql" => "SQL",
            "c#" => "C#",
            ".net" => ".NET",
            "asp.net" => "ASP.NET",
            "typescript" => "TypeScript",
            "javascript" => "JavaScript",
            "next.js" => "Next.js",
            "react" => "React",
            _ => token.ToLowerInvariant(),
        };
    }

    // Handles to sentence case.
    private static string ToSentenceCase(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        return char.ToUpperInvariant(value[0]) + value[1..];
    }

    // Handles add phrase.
    private static void AddPhrase(List<string> values, string? candidate)
    {
        if (string.IsNullOrWhiteSpace(candidate))
        {
            return;
        }

        var cleaned = candidate.Trim().TrimEnd('.', ';', ':');
        var normalized = NormalizeForComparison(cleaned);
        if (string.IsNullOrWhiteSpace(normalized) || values.Any(existing => NormalizeForComparison(existing) == normalized))
        {
            return;
        }

        values.Add(cleaned);
    }

    // Handles join items.
    private static string JoinItems(IEnumerable<string> values)
    {
        var items = values
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Select(value => value.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        return items.Count switch
        {
            0 => string.Empty,
            1 => items[0],
            2 => $"{items[0]} and {items[1]}",
            _ => $"{string.Join(", ", items.Take(items.Count - 1))}, and {items[^1]}"
        };
    }

    // Handles compose fallback text.
    private static string ComposeFallbackText(CandidateStructuredExplanation explanation)
    {
        static string FormatBullets(IEnumerable<string> values, string emptyState)
        {
            var cleaned = values
                .Select(CleanupInsightText)
                .Where(value => !string.IsNullOrWhiteSpace(value))
                .ToList();

            return cleaned.Count == 0
                ? $"- {emptyState}"
                : string.Join(Environment.NewLine, cleaned.Select(value => $"- {value}"));
        }

        var overallFit = CleanupInsightText(explanation.OverallFit);
        if (string.IsNullOrWhiteSpace(overallFit))
        {
            overallFit = "Insufficient evidence to determine overall fit.";
        }

        return string.Join(Environment.NewLine, new[]
        {
            "AI-Assisted Insight",
            string.Empty,
            "Overall Fit:",
            overallFit,
            string.Empty,
            "Strengths:",
            FormatBullets(explanation.Strengths, "No high-confidence strengths extracted."),
            string.Empty,
            "Areas to Validate:",
            FormatBullets(explanation.AreasToValidate, "No specific validation checkpoints identified."),
            string.Empty,
            "Potential Risks:",
            FormatBullets(explanation.PotentialRisks, "No explicit risk signals identified."),
            string.Empty,
            "Recommended Interview Focus:",
            FormatBullets(explanation.RecommendedInterviewFocus, "Use one end-to-end case discussion to confirm fit.")
        });
    }

    // Handles add insight.
    private static void AddInsight(List<string> insights, string? candidate)
    {
        var cleaned = CleanupInsightText(candidate);
        if (string.IsNullOrWhiteSpace(cleaned))
        {
            return;
        }

        var normalized = NormalizeForComparison(cleaned);
        if (insights.Any(existing => NormalizeForComparison(existing) == normalized))
        {
            return;
        }

        insights.Add(cleaned);
    }

    // Handles cleanup insight text.
    private static string CleanupInsightText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var cleaned = value
            .Replace("...", string.Empty, StringComparison.Ordinal)
            .Replace("..", ".", StringComparison.Ordinal)
            .Replace("supported by", "shown in", StringComparison.OrdinalIgnoreCase)
            .Replace("backed by", "shown in", StringComparison.OrdinalIgnoreCase)
            .Replace("based on extracted resume", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("These are insights based on the extracted resume", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Trim();

        cleaned = WhitespaceRegex().Replace(cleaned, " ");

        var sentences = SentenceSplitRegex().Split(cleaned)
            .Select(sentence => sentence.Trim())
            .Where(sentence => !string.IsNullOrWhiteSpace(sentence));

        List<string> deduped = [];
        foreach (var sentence in sentences)
        {
            var normalized = NormalizeForComparison(sentence);
            if (string.IsNullOrWhiteSpace(normalized) || deduped.Any(existing => NormalizeForComparison(existing) == normalized))
            {
                continue;
            }

            deduped.Add(sentence);
        }

        var result = deduped.Count > 0 ? string.Join(" ", deduped) : cleaned;
        return result.Trim().TrimEnd();
    }

    // Normalizes for comparison.
    private static string NormalizeForComparison(string value)
    {
        var lowered = value.ToLowerInvariant();
        lowered = lowered.Replace("restful", "rest");
        lowered = lowered.Replace("apis", "api");
        lowered = lowered.Replace("frameworks", "framework");
        lowered = ComparisonCleanupRegex().Replace(lowered, " ");
        return WhitespaceRegex().Replace(lowered, " ").Trim();
    }

    // Handles evaluate location compatibility.
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

    // Handles deserialize string list.
    private static List<string> DeserializeStringList(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return [];
        }

        return JsonSerializer.Deserialize<List<string>>(json) ?? [];
    }

    // Parses final score.
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

    // Parses resume.
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

    [GeneratedRegex(@"\s+", RegexOptions.CultureInvariant)]
    private static partial Regex WhitespaceRegex();

    [GeneratedRegex(@"[\r\n]+", RegexOptions.CultureInvariant)]
    private static partial Regex NewlineRegex();

    [GeneratedRegex(@"[^A-Za-z0-9\+#\. ]+", RegexOptions.CultureInvariant)]
    private static partial Regex NonWordSkillRegex();

    [GeneratedRegex(@"(?<=[.!?])\s+", RegexOptions.CultureInvariant)]
    private static partial Regex SentenceSplitRegex();

    [GeneratedRegex(@"[^a-z0-9\+#\. ]+", RegexOptions.CultureInvariant)]
    private static partial Regex ComparisonCleanupRegex();
}
