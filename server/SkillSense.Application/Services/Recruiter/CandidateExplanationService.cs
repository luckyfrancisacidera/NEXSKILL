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

public sealed class CandidateExplanationService(
    ICandidateExplanationRepository candidateExplanationRepository,
    IGenerativeExplanationProvider explanationProvider,
    ILogger<CandidateExplanationService> logger) : ICandidateExplanationService
{
    private const float StrongSemanticThreshold = 0.78f;
    private const float PartialEvidenceThreshold = 0.58f;
    private const float LimitedEvidenceThreshold = 0.42f;

    private static readonly string[] ResponsibilityGapHints =
    [
        "scalability",
        "maintain",
        "maintenance",
        "architecture",
        "ownership",
        "high-traffic",
        "optimiz",
        "performance",
        "secure",
        "security"
    ];

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

        var requiredSkillDetails = BuildMatchDetails(requiredMatches);
        var preferredSkillDetails = BuildMatchDetails(preferredMatches);
        var responsibilityDetails = BuildMatchDetails(responsibilityMatches);
        var descriptionDetails = BuildMatchDetails(descriptionMatches);

        var responsibilitiesSectionScore = finalScore?.SectionScores.GetValueOrDefault("responsibilities");
        var descriptionSectionScore = finalScore?.SectionScores.GetValueOrDefault("description");

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
            MatchSummary = BuildMatchSummary(requiredSkillDetails, preferredSkillDetails, responsibilityDetails, descriptionDetails)
        };
    }

    private static CandidateStructuredExplanation NormalizeStructuredExplanation(
        CandidateStructuredExplanation explanation,
        CandidateExplanationFacts facts)
    {
        var deterministicStrengths = BuildDeterministicStrengths(facts);
        var deterministicGaps = BuildDeterministicGaps(facts);
        var normalizedSummary = BuildDeterministicSummary(facts, deterministicStrengths, deterministicGaps);

        return new CandidateStructuredExplanation
        {
            Summary = normalizedSummary,
            Strengths = deterministicStrengths.Take(4).ToList(),
            Gaps = deterministicGaps.Take(2).ToList(),
        };
    }

    private static CandidateExplanationMatchSummaryFacts BuildMatchSummary(
        List<CandidateExplanationMatchItem> requiredSkillDetails,
        List<CandidateExplanationMatchItem> preferredSkillDetails,
        List<CandidateExplanationMatchItem> responsibilityDetails,
        List<CandidateExplanationMatchItem> descriptionDetails)
    {
        return new CandidateExplanationMatchSummaryFacts
        {
            RequiredSkillDetails = requiredSkillDetails,
            PreferredSkillDetails = preferredSkillDetails,
            ResponsibilityDetails = responsibilityDetails,
            DescriptionDetails = descriptionDetails,
            MatchedRequiredSkills = requiredSkillDetails.Where(IsPositiveEvidenceState).Select(x => x.JdItem).Distinct(StringComparer.OrdinalIgnoreCase).ToList(),
            MissingRequiredSkills = requiredSkillDetails.Where(x => x.MatchState == CandidateExplanationMatchStates.NotFound).Select(x => x.JdItem).Distinct(StringComparer.OrdinalIgnoreCase).ToList(),
            MatchedPreferredSkills = preferredSkillDetails.Where(IsPositiveEvidenceState).Select(x => x.JdItem).Distinct(StringComparer.OrdinalIgnoreCase).ToList(),
            MatchedResponsibilities = responsibilityDetails.Where(IsPositiveEvidenceState).Select(x => x.JdItem).Distinct(StringComparer.OrdinalIgnoreCase).ToList(),
            MissingResponsibilities = responsibilityDetails.Where(x => x.MatchState == CandidateExplanationMatchStates.NotFound).Select(x => x.JdItem).Distinct(StringComparer.OrdinalIgnoreCase).ToList(),
            TopDescriptionAlignmentEvidence = descriptionDetails
                .Where(x => !string.IsNullOrWhiteSpace(x.BestResumeEvidence))
                .OrderByDescending(x => x.FinalMatchConfidence)
                .Select(ToEvidenceItem)
                .GroupBy(x => new { JdItem = x.JdItem.ToLowerInvariant(), Evidence = x.BestResumeEvidence.ToLowerInvariant() })
                .Select(x => x.First())
                .Take(3)
                .ToList(),
            DescriptionTopMatches = descriptionDetails
                .Where(IsPositiveEvidenceState)
                .OrderByDescending(x => x.FinalMatchConfidence)
                .Select(x => x.JdItem)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(3)
                .ToList(),
            RoleRelevantExperienceEvidence = responsibilityDetails
                .Concat(requiredSkillDetails)
                .Where(x => !string.IsNullOrWhiteSpace(x.Source))
                .Where(x => x.Source.StartsWith("work_experience", StringComparison.OrdinalIgnoreCase))
                .Where(IsPositiveEvidenceState)
                .OrderByDescending(x => x.FinalMatchConfidence)
                .Select(ToEvidenceItem)
                .GroupBy(x => new { JdItem = x.JdItem.ToLowerInvariant(), Evidence = x.BestResumeEvidence.ToLowerInvariant() })
                .Select(x => x.First())
                .Take(4)
                .ToList(),
            NotableEvidence = requiredSkillDetails
                .Concat(preferredSkillDetails)
                .Concat(responsibilityDetails)
                .Concat(descriptionDetails)
                .Where(x => !string.IsNullOrWhiteSpace(x.BestResumeEvidence))
                .OrderByDescending(x => x.FinalMatchConfidence)
                .Select(ToEvidenceItem)
                .GroupBy(x => new { JdItem = x.JdItem.ToLowerInvariant(), Evidence = x.BestResumeEvidence.ToLowerInvariant() })
                .Select(x => x.First())
                .Take(5)
                .ToList()
        };
    }

    private static List<string> BuildDeterministicStrengths(CandidateExplanationFacts facts)
    {
        var strengths = new List<string>();

        var exactRequiredSkills = facts.MatchSummary.RequiredSkillDetails
            .Where(x => x.MatchState == CandidateExplanationMatchStates.ExactEvidence)
            .OrderByDescending(x => x.FinalMatchConfidence)
            .ThenByDescending(x => x.EvidenceCountDistinct)
            .Take(4)
            .ToList();

        if (exactRequiredSkills.Count > 0)
        {
            strengths.Add($"Clear evidence of {JoinItems(exactRequiredSkills.Select(x => x.JdItem).Take(3))} through {SummarizeEvidenceTypes(exactRequiredSkills)}.");
        }

        var strongResponsibilities = facts.MatchSummary.ResponsibilityDetails
            .Where(x => x.MatchState is CandidateExplanationMatchStates.ExactEvidence or CandidateExplanationMatchStates.PartialEvidence)
            .OrderByDescending(x => x.FinalMatchConfidence)
            .Take(2)
            .ToList();

        if (strongResponsibilities.Count > 0)
        {
            strengths.Add($"Strong alignment to role responsibilities such as {Shorten(strongResponsibilities[0].JdItem, 110)}, supported by {DescribeEvidence(strongResponsibilities[0])}.");
        }

        var descriptionAlignment = facts.MatchSummary.DescriptionDetails
            .Where(x => x.MatchState is CandidateExplanationMatchStates.ExactEvidence or CandidateExplanationMatchStates.PartialEvidence)
            .OrderByDescending(x => x.FinalMatchConfidence)
            .FirstOrDefault();

        if (descriptionAlignment is not null)
        {
            strengths.Add($"Job description alignment is strongest around {Shorten(descriptionAlignment.JdItem, 90)}, backed by {DescribeEvidence(descriptionAlignment)}.");
        }

        var relatedSkills = facts.MatchSummary.RequiredSkillDetails
            .Where(x => x.MatchState == CandidateExplanationMatchStates.RelatedEvidence)
            .OrderByDescending(x => x.FinalMatchConfidence)
            .Take(2)
            .ToList();

        if (relatedSkills.Count > 0)
        {
            strengths.Add($"Related experience supports {JoinItems(relatedSkills.Select(x => x.JdItem))}, with strongest evidence in {JoinItems(relatedSkills.Select(GetRelatedEvidenceLabel))}.");
        }

        if (facts.Scoring.MinimumYearsMet == true && facts.Job.MinimumYears is > 0)
        {
            strengths.Add("The minimum years-of-experience requirement appears to be satisfied.");
        }

        return strengths
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(4)
            .ToList();
    }

    private static List<string> BuildDeterministicGaps(CandidateExplanationFacts facts)
    {
        var gaps = new List<string>();

        var relatedRequiredGap = facts.MatchSummary.RequiredSkillDetails
            .Where(x => x.MatchState == CandidateExplanationMatchStates.RelatedEvidence)
            .OrderByDescending(x => x.FinalMatchConfidence)
            .FirstOrDefault();

        if (relatedRequiredGap is not null)
        {
            gaps.Add($"Related experience is clear for {relatedRequiredGap.JdItem}, but direct evidence is strongest in {GetRelatedEvidenceLabel(relatedRequiredGap)} rather than the exact requested stack.");
        }

        var limitedRequired = facts.MatchSummary.RequiredSkillDetails
            .Where(x => x.MatchState == CandidateExplanationMatchStates.LimitedEvidence)
            .OrderByDescending(x => x.FinalMatchConfidence)
            .FirstOrDefault();

        if (limitedRequired is not null)
        {
            gaps.Add($"Limited direct evidence is shown for {limitedRequired.JdItem}.");
        }

        if (gaps.Count < 2)
        {
            var missingRequired = facts.MatchSummary.RequiredSkillDetails
                .Where(x => x.MatchState == CandidateExplanationMatchStates.NotFound)
                .OrderByDescending(x => x.BaseMatchScore)
                .FirstOrDefault();

            if (missingRequired is not null)
            {
                gaps.Add($"Direct evidence for {missingRequired.JdItem} was not found in the resume.");
            }
        }

        if (gaps.Count < 2)
        {
            var limitedResponsibility = facts.MatchSummary.ResponsibilityDetails
                .Where(x => x.MatchState is CandidateExplanationMatchStates.LimitedEvidence or CandidateExplanationMatchStates.NotFound)
                .OrderByDescending(ResponsibilityGapPriority)
                .ThenByDescending(x => x.FinalMatchConfidence)
                .FirstOrDefault();

            if (limitedResponsibility is not null)
            {
                gaps.Add(
                    limitedResponsibility.MatchState == CandidateExplanationMatchStates.NotFound
                        ? $"Direct evidence for {Shorten(limitedResponsibility.JdItem, 110)} was not found."
                        : $"There is limited direct evidence for {Shorten(limitedResponsibility.JdItem, 110)}.");
            }
        }

        if (gaps.Count < 2 && facts.Scoring.MinimumYearsMet == false)
        {
            gaps.Add("The formal years-of-experience requirement appears below the stated minimum, even though other evidence may still be relevant.");
        }

        if (gaps.Count < 2 && facts.Scoring.MinimumEducationMet == false)
        {
            gaps.Add("The stated education requirement appears unmet.");
        }

        return gaps
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(2)
            .ToList();
    }

    private static string? BuildDeterministicSummary(
        CandidateExplanationFacts facts,
        List<string> strengths,
        List<string> gaps)
    {
        var exactSkills = facts.MatchSummary.RequiredSkillDetails
            .Where(x => x.MatchState == CandidateExplanationMatchStates.ExactEvidence)
            .OrderByDescending(x => x.FinalMatchConfidence)
            .Take(3)
            .Select(x => x.JdItem)
            .ToList();

        var summary = new StringBuilder();

        if (exactSkills.Count > 0)
        {
            summary.Append($"Strong alignment to the role is supported by clear evidence in {JoinItems(exactSkills)}.");
        }
        else if (strengths.Count > 0)
        {
            summary.Append(strengths[0]);
        }

        var relatedSkill = facts.MatchSummary.RequiredSkillDetails
            .Where(x => x.MatchState == CandidateExplanationMatchStates.RelatedEvidence)
            .OrderByDescending(x => x.FinalMatchConfidence)
            .FirstOrDefault();

        if (relatedSkill is not null)
        {
            summary.Append($" Related experience is strongest in {GetRelatedEvidenceLabel(relatedSkill)}, while direct {relatedSkill.JdItem} evidence is not shown.");
        }
        else if (gaps.Count > 0)
        {
            summary.Append($" {gaps[0]}");
        }

        var result = summary.ToString().Trim();
        return string.IsNullOrWhiteSpace(result) ? null : result;
    }

    private static bool IsConsistentWithFacts(string? text, CandidateExplanationFacts facts)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return false;
        }

        var normalized = NormalizeForComparison(text);

        foreach (var item in EnumerateAllMatchItems(facts))
        {
            var normalizedItem = NormalizeForComparison(item.JdItem);
            if (string.IsNullOrWhiteSpace(normalizedItem))
            {
                continue;
            }

            if (IsFalseMissingClaim(normalized, normalizedItem, item.MatchState))
            {
                return false;
            }

            if (IsFalseExactClaim(normalized, normalizedItem, item.MatchState))
            {
                return false;
            }
        }

        return true;
    }

    private static bool IsFalseMissingClaim(string normalizedText, string normalizedItem, string matchState)
    {
        if (matchState == CandidateExplanationMatchStates.NotFound || !normalizedText.Contains(normalizedItem, StringComparison.Ordinal))
        {
            return false;
        }

        var escapedItem = Regex.Escape(normalizedItem);
        return Regex.IsMatch(normalizedText, $@"\bmissing\b(?:\s+\w+){{0,4}}\s+{escapedItem}(?:\s|$)", RegexOptions.CultureInvariant)
            || Regex.IsMatch(normalizedText, $@"\blacks?\b(?:\s+\w+){{0,4}}\s+{escapedItem}(?:\s|$)", RegexOptions.CultureInvariant)
            || Regex.IsMatch(normalizedText, $@"\bno\b(?:\s+\w+){{0,4}}\s+{escapedItem}(?:\s|$)", RegexOptions.CultureInvariant)
            || Regex.IsMatch(normalizedText, $@"\bnot found\b(?:\s+\w+){{0,4}}\s+{escapedItem}(?:\s|$)", RegexOptions.CultureInvariant)
            || Regex.IsMatch(normalizedText, $@"\bgap in\b(?:\s+\w+){{0,4}}\s+{escapedItem}(?:\s|$)", RegexOptions.CultureInvariant);
    }

    private static bool IsFalseExactClaim(string normalizedText, string normalizedItem, string matchState)
    {
        if (matchState == CandidateExplanationMatchStates.ExactEvidence || !normalizedText.Contains(normalizedItem, StringComparison.Ordinal))
        {
            return false;
        }

        var escapedItem = Regex.Escape(normalizedItem);
        return Regex.IsMatch(normalizedText, $@"\b(?:demonstrated\s+)?expertise in\b(?:\s+\w+){{0,3}}\s+{escapedItem}(?:\s|$)", RegexOptions.CultureInvariant)
            || Regex.IsMatch(normalizedText, $@"\bstrong evidence of\b(?:\s+\w+){{0,3}}\s+{escapedItem}(?:\s|$)", RegexOptions.CultureInvariant)
            || Regex.IsMatch(normalizedText, $@"\bclear evidence of\b(?:\s+\w+){{0,3}}\s+{escapedItem}(?:\s|$)", RegexOptions.CultureInvariant)
            || Regex.IsMatch(normalizedText, $@"\bhas\b(?:\s+\w+){{0,3}}\s+{escapedItem}(?:\s|$)", RegexOptions.CultureInvariant)
            || Regex.IsMatch(normalizedText, $@"\bexperienced in\b(?:\s+\w+){{0,3}}\s+{escapedItem}(?:\s|$)", RegexOptions.CultureInvariant);
    }

    private static IEnumerable<CandidateExplanationMatchItem> EnumerateAllMatchItems(CandidateExplanationFacts facts)
    {
        return facts.MatchSummary.RequiredSkillDetails
            .Concat(facts.MatchSummary.PreferredSkillDetails)
            .Concat(facts.MatchSummary.ResponsibilityDetails)
            .Concat(facts.MatchSummary.DescriptionDetails);
    }

    private static List<CandidateExplanationMatchItem> BuildMatchDetails(IEnumerable<MatchEvidence> matches)
    {
        return matches
            .Select(BuildMatchDetail)
            .OrderByDescending(x => x.FinalMatchConfidence)
            .ThenByDescending(x => x.EvidenceCountDistinct)
            .ToList();
    }

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

    private static float GetEffectiveConfidence(MatchEvidence match)
    {
        return match.FinalMatchConfidence > 0f
            ? match.FinalMatchConfidence
            : Math.Max(match.Similarity, match.BaseMatchScore);
    }

    private static bool IsPositiveEvidenceState(CandidateExplanationMatchItem item)
    {
        return item.MatchState != CandidateExplanationMatchStates.NotFound
            && item.MatchState != CandidateExplanationMatchStates.LimitedEvidence;
    }

    private static CandidateExplanationEvidenceItem ToEvidenceItem(CandidateExplanationMatchItem item)
    {
        return new CandidateExplanationEvidenceItem
        {
            JdItem = item.JdItem,
            BestResumeEvidence = item.StrongestEvidence
        };
    }

    private static string DescribeEvidence(CandidateExplanationMatchItem item)
    {
        if (!string.IsNullOrWhiteSpace(item.BestResumeEvidence))
        {
            var sourceLabel = GetSourceLabel(item);
            return string.IsNullOrWhiteSpace(sourceLabel)
                ? $"resume evidence like \"{Shorten(item.BestResumeEvidence, 90)}\""
                : $"{sourceLabel} evidence like \"{Shorten(item.BestResumeEvidence, 90)}\"";
        }

        if (item.EvidenceTypesUsed.Count > 0)
        {
            return SummarizeEvidenceTypes([item]);
        }

        return "resume evidence";
    }

    private static string GetRelatedEvidenceLabel(CandidateExplanationMatchItem item)
    {
        return !string.IsNullOrWhiteSpace(item.BestResumeEvidence)
            ? Shorten(item.BestResumeEvidence, 70)
            : item.JdItem;
    }

    private static string SummarizeEvidenceTypes(IEnumerable<CandidateExplanationMatchItem> items)
    {
        var types = items
            .SelectMany(x => x.EvidenceTypesUsed)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(NormalizeEvidenceType)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(3)
            .ToList();

        return types.Count == 0 ? "resume evidence" : JoinItems(types);
    }

    private static string NormalizeEvidenceType(string value)
    {
        return value.Trim().ToLowerInvariant() switch
        {
            "workbullet" => "work bullets",
            "projectbullet" => "project bullets",
            "projectsummary" => "project summaries",
            "skilllist" => "skills",
            "summary" => "resume summary",
            _ => value.Trim().Replace('_', ' ').ToLowerInvariant()
        };
    }

    private static string GetSourceLabel(CandidateExplanationMatchItem item)
    {
        var source = item.EvidenceSourcePath;
        if (string.IsNullOrWhiteSpace(source))
        {
            source = item.Source;
        }

        if (string.IsNullOrWhiteSpace(source))
        {
            return string.Empty;
        }

        var normalized = source.ToLowerInvariant();
        if (normalized.Contains("work_experience", StringComparison.Ordinal))
        {
            return "work experience";
        }

        if (normalized.Contains("projects", StringComparison.Ordinal))
        {
            return "project";
        }

        if (normalized.Contains("skills", StringComparison.Ordinal))
        {
            return "skills";
        }

        if (normalized.Contains("summary", StringComparison.Ordinal))
        {
            return "summary";
        }

        return string.Empty;
    }

    private static int ResponsibilityGapPriority(CandidateExplanationMatchItem item)
    {
        var normalized = item.JdItem.ToLowerInvariant();
        for (var index = 0; index < ResponsibilityGapHints.Length; index++)
        {
            if (normalized.Contains(ResponsibilityGapHints[index], StringComparison.Ordinal))
            {
                return ResponsibilityGapHints.Length - index;
            }
        }

        return 0;
    }

    private static string JoinItems(IEnumerable<string> values)
    {
        var items = values
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
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

    private static string Shorten(string value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length <= maxLength)
        {
            return value.Trim();
        }

        return $"{value[..(maxLength - 3)].Trim()}...";
    }

    private static string NormalizeForComparison(string value)
    {
        var lowered = value.ToLowerInvariant();
        lowered = lowered.Replace("restful", "rest");
        lowered = lowered.Replace("apis", "api");
        lowered = lowered.Replace("frameworks", "framework");
        lowered = Regex.Replace(lowered, @"[^a-z0-9\+#\. ]+", " ");
        return Regex.Replace(lowered, @"\s+", " ").Trim();
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
