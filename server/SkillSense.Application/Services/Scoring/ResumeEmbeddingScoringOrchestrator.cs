using Microsoft.Extensions.Configuration;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Contracts.Scoring.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Domain.Entities;
using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading;

namespace SkillSense.Application.Services.Scoring;

public sealed class ResumeEmbeddingScoringOrchestrator(ITextEmbeddingService embeddingService, IConfiguration? configuration = null) : IResumeScoringOrchestrator
{
    private readonly AtsScoringConfig _config = AtsScoringConfig.FromConfiguration(configuration);

    private static readonly Lazy<Dictionary<string, string>> SkillAliasMap = new(LoadSkillAliasMap);
    private static readonly Lazy<List<(string Phrase, string Canonical)>> AliasSignalPhrases = new(BuildAliasSignalPhrases);
    private static readonly Lazy<Dictionary<string, string[]>> CapabilityClusterLookup = new(BuildCapabilityClusterLookup);
    private static readonly Lazy<Dictionary<string, string>> CapabilityClusterNames = new(BuildCapabilityClusterNames);
    private static readonly Regex VersionSuffixRegex = new(@"\b(v|version)?\s*\d+(\.\d+)*\b", RegexOptions.Compiled | RegexOptions.IgnoreCase);
    private static readonly HashSet<string> SemanticStopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "and", "the", "for", "with", "using", "use", "build", "built", "develop", "developed",
        "create", "created", "deliver", "delivered", "support", "supported", "work", "worked",
        "team", "teams", "application", "applications", "system", "systems", "internal"
    };

    public async Task<(List<ResumeEmbeddingEntity> Embeddings, FinalMatchScore Score)> BuildAsync(Guid submissionId, ParsedResume resume, NormalizedJobDescription job, CancellationToken ct)
    {
        using var embeddingRuntime = new EmbeddingRuntime(embeddingService, ct);
        var skillCandidates = BuildSkillCandidates(resume);
        var skillProfiles = BuildCandidateProfiles(skillCandidates);
        var skillIndex = BuildSkillCandidateIndex(skillProfiles);
        var requiredMatchesTask = MatchSkillsAsync(job.RequiredSkills, skillProfiles, skillIndex, embeddingRuntime, true);
        var preferredMatchesTask = MatchSkillsAsync(job.PreferredSkills, skillProfiles, skillIndex, embeddingRuntime, false);
        var responsibilityMatchesTask = MatchResponsibilitiesAsync(job.Responsibilities, resume, embeddingRuntime);
        var descriptionMatchesTask = MatchDescriptionAsync(job.Description, resume, embeddingRuntime);

        await Task.WhenAll(requiredMatchesTask, preferredMatchesTask, responsibilityMatchesTask, descriptionMatchesTask);

        var requiredMatches = requiredMatchesTask.Result;
        var preferredMatches = preferredMatchesTask.Result;
        var responsibilityMatches = responsibilityMatchesTask.Result;
        var descriptionMatches = descriptionMatchesTask.Result;
        var actualYears = GetCandidateYears(resume);
        var implementationEvidence = ComputeImplementationEvidence(requiredMatches, responsibilityMatches, descriptionMatches, actualYears);

        var requiredScore = AggregateSkillScore(requiredMatches, job.RequiredSkills.Count, _config.RequiredSkillsNeutralScore, _config.RequiredSkillStrongThreshold, _config.RequiredSkillCoverageWeight, _config.RequiredSkillStrongMatchBonusMax);
        var preferredScore = AggregateSkillScore(preferredMatches, job.PreferredSkills.Count, _config.PreferredSkillsNeutralScore, _config.PreferredSkillStrongThreshold, _config.PreferredSkillCoverageWeight, _config.PreferredSkillStrongMatchBonusMax);
        var skillsScore = Math.Clamp((requiredScore * _config.RequiredSkillsBlend) + (preferredScore * _config.PreferredSkillsBlend), 0f, _config.SkillsScoreCeiling);
        var responsibilitiesScore = Math.Min(AggregateResponsibilityScore(responsibilityMatches, job.Responsibilities.Count), _config.ResponsibilitiesScoreCeiling);
        var descriptionScore = Math.Min(AggregateDescriptionScore(descriptionMatches), _config.DescriptionScoreCeiling);
        var educationScore = ScoreEducation(job.MinimumEducationLevel, resume);
        var yearsScore = ScoreYears(job.MinimumYearsExperience, resume);
        var baseWorkScore = Math.Clamp(
            (responsibilitiesScore * _config.WorkScoreResponsibilityBlend)
            + (descriptionScore * _config.WorkScoreSummaryBlend)
            + (requiredScore * _config.WorkScoreRequiredSkillsBlend),
            0f,
            _config.WorkScoreCeiling);
        var implementationAdjustment = Math.Max(0f, implementationEvidence.OverallScore - baseWorkScore) * _config.WorkScoreImplementationBlend;
        var workScore = Math.Clamp(baseWorkScore + implementationAdjustment, 0f, _config.WorkScoreCeiling);

        var sectionScores = new Dictionary<string, float>
        {
            ["work_experience"] = workScore,
            ["skills"] = skillsScore,
            ["responsibilities"] = responsibilitiesScore,
            ["description"] = descriptionScore,
            ["education"] = educationScore,
            ["years_experience"] = yearsScore
        };

        var matchedRequiredSkills = requiredMatches.Count(x => !string.IsNullOrWhiteSpace(x.BestResumeEvidence) && x.MatchType != "rule");
        var matchedPreferredSkills = preferredMatches.Count(x => !string.IsNullOrWhiteSpace(x.BestResumeEvidence) && x.MatchType != "rule");
        var meaningfulResponsibilityMatches = responsibilityMatches.Count(x => x.Similarity >= _config.ResponsibilityRelevantThreshold);
        var exactRequiredMatches = requiredMatches.Count(x => x.MatchType == "exact");
        var aliasRequiredMatches = requiredMatches.Count(x => x.MatchType == "alias");
        var relatedRequiredMatches = requiredMatches.Count(x => x.MatchType == "related_cluster");
        var semanticRequiredMatches = requiredMatches.Count(x => x.MatchType.StartsWith("semantic", StringComparison.OrdinalIgnoreCase));
        var strongResponsibilityMatches = responsibilityMatches.Count(x => x.Similarity >= _config.ResponsibilityStrongThreshold);
        var strongDescriptionMatches = descriptionMatches.Count(x => x.Similarity >= _config.DescriptionStrongChunkThreshold);
        var requiredCoverage = job.RequiredSkills.Count <= 0 ? 1f : matchedRequiredSkills / (float)job.RequiredSkills.Count;

        var sectionWeights = _config.GetNormalizedSectionWeights();
        var weightedBaseScore = sectionScores.Sum(x => x.Value * sectionWeights.GetValueOrDefault(x.Key, 0f));
        var calibratedBaseScore = CalibrateBaseScore(weightedBaseScore);
        var strongMatchBoost = ComputeStrongMatchBoost(workScore, skillsScore, responsibilitiesScore, descriptionScore, requiredCoverage, implementationEvidence.OverallScore);
        var penaltyBreakdown = ComputePenalty(educationScore, yearsScore, job.MinimumYearsExperience, actualYears, implementationEvidence);

        var final = (calibratedBaseScore + strongMatchBoost - penaltyBreakdown.TotalPenalty) * 100f;

        return ([], new FinalMatchScore
        {
            FinalScore = Math.Clamp(final, 0f, 100f),
            SectionScores = sectionScores,
            SectionScoreDetails =
            [
                new SectionScore
                {
                    Name = "work_experience",
                    Score = workScore,
                    Weight = sectionWeights.GetValueOrDefault("work_experience"),
                    MatchedItems = requiredMatches.Concat(responsibilityMatches).Take(5).ToList(),
                    Notes =
                    [
                        "Blends required-skill evidence, responsibility alignment, description relevance, and implementation evidence.",
                        $"Implementation evidence: overall {implementationEvidence.OverallScore:0.00}, work {implementationEvidence.WorkScore:0.00}, projects {implementationEvidence.ProjectScore:0.00}",
                        $"Adaptive evidence weighting: work {implementationEvidence.WorkWeight:0.00}, projects {implementationEvidence.ProjectWeight:0.00}, supporting {implementationEvidence.SupportWeight:0.00}",
                        implementationAdjustment > 0.005f
                            ? $"Implementation adjustment applied: +{implementationAdjustment:0.00} (project/work proof exceeded base work score)."
                            : "Implementation adjustment not needed because base work score already reflected the evidence."
                    ]
                },
                new SectionScore
                {
                    Name = "skills",
                    Score = skillsScore,
                    Weight = sectionWeights.GetValueOrDefault("skills"),
                    MatchedItems = requiredMatches.Concat(preferredMatches).ToList(),
                    Notes =
                    [
                        $"Required coverage: {matchedRequiredSkills}/{job.RequiredSkills.Count}",
                        $"Preferred coverage: {matchedPreferredSkills}/{job.PreferredSkills.Count}",
                        $"Match quality: {exactRequiredMatches} exact, {aliasRequiredMatches} alias, {relatedRequiredMatches} related-cluster, {semanticRequiredMatches} semantic",
                        "Exact and alias matches contribute more strongly than related-cluster and semantic evidence."
                    ]
                },
                new SectionScore
                {
                    Name = "responsibilities",
                    Score = responsibilitiesScore,
                    Weight = sectionWeights.GetValueOrDefault("responsibilities"),
                    MatchedItems = responsibilityMatches,
                    Notes =
                    [
                        $"Meaningful matches: {meaningfulResponsibilityMatches}/{job.Responsibilities.Count}",
                        $"Strong matches: {strongResponsibilityMatches}/{job.Responsibilities.Count}"
                    ]
                },
                new SectionScore
                {
                    Name = "description",
                    Score = descriptionScore,
                    Weight = sectionWeights.GetValueOrDefault("description"),
                    MatchedItems = descriptionMatches,
                    Notes =
                    [
                        $"Chunk matches: {descriptionMatches.Count(x => x.Similarity >= _config.DescriptionRelevantChunkThreshold)}/{Math.Max(1, descriptionMatches.Count)}",
                        $"Strong chunk matches: {strongDescriptionMatches}/{Math.Max(1, descriptionMatches.Count)}"
                    ]
                },
                new SectionScore { Name = "education", Score = educationScore, Weight = sectionWeights.GetValueOrDefault("education"), Notes = [job.MinimumEducationLevel] },
                new SectionScore
                {
                    Name = "years_experience",
                    Score = yearsScore,
                    Weight = sectionWeights.GetValueOrDefault("years_experience"),
                    Notes =
                    [
                        $"Required: {job.MinimumYearsExperience:0.##} years",
                        $"Candidate: {actualYears:0.##} years",
                        $"Base years penalty: {penaltyBreakdown.BaseYearsPenalty:0.000}",
                        penaltyBreakdown.ReliefApplied > 0f
                            ? $"Years penalty softened by {penaltyBreakdown.ReliefApplied:0.000} because implementation evidence was strong."
                            : "No years softening applied.",
                        implementationEvidence.ProjectMatchCount > 0
                            ? $"Project evidence contributed {implementationEvidence.ProjectMatchCount} matched signals and was considered in years calibration."
                            : "No qualifying project evidence was available for years calibration."
                    ]
                }
            ],
            Matches = new MatchGroups
            {
                RequiredSkills = requiredMatches,
                PreferredSkills = preferredMatches,
                Responsibilities = responsibilityMatches,
                DescriptionTopMatches = descriptionMatches.Take(3).ToList()
            },
            HardRequirements = new HardRequirementResult
            {
                MinimumEducationMet = educationScore >= 1f,
                MinimumYearsExperienceMet = yearsScore >= 1f
            }
        });
    }

    private float ComputeStrongMatchBoost(
        float workScore,
        float skillsScore,
        float responsibilitiesScore,
        float descriptionScore,
        float requiredCoverage,
        float implementationEvidenceScore)
    {
        var threshold = _config.StrongMatchThreshold;
        var workBoost = workScore < threshold
            ? 0f
            : _config.StrongExperienceBoost * ((workScore - threshold) / Math.Max(0.001f, 1f - threshold));
        var skillsBoost = skillsScore < threshold
            ? 0f
            : _config.StrongSkillsBoost * ((skillsScore - threshold) / Math.Max(0.001f, 1f - threshold));
        var responsibilityBoost = responsibilitiesScore < threshold
            ? 0f
            : _config.StrongResponsibilitiesBoost * ((responsibilitiesScore - threshold) / Math.Max(0.001f, 1f - threshold));
        var summaryBoost = descriptionScore < threshold
            ? 0f
            : _config.StrongSummaryBoost * ((descriptionScore - threshold) / Math.Max(0.001f, 1f - threshold));
        var combinedBoost = skillsScore >= threshold && responsibilitiesScore >= threshold ? _config.CombinedStrongMatchBoost : 0f;
        var coverageBoost = requiredCoverage <= _config.StrongCoverageThreshold
            ? 0f
            : _config.CoverageBoostMax * ((requiredCoverage - _config.StrongCoverageThreshold) / Math.Max(0.001f, 1f - _config.StrongCoverageThreshold));
        var implementationBoost = implementationEvidenceScore < _config.ImplementationStrongThreshold
            ? 0f
            : _config.StrongImplementationBoost * ((implementationEvidenceScore - _config.ImplementationStrongThreshold) / Math.Max(0.001f, 1f - _config.ImplementationStrongThreshold));

        return Math.Clamp(workBoost + skillsBoost + responsibilityBoost + summaryBoost + combinedBoost + coverageBoost + implementationBoost, 0f, _config.MaxBoost);
    }

    private PenaltyBreakdown ComputePenalty(
        float educationScore,
        float yearsScore,
        int minimumYearsExperience,
        float actualYears,
        ImplementationEvidenceBreakdown implementationEvidence)
    {
        var educationPenalty = educationScore >= 1f ? 0f : _config.EducationGapPenalty;
        var baseYearsPenalty = yearsScore >= 1f || minimumYearsExperience <= 0
            ? 0f
            : MathF.Pow(1f - yearsScore, _config.ExperienceGapPenaltyExponent) * _config.ExperienceGapPenaltyScale;
        var reliefApplied = SoftenYearsPenalty(baseYearsPenalty, minimumYearsExperience, actualYears, implementationEvidence, yearsScore);
        var yearsPenalty = Math.Max(0f, baseYearsPenalty - reliefApplied);
        var totalPenalty = Math.Clamp(educationPenalty + yearsPenalty, 0f, _config.MaxPenalty);

        return new PenaltyBreakdown(totalPenalty, educationPenalty, baseYearsPenalty, reliefApplied);
    }

    private float SoftenYearsPenalty(
        float baseYearsPenalty,
        int minimumYearsExperience,
        float actualYears,
        ImplementationEvidenceBreakdown implementationEvidence,
        float yearsScore)
    {
        if (baseYearsPenalty <= 0f || minimumYearsExperience <= 0)
        {
            return 0f;
        }

        var proximity = Math.Clamp(actualYears / Math.Max(1f, minimumYearsExperience), 0f, 1f);
        var nearMissFactor = actualYears + _config.YearsNearMissBufferYears >= minimumYearsExperience
            ? 1f
            : proximity;
        var implementationFactor = implementationEvidence.OverallScore <= _config.ImplementationYearsReliefThreshold
            ? 0f
            : (implementationEvidence.OverallScore - _config.ImplementationYearsReliefThreshold)
                / Math.Max(0.001f, 1f - _config.ImplementationYearsReliefThreshold);
        var projectFactor = implementationEvidence.ProjectScore <= _config.ProjectYearsReliefThreshold
            ? 0f
            : (implementationEvidence.ProjectScore - _config.ProjectYearsReliefThreshold)
                / Math.Max(0.001f, 1f - _config.ProjectYearsReliefThreshold);
        var lowMinimumFactor = minimumYearsExperience switch
        {
            <= 1 => 1f,
            2 => 0.82f,
            3 => 0.66f,
            _ => 0.5f
        };
        var yearsStrengthFactor = Math.Clamp((yearsScore - _config.YearsExperiencePartialFloor) / Math.Max(0.001f, 1f - _config.YearsExperiencePartialFloor), 0f, 1f);
        var reliefSignal = Math.Clamp(
            (nearMissFactor * _config.YearsPenaltyNearMissWeight)
            + (implementationFactor * _config.YearsPenaltyImplementationWeight)
            + (projectFactor * _config.YearsPenaltyProjectWeight)
            + (lowMinimumFactor * _config.YearsPenaltyLowRequirementWeight)
            + (yearsStrengthFactor * _config.YearsPenaltyExistingScoreWeight),
            0f,
            1f);

        return Math.Min(baseYearsPenalty, baseYearsPenalty * _config.YearsPenaltyMaxRelief * reliefSignal);
    }

    private ImplementationEvidenceBreakdown ComputeImplementationEvidence(
        IReadOnlyCollection<MatchEvidence> requiredMatches,
        IReadOnlyCollection<MatchEvidence> responsibilityMatches,
        IReadOnlyCollection<MatchEvidence> descriptionMatches,
        float actualYears)
    {
        var allEvidence = requiredMatches
            .Concat(responsibilityMatches)
            .Concat(descriptionMatches)
            .Where(HasImplementationEvidenceValue)
            .GroupBy(x => $"{x.JdItem}|{NormalizeEvidence(x.BestResumeEvidence)}|{x.Source}", StringComparer.OrdinalIgnoreCase)
            .Select(group => group
                .OrderByDescending(x => x.Similarity)
                .ThenByDescending(x => GetSourceStrength(x.Source))
                .First())
            .ToList();

        var workMatches = allEvidence
            .Where(x => x.Source.StartsWith("work_experience", StringComparison.OrdinalIgnoreCase))
            .ToList();
        var projectMatches = allEvidence
            .Where(x => x.Source.StartsWith("projects", StringComparison.OrdinalIgnoreCase))
            .ToList();
        var supportingMatches = allEvidence
            .Where(x => !x.Source.StartsWith("work_experience", StringComparison.OrdinalIgnoreCase)
                && !x.Source.StartsWith("projects", StringComparison.OrdinalIgnoreCase))
            .ToList();

        var workScore = ComputeEvidenceBucketScore(workMatches);
        var projectScore = ComputeEvidenceBucketScore(projectMatches);
        var supportScore = ComputeEvidenceBucketScore(supportingMatches);
        var juniorProjectFactor = actualYears <= _config.JuniorProjectEvidenceYearsThreshold
            ? 1f
            : actualYears >= _config.ExperiencedProjectEvidenceYearsThreshold
                ? 0f
                : 1f - ((actualYears - _config.JuniorProjectEvidenceYearsThreshold)
                    / Math.Max(0.001f, _config.ExperiencedProjectEvidenceYearsThreshold - _config.JuniorProjectEvidenceYearsThreshold));
        var projectWeight = Math.Clamp(_config.ImplementationEvidenceProjectWeight + (juniorProjectFactor * _config.JuniorProjectEvidenceWeightBoost), 0.15f, 0.5f);
        var workWeight = Math.Clamp(_config.ImplementationEvidenceWorkWeight - (juniorProjectFactor * _config.JuniorProjectEvidenceWorkShift), 0.3f, 0.65f);
        var supportWeight = Math.Max(0.05f, 1f - workWeight - projectWeight);
        var corroborationBonus = Math.Min(
            Math.Max(0, new[] { workMatches.Count > 0, projectMatches.Count > 0, supportingMatches.Count > 0 }.Count(x => x) - 1)
            * _config.ImplementationEvidenceCorroborationUnitBonus,
            _config.ImplementationEvidenceCorroborationCap);
        var overallScore = Math.Clamp(
            (workScore * workWeight)
            + (projectScore * projectWeight)
            + (supportScore * supportWeight)
            + corroborationBonus,
            0f,
            1f);

        return new ImplementationEvidenceBreakdown(
            OverallScore: overallScore,
            WorkScore: workScore,
            ProjectScore: projectScore,
            SupportScore: supportScore,
            WorkWeight: workWeight,
            ProjectWeight: projectWeight,
            SupportWeight: supportWeight,
            JuniorProjectFactor: juniorProjectFactor,
            WorkMatchCount: workMatches.Count,
            ProjectMatchCount: projectMatches.Count,
            SupportingMatchCount: supportingMatches.Count);
    }

    private float ComputeEvidenceBucketScore(IReadOnlyCollection<MatchEvidence> matches)
    {
        if (matches.Count == 0)
        {
            return 0f;
        }

        var deduplicated = matches
            .GroupBy(x => $"{NormalizeEvidence(x.BestResumeEvidence)}|{x.Source}", StringComparer.OrdinalIgnoreCase)
            .Select(group => group
                .OrderByDescending(x => x.Similarity)
                .ThenByDescending(x => GetSourceStrength(x.Source))
                .First())
            .OrderByDescending(x => x.Similarity)
            .ToList();

        var qualityWindow = Math.Max(1, Math.Min(_config.ImplementationEvidenceTopWindow, deduplicated.Count));
        var quality = deduplicated
            .Take(qualityWindow)
            .Average(x => Math.Clamp(
                (x.Similarity * _config.ImplementationEvidenceSimilarityWeight)
                + (GetMatchTypeSignal(x.MatchType) * _config.ImplementationEvidenceMatchTypeWeight)
                + (GetSourceStrength(x.Source) * _config.ImplementationEvidenceSourceWeight),
                0f,
                1f));
        var distinctJdCoverage = deduplicated
            .Select(x => NormalizeEvidence(x.JdItem))
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Count() / (float)Math.Max(1, deduplicated.Count);
        var evidenceDiversity = deduplicated
            .Select(x => x.Source)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Count();
        var diversityBonus = Math.Min(
            Math.Max(0, evidenceDiversity - 1) * _config.ImplementationEvidenceDiversityUnitBonus,
            _config.ImplementationEvidenceDiversityCap);

        return Math.Clamp(
            (quality * _config.ImplementationEvidenceQualityWeight)
            + (distinctJdCoverage * _config.ImplementationEvidenceCoverageWeight)
            + diversityBonus,
            0f,
            1f);
    }

    private bool HasImplementationEvidenceValue(MatchEvidence evidence)
    {
        if (evidence is null
            || string.IsNullOrWhiteSpace(evidence.BestResumeEvidence)
            || string.IsNullOrWhiteSpace(evidence.Source)
            || string.Equals(evidence.MatchType, "rule", StringComparison.OrdinalIgnoreCase)
            || evidence.Similarity <= 0f
            || evidence.Source.Equals("summary", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        return evidence.MatchType switch
        {
            "exact" or "alias" => true,
            "related_cluster" => evidence.Similarity >= _config.RelatedClusterMinScore,
            "semantic_many_to_many" or "semantic" => evidence.Similarity >= _config.ImplementationEvidenceMinimumSemantic,
            _ => evidence.Similarity >= _config.ImplementationEvidenceMinimumSemantic
        };
    }

    private float AggregateSkillScore(
        IReadOnlyCollection<MatchEvidence> matches,
        int expectedCount,
        float neutralScore,
        float strongThreshold,
        float coverageWeight,
        float strongMatchBonusMax)
    {
        if (expectedCount <= 0)
        {
            return 1f;
        }

        if (matches.Count == 0)
        {
            return neutralScore;
        }

        var positiveMatches = matches
            .Where(x => !string.IsNullOrWhiteSpace(x.BestResumeEvidence) && x.MatchType != "rule")
            .ToList();
        var matchedCount = positiveMatches.Count;
        var coverage = matchedCount / (float)expectedCount;
        var strongRatio = positiveMatches.Count(x => x.Similarity >= strongThreshold) / (float)expectedCount;
        var exactRatio = positiveMatches.Count(x => x.MatchType == "exact") / (float)expectedCount;
        var aliasRatio = positiveMatches.Count(x => x.MatchType == "alias") / (float)expectedCount;
        var confidence = positiveMatches
            .Select(ScoreEvidenceConfidence)
            .DefaultIfEmpty(0f)
            .Average();
        var quality = positiveMatches
            .Select(x => Math.Clamp(
                (x.Similarity * _config.SkillSimilarityWeight)
                + (ScoreEvidenceConfidence(x) * _config.SkillEvidenceConfidenceSignalWeight)
                + (GetMatchTypeSignal(x.MatchType) * _config.SkillMatchTypeSignalWeight),
                0f,
                1f))
            .DefaultIfEmpty(neutralScore)
            .Average();
        var qualityWeight = Math.Clamp(1f - coverageWeight - _config.SkillEvidenceConfidenceWeight, 0.15f, 0.75f);
        var blended = (quality * qualityWeight)
            + (coverage * coverageWeight)
            + (confidence * _config.SkillEvidenceConfidenceWeight);

        return Math.Clamp(
            blended
            + (strongRatio * strongMatchBonusMax)
            + (exactRatio * _config.ExactMatchScoreBonusMax)
            + (aliasRatio * _config.AliasMatchScoreBonusMax),
            0f,
            1f);
    }

    private float AggregateResponsibilityScore(IReadOnlyCollection<MatchEvidence> responsibilityMatches, int expectedCount)
    {
        if (expectedCount <= 0)
        {
            return _config.MissingResponsibilitiesNeutralScore;
        }

        if (responsibilityMatches.Count == 0)
        {
            return _config.MissingResponsibilitiesNeutralScore;
        }

        var qualityWindow = Math.Max(1, (int)Math.Ceiling(responsibilityMatches.Count * _config.ResponsibilityQualityWindowRatio));
        var quality = responsibilityMatches
            .OrderByDescending(x => x.Similarity)
            .Take(qualityWindow)
            .Average(x => x.Similarity);
        var coverageSignal = responsibilityMatches
            .Average(x => Math.Clamp(
                (x.Similarity - _config.ResponsibilityCoverageFloor)
                / Math.Max(0.001f, 1f - _config.ResponsibilityCoverageFloor),
                0f,
                1f));
        var relevantRatio = responsibilityMatches.Count(x => x.Similarity >= _config.ResponsibilityRelevantThreshold) / (float)expectedCount;
        var strongRatio = responsibilityMatches.Count(x => x.Similarity >= _config.ResponsibilityStrongThreshold) / (float)expectedCount;
        var momentumWindow = Math.Max(1, (int)Math.Ceiling(expectedCount * _config.ResponsibilityMomentumCoverageRatio));
        var momentum = responsibilityMatches
            .OrderByDescending(x => x.Similarity)
            .Take(momentumWindow)
            .DefaultIfEmpty(new MatchEvidence())
            .Average(x => x.Similarity);
        var blended = (quality * _config.ResponsibilityQualityWeight)
            + (coverageSignal * _config.ResponsibilityCoverageWeight)
            + (momentum * _config.ResponsibilityMomentumWeight);
        var evidenceDrivenFloor = quality * _config.ResponsibilityEvidenceRetentionFloor;

        return Math.Clamp(Math.Max(
            evidenceDrivenFloor,
            blended
            + (relevantRatio * _config.ResponsibilityRelevantMatchBonusMax)
            + (strongRatio * _config.ResponsibilityStrongMatchBonusMax)),
            0f,
            1f);
    }

    private float AggregateDescriptionScore(IReadOnlyCollection<MatchEvidence> descriptionMatches)
    {
        if (descriptionMatches.Count == 0)
        {
            return _config.MissingSummaryNeutralScore;
        }

        var totalWeight = 0f;
        var weightedQuality = 0f;
        var coveredWeight = 0f;
        var strongWeight = 0f;

        foreach (var match in descriptionMatches)
        {
            var chunkWeight = GetDescriptionChunkWeight(match.JdItem);
            totalWeight += chunkWeight;
            weightedQuality += match.Similarity * chunkWeight;

            if (match.Similarity >= _config.DescriptionRelevantChunkThreshold)
            {
                coveredWeight += chunkWeight;
            }

            if (match.Similarity >= _config.DescriptionStrongChunkThreshold)
            {
                strongWeight += chunkWeight;
            }
        }

        if (totalWeight <= 0f)
        {
            return _config.MissingSummaryNeutralScore;
        }

        var quality = weightedQuality / totalWeight;
        var coverage = coveredWeight / totalWeight;
        var strongCoverage = strongWeight / totalWeight;

        return Math.Clamp(
            (quality * _config.DescriptionQualityWeight)
            + (coverage * _config.DescriptionCoverageWeight)
            + (strongCoverage * _config.DescriptionStrongChunkBonusWeight),
            0f,
            1f);
    }

    private float CalibrateBaseScore(float weightedBaseScore)
        => Math.Clamp(1f - MathF.Pow(1f - Math.Clamp(weightedBaseScore, 0f, 1f), _config.BaseScoreExponent), 0f, 1f);

    private float ScoreEvidenceConfidence(MatchEvidence evidence)
    {
        var sourceBonus = evidence.Source.StartsWith("work_experience", StringComparison.OrdinalIgnoreCase)
            ? _config.ConfidenceWorkEvidenceBonus
            : evidence.Source.StartsWith("projects", StringComparison.OrdinalIgnoreCase)
                ? _config.ConfidenceProjectEvidenceBonus
                : 0f;

        var baseConfidence = evidence.MatchType switch
        {
            "exact" => _config.ExactMatchConfidence,
            "alias" => _config.AliasMatchConfidence,
            "related_cluster" => _config.RelatedClusterMatchConfidence,
            "semantic_many_to_many" or "semantic" => _config.SemanticMatchConfidenceFloor + ((1f - _config.SemanticMatchConfidenceFloor) * evidence.Similarity),
            _ => 0f
        };

        return Math.Clamp(baseConfidence + sourceBonus, 0f, 1f);
    }

    private float GetMatchTypeSignal(string matchType) => matchType switch
    {
        "exact" => 1f,
        "alias" => 0.94f,
        "related_cluster" => 0.88f,
        "semantic_many_to_many" => 0.86f,
        "semantic" => 0.82f,
        _ => 0f
    };

    private static List<(string Text, string Source)> BuildSkillCandidates(ParsedResume resume)
    {
        var items = new List<(string, string)>();
        items.AddRange(resume.Skills.Select((s, index) => (s, $"skills[{index}]")));
        items.AddRange(resume.WorkExperience.SelectMany((w, workIndex) => w.Technologies.Select((t, techIndex) => (t, $"work_experience[{workIndex}].technologies[{techIndex}]"))));
        items.AddRange(resume.WorkExperience.SelectMany((w, workIndex) => w.Bullets.Select((b, bulletIndex) => (b, $"work_experience[{workIndex}].bullets[{bulletIndex}]"))));
        items.AddRange(resume.Projects.SelectMany((p, projectIndex) => p.Technologies.Select((t, techIndex) => (t, $"projects[{projectIndex}].technologies[{techIndex}]"))));
        items.AddRange(resume.Certifications.Select((c, index) => (c.Name, $"certifications[{index}].name")));
        return items.Where(x => !string.IsNullOrWhiteSpace(x.Item1)).ToList();
    }

    private static List<CandidateEvidenceProfile> BuildCandidateProfiles(List<(string Text, string Source)> candidates)
    {
        var profiles = new List<CandidateEvidenceProfile>();

        foreach (var candidate in candidates)
        {
            if (string.IsNullOrWhiteSpace(candidate.Text))
            {
                continue;
            }

            var normalizedText = NormalizeEvidence(candidate.Text);
            if (string.IsNullOrWhiteSpace(normalizedText))
            {
                continue;
            }

            var canonicalSignals = ExtractCanonicalSignals(candidate.Text);
            var capabilityClusters = ExtractCapabilityClusters(candidate.Text, canonicalSignals);
            var tokens = TokenizeForSemanticComparison(candidate.Text);

            profiles.Add(new CandidateEvidenceProfile(
                candidate.Text,
                candidate.Source,
                normalizedText,
                NormalizeSkill(candidate.Text),
                canonicalSignals,
                capabilityClusters,
                tokens));
        }

        return profiles;
    }

    private static SkillCandidateIndex BuildSkillCandidateIndex(List<CandidateEvidenceProfile> profiles)
    {
        var exact = new Dictionary<string, CandidateEvidenceProfile>(StringComparer.Ordinal);
        var canonical = new Dictionary<string, CandidateEvidenceProfile>(StringComparer.Ordinal);

        foreach (var profile in profiles)
        {
            if (!string.IsNullOrWhiteSpace(profile.NormalizedSkillKey)
                && (!exact.TryGetValue(profile.NormalizedSkillKey, out var existingExact) || IsHigherQualityEvidence(profile, existingExact)))
            {
                exact[profile.NormalizedSkillKey] = profile;
            }

            foreach (var canonicalSignal in profile.CanonicalSignals)
            {
                if (string.IsNullOrWhiteSpace(canonicalSignal))
                {
                    continue;
                }

                if (!canonical.TryGetValue(canonicalSignal, out var existingCanonical) || IsHigherQualityEvidence(profile, existingCanonical))
                {
                    canonical[canonicalSignal] = profile;
                }
            }
        }

        return new SkillCandidateIndex(exact, canonical);
    }

    private async Task<List<MatchEvidence>> MatchSkillsAsync(
        List<string> jdSkills,
        List<CandidateEvidenceProfile> candidates,
        SkillCandidateIndex skillIndex,
        EmbeddingRuntime embeddingRuntime,
        bool required)
    {
        var results = new List<MatchEvidence>();
        foreach (var jdSkill in jdSkills.Where(s => !string.IsNullOrWhiteSpace(s)))
        {
            var canonicalJdSkill = CanonicalizeSkill(jdSkill);
            var normalizedJdSkill = NormalizeSkill(jdSkill);
            if (!string.IsNullOrWhiteSpace(normalizedJdSkill)
                && skillIndex.Exact.TryGetValue(normalizedJdSkill, out var exact))
            {
                var exactMatch = new MatchEvidence
                {
                    JdItem = jdSkill,
                    BestResumeEvidence = exact.Text,
                    Source = exact.Source,
                    EvidenceSourcePath = exact.Source,
                    Similarity = GetDirectSkillMatchBaseScore(exact.Source, "exact"),
                    MatchType = "exact",
                    MatchReason = $"Matched exact normalized skill '{NormalizeEvidence(jdSkill)}'."
                };
                var exactSupports = CollectSupportingEvidence(jdSkill, canonicalJdSkill, candidates, "exact", exact.Text, exact.Source);
                results.Add(ApplyEvidenceDepth(exactMatch, exactSupports, 1.18f));
                continue;
            }

            if (!string.IsNullOrWhiteSpace(canonicalJdSkill)
                && skillIndex.Canonical.TryGetValue(canonicalJdSkill, out var canonical))
            {
                var aliasMatch = new MatchEvidence
                {
                    JdItem = jdSkill,
                    BestResumeEvidence = canonical.Text,
                    Source = canonical.Source,
                    EvidenceSourcePath = canonical.Source,
                    Similarity = GetDirectSkillMatchBaseScore(canonical.Source, "alias"),
                    MatchType = "alias",
                    MatchReason = $"Normalized '{jdSkill}' to canonical '{canonicalJdSkill}'."
                };
                var aliasSupports = CollectSupportingEvidence(jdSkill, canonicalJdSkill, candidates, "alias", canonical.Text, canonical.Source);
                results.Add(ApplyEvidenceDepth(aliasMatch, aliasSupports, 1.16f));
                continue;
            }

            var related = TryBuildRelatedClusterEvidence(jdSkill, canonicalJdSkill, candidates);
            if (related is not null)
            {
                results.Add(related);
                continue;
            }

            var semantic = await BuildManyToManySemanticEvidenceAsync(
                jdSkill,
                candidates.Select(x => (x.Text, x.Source)).ToList(),
                embeddingRuntime);
            if (semantic.Similarity >= _config.SemanticSkillThreshold)
            {
                semantic.Similarity = CalibrateSemanticSimilarity(
                    semantic.Similarity,
                    _config.SemanticSkillThreshold,
                    _config.SemanticSkillFloor,
                    _config.SemanticSkillCeiling,
                    semantic.Source);
                semantic.MatchType = "semantic_many_to_many";
                results.Add(semantic);
            }
            else if (required)
            {
                results.Add(new MatchEvidence
                {
                    JdItem = jdSkill,
                    BestResumeEvidence = string.Empty,
                    Source = string.Empty,
                    EvidenceSourcePath = string.Empty,
                    Similarity = _config.RequiredSkillMissingFloor,
                    MatchType = "rule",
                    MatchReason = "No exact, alias, related-cluster, or semantic evidence cleared the required-skill threshold."
                });
            }
        }

        return results;
    }

    private async Task<List<MatchEvidence>> MatchResponsibilitiesAsync(List<string> responsibilities, ParsedResume resume, EmbeddingRuntime embeddingRuntime)
    {
        var normalizedResponsibilities = PreprocessResponsibilities(responsibilities);
        var candidates = BuildResponsibilityCandidates(resume);
        var candidateProfiles = BuildCandidateProfiles(candidates);

        var tasks = normalizedResponsibilities.Select(responsibility =>
            BuildResponsibilityEvidenceAsync(responsibility, candidates, candidateProfiles, embeddingRuntime));

        return (await Task.WhenAll(tasks)).ToList();
    }

    private static List<ResponsibilityInput> PreprocessResponsibilities(List<string> responsibilities)
    {
        var cleaned = responsibilities
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(NormalizeResponsibilityText)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToList();

        var merged = new List<string>();
        foreach (var current in cleaned)
        {
            if (merged.Count > 0 && ShouldMergeResponsibility(merged[^1], current))
            {
                merged[^1] = NormalizeResponsibilityText($"{merged[^1]} {current}");
                continue;
            }

            merged.Add(current);
        }

        return merged
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(x => new ResponsibilityInput(x, x))
            .ToList();
    }

    private static bool ShouldMergeResponsibility(string previous, string current)
    {
        var previousHasTerminalPunctuation = previous.EndsWith('.') || previous.EndsWith(';') || previous.EndsWith(':');
        var currentWords = current.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
        var currentStartsLower = current.Length > 0 && char.IsLower(current[0]);

        if (!previousHasTerminalPunctuation && currentWords <= 3) return true;
        if (currentStartsLower && currentWords <= 6) return true;

        return false;
    }

    private static string NormalizeResponsibilityText(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return string.Empty;

        var normalized = value.Trim();
        normalized = normalized.Replace("\n", " ").Replace("\r", " ").Replace("\t", " ");
        normalized = Regex.Replace(normalized, @"\s+", " ");
        normalized = Regex.Replace(normalized, @"\s*([,;:.])\s*", "$1 ");
        normalized = Regex.Replace(normalized, @"\.{2,}", ".");

        return normalized.Trim();
    }

    private static List<(string Text, string Source)> BuildResponsibilityCandidates(ParsedResume resume)
    {
        var candidates = new List<(string Text, string Source)>();

        candidates.AddRange(resume.WorkExperience.SelectMany((w, workIndex) => w.Bullets.Select((b, bulletIndex) => (b, $"work_experience[{workIndex}].bullets[{bulletIndex}]"))));
        candidates.AddRange(resume.WorkExperience.Select((w, workIndex) => (w.Description, $"work_experience[{workIndex}].description")));
        candidates.AddRange(resume.WorkExperience.SelectMany((w, workIndex) => w.Technologies.Select((t, techIndex) => (t, $"work_experience[{workIndex}].technologies[{techIndex}]"))));
        candidates.AddRange(resume.Projects.SelectMany((p, projectIndex) => p.Bullets.Select((b, bulletIndex) => (b, $"projects[{projectIndex}].bullets[{bulletIndex}]"))));
        candidates.AddRange(resume.Projects.Select((p, projectIndex) => (p.Description, $"projects[{projectIndex}].description")));
        candidates.AddRange(resume.Projects.SelectMany((p, projectIndex) => p.Technologies.Select((t, techIndex) => (t, $"projects[{projectIndex}].technologies[{techIndex}]"))));
        candidates.AddRange(resume.Skills.Select((s, index) => (s, $"skills[{index}]")));

        return candidates.Where(x => !string.IsNullOrWhiteSpace(x.Item1)).ToList();
    }

    private static List<(string Text, string Source)> BuildDescriptionCandidates(ParsedResume resume)
    {
        var candidates = new List<(string Text, string Source)>();
        candidates.AddRange(resume.Summary.Select((s, index) => (s, $"summary[{index}]")));
        candidates.AddRange(resume.WorkExperience.Select((w, workIndex) => (w.Description, $"work_experience[{workIndex}].description")));
        candidates.AddRange(resume.WorkExperience.SelectMany((w, workIndex) => w.Bullets.Select((b, bulletIndex) => (b, $"work_experience[{workIndex}].bullets[{bulletIndex}]"))));
        candidates.AddRange(resume.WorkExperience.SelectMany((w, workIndex) => w.Technologies.Select((t, techIndex) => (t, $"work_experience[{workIndex}].technologies[{techIndex}]"))));
        candidates.AddRange(resume.Projects.Select((p, projectIndex) => (p.Description, $"projects[{projectIndex}].description")));
        candidates.AddRange(resume.Projects.SelectMany((p, projectIndex) => p.Bullets.Select((b, bulletIndex) => (b, $"projects[{projectIndex}].bullets[{bulletIndex}]"))));
        candidates.AddRange(resume.Projects.SelectMany((p, projectIndex) => p.Technologies.Select((t, techIndex) => (t, $"projects[{projectIndex}].technologies[{techIndex}]"))));
        candidates.AddRange(resume.Skills.Select((s, index) => (s, $"skills[{index}]")));

        return candidates.Where(x => !string.IsNullOrWhiteSpace(x.Item1)).ToList();
    }

    private static List<ResponsibilityConcept> ExtractResponsibilityConcepts(string responsibility)
    {
        var concepts = new List<ResponsibilityConcept>();
        var canonicalSignals = ExtractCanonicalSignals(responsibility);
        concepts.AddRange(canonicalSignals.Select(signal => new ResponsibilityConcept(signal, 1.35f)));

        var clusters = ExtractCapabilityClusters(responsibility, canonicalSignals);
        concepts.AddRange(clusters.Select(cluster =>
        {
            var display = CapabilityClusterNames.Value.TryGetValue(cluster, out var name) ? name : cluster;
            return new ResponsibilityConcept(display, 1.15f);
        }));

        var phraseCandidates = Regex.Split(NormalizeResponsibilityText(responsibility), @"\b(and|with|for|to|or|such as)\b|,")
            .Select(x => x.Trim())
            .Where(x => x.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length is >= 2 and <= 6)
            .Where(x => x.Length >= 10)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(4)
            .Select(x => new ResponsibilityConcept(x, 0.85f));

        concepts.AddRange(phraseCandidates);

        return concepts
            .GroupBy(x => NormalizeEvidence(x.Text), StringComparer.OrdinalIgnoreCase)
            .Select(group => group.OrderByDescending(x => x.Weight).First())
            .Take(6)
            .ToList();
    }

    private static List<string> SplitDescriptionIntoChunks(string description)
        => description
            .Split(new[] { "\r\n", "\n", ";", "." }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(NormalizeResponsibilityText)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Where(x => x.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length >= 3)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

    private float GetDescriptionChunkWeight(string chunk)
    {
        var canonicalSignals = ExtractCanonicalSignals(chunk);
        var clusters = ExtractCapabilityClusters(chunk, canonicalSignals);
        var normalized = NormalizeEvidence(chunk);

        if (canonicalSignals.Count > 0 || clusters.Count > 0)
        {
            return 1.35f;
        }

        if (normalized.Contains("team player", StringComparison.OrdinalIgnoreCase)
            || normalized.Contains("fast paced", StringComparison.OrdinalIgnoreCase)
            || normalized.Contains("collaborative", StringComparison.OrdinalIgnoreCase))
        {
            return 0.55f;
        }

        return 1f;
    }

    private async Task<List<MatchEvidence>> MatchDescriptionAsync(string jdDescription, ParsedResume resume, EmbeddingRuntime embeddingRuntime)
    {
        var candidates = BuildDescriptionCandidates(resume);
        if (string.IsNullOrWhiteSpace(jdDescription) || candidates.Count == 0) return [];

        var candidateProfiles = BuildCandidateProfiles(candidates);
        var chunks = SplitDescriptionIntoChunks(jdDescription);
        if (chunks.Count == 0)
        {
            return [];
        }

        var tasks = chunks.Select(chunk => BuildDescriptionChunkEvidenceAsync(chunk, candidates, candidateProfiles, embeddingRuntime));
        var matches = await Task.WhenAll(tasks);
        return matches.ToList();
    }

    private async Task<MatchEvidence> BuildResponsibilityEvidenceAsync(
        ResponsibilityInput responsibility,
        List<(string Text, string Source)> candidates,
        List<CandidateEvidenceProfile> candidateProfiles,
        EmbeddingRuntime embeddingRuntime)
    {
        var concepts = ExtractResponsibilityConcepts(responsibility.Cleaned);
        var conceptMatches = new List<(ResponsibilityConcept Concept, MatchEvidence Evidence)>();

        foreach (var concept in concepts)
        {
            var conceptEvidence = TryBuildRelatedClusterEvidence(concept.Text, CanonicalizeSkill(concept.Text), candidateProfiles, concept.Text);
            if (conceptEvidence is null)
            {
                conceptEvidence = await BuildManyToManySemanticEvidenceAsync(concept.Text, candidates, embeddingRuntime, concept.Text);
                conceptEvidence.Similarity = CalibrateSemanticSimilarity(
                    conceptEvidence.Similarity,
                    _config.ResponsibilitySemanticThreshold,
                    _config.ResponsibilitySemanticFloor,
                    _config.ResponsibilitySemanticCeiling,
                    conceptEvidence.Source);
            }

            conceptMatches.Add((concept, conceptEvidence));
        }

        var sentenceSemantic = await BuildManyToManySemanticEvidenceAsync(responsibility.Original, candidates, embeddingRuntime, responsibility.Cleaned);
        sentenceSemantic.Similarity = CalibrateSemanticSimilarity(
            sentenceSemantic.Similarity,
            _config.ResponsibilitySemanticThreshold,
            _config.ResponsibilitySemanticFloor,
            _config.ResponsibilitySemanticCeiling,
            sentenceSemantic.Source);

        if (conceptMatches.Count == 0)
        {
            sentenceSemantic.MatchReason = string.IsNullOrWhiteSpace(sentenceSemantic.MatchReason)
                ? "Matched through sentence-level semantic responsibility evidence."
                : sentenceSemantic.MatchReason;
            return sentenceSemantic;
        }

        var totalWeight = conceptMatches.Sum(x => x.Concept.Weight);
        var weightedCoverage = totalWeight <= 0f
            ? 0f
            : conceptMatches.Sum(x => x.Evidence.Similarity * x.Concept.Weight) / totalWeight;
        var coveredConcepts = conceptMatches.Count(x => x.Evidence.Similarity >= _config.ResponsibilityRelevantThreshold);
        var supportBonus = Math.Min(
            conceptMatches
                .Select(x => NormalizeEvidence(x.Evidence.BestResumeEvidence))
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Skip(1)
                .Count() * _config.ResponsibilityConceptSupportUnitBonus,
            _config.ResponsibilityConceptSupportCap);
        var conceptCoverageBonus = (coveredConcepts / (float)Math.Max(1, conceptMatches.Count)) * _config.ResponsibilityConceptCoverageBonusMax;
        var coherenceBonus = Math.Min(
            conceptMatches
                .Where(x => !string.IsNullOrWhiteSpace(x.Evidence.Source))
                .GroupBy(x => x.Evidence.Source.Split('.', 2)[0], StringComparer.OrdinalIgnoreCase)
                .Select(group => group.Select(x => x.Concept.Text).Distinct(StringComparer.OrdinalIgnoreCase).Count())
                .DefaultIfEmpty(0)
                .Max() * _config.ResponsibilityCoherenceUnitBonus,
            _config.ResponsibilityCoherenceBonusCap);

        var bestConceptMatch = conceptMatches
            .OrderByDescending(x => x.Evidence.Similarity)
            .First();
        var unmatchedConcepts = conceptMatches
            .Where(x => x.Evidence.Similarity < _config.ResponsibilityRelevantThreshold)
            .Select(x => x.Concept.Text)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(2)
            .ToList();

        var finalSimilarity = Math.Clamp(
            (weightedCoverage * _config.ResponsibilityConceptCoverageWeight)
            + (sentenceSemantic.Similarity * _config.ResponsibilitySentenceSemanticWeight)
            + supportBonus
            + conceptCoverageBonus
            + coherenceBonus,
            0f,
            1f);

        var reason = $"Matched {coveredConcepts}/{conceptMatches.Count} responsibility concepts using combined evidence";
        if (unmatchedConcepts.Count > 0)
        {
            reason += $"; uncovered concepts: {string.Join(", ", unmatchedConcepts)}";
        }

        if (!string.IsNullOrWhiteSpace(sentenceSemantic.BestResumeEvidence))
        {
            reason += $"; semantic support from '{sentenceSemantic.BestResumeEvidence}'";
        }

        var responsibilityMatch = new MatchEvidence
        {
            JdItem = responsibility.Original,
            BestResumeEvidence = bestConceptMatch.Evidence.BestResumeEvidence,
            Source = bestConceptMatch.Evidence.Source,
            EvidenceSourcePath = bestConceptMatch.Evidence.EvidenceSourcePath,
            Similarity = finalSimilarity,
            MatchType = bestConceptMatch.Evidence.MatchType,
            MatchReason = reason
        };
        var responsibilitySupports = conceptMatches
            .Where(x => x.Evidence.Similarity >= _config.ResponsibilityRelevantThreshold)
            .Select(x => new SupportingEvidence(
                x.Evidence.BestResumeEvidence,
                x.Evidence.Source,
                GetEvidenceType(x.Evidence.Source),
                GetEvidenceContextKey(x.Evidence.Source),
                x.Evidence.BaseMatchScore > 0f ? x.Evidence.BaseMatchScore : x.Evidence.Similarity,
                NormalizeEvidence(x.Concept.Text)))
            .Where(x => !string.IsNullOrWhiteSpace(x.Text))
            .ToList();
        if (sentenceSemantic.Similarity >= _config.ResponsibilityRelevantThreshold && !string.IsNullOrWhiteSpace(sentenceSemantic.BestResumeEvidence))
        {
            responsibilitySupports.Add(new SupportingEvidence(
                sentenceSemantic.BestResumeEvidence,
                sentenceSemantic.Source,
                GetEvidenceType(sentenceSemantic.Source),
                GetEvidenceContextKey(sentenceSemantic.Source),
                sentenceSemantic.BaseMatchScore > 0f ? sentenceSemantic.BaseMatchScore : sentenceSemantic.Similarity,
                NormalizeEvidence(responsibility.Cleaned)));
        }
        if (!string.IsNullOrWhiteSpace(bestConceptMatch.Evidence.BestResumeEvidence))
        {
            responsibilitySupports.Add(new SupportingEvidence(
                bestConceptMatch.Evidence.BestResumeEvidence,
                bestConceptMatch.Evidence.Source,
                GetEvidenceType(bestConceptMatch.Evidence.Source),
                GetEvidenceContextKey(bestConceptMatch.Evidence.Source),
                bestConceptMatch.Evidence.BaseMatchScore > 0f ? bestConceptMatch.Evidence.BaseMatchScore : bestConceptMatch.Evidence.Similarity,
                NormalizeEvidence(bestConceptMatch.Concept.Text)));
        }

        return ApplyEvidenceDepth(responsibilityMatch, responsibilitySupports, 1.12f);
    }

    private async Task<MatchEvidence> BuildDescriptionChunkEvidenceAsync(
        string chunk,
        List<(string Text, string Source)> candidates,
        List<CandidateEvidenceProfile> candidateProfiles,
        EmbeddingRuntime embeddingRuntime)
    {
        var capabilityEvidence = TryBuildRelatedClusterEvidence(chunk, CanonicalizeSkill(chunk), candidateProfiles, chunk);
        var semanticEvidence = await BuildManyToManySemanticEvidenceAsync(chunk, candidates, embeddingRuntime, chunk);
        semanticEvidence.Similarity = CalibrateSemanticSimilarity(
            semanticEvidence.Similarity,
            _config.DescriptionSemanticThreshold,
            _config.DescriptionSemanticFloor,
            _config.DescriptionSemanticCeiling,
            semanticEvidence.Source);

        var chosen = capabilityEvidence is not null && capabilityEvidence.Similarity >= semanticEvidence.Similarity - 0.02f
            ? capabilityEvidence
            : semanticEvidence;

        if (chosen.Source.Equals("summary", StringComparison.OrdinalIgnoreCase))
        {
            var corroboratingCandidates = candidates
                .Where(x => !x.Source.Equals("summary", StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (corroboratingCandidates.Count > 0)
            {
                var corroboratingEvidence = await BuildManyToManySemanticEvidenceAsync(chunk, corroboratingCandidates, embeddingRuntime, chunk);
                if (corroboratingEvidence.Similarity < _config.DescriptionCorroborationThreshold)
                {
                    chosen.Similarity *= _config.SummaryOnlyDescriptionPenaltyScale;
                    chosen.MatchReason = string.IsNullOrWhiteSpace(chosen.MatchReason)
                        ? "Summary-only description evidence was discounted due to weak corroboration."
                        : $"{chosen.MatchReason}; discounted because supporting non-summary evidence was weak.";
                }
            }
        }

        var descriptionSupports = CollectSupportingEvidence(chunk, CanonicalizeSkill(chunk), candidateProfiles, chosen.MatchType, chosen.BestResumeEvidence, chosen.Source);
        return ApplyEvidenceDepth(chosen, descriptionSupports, 1.10f);
    }

    private MatchEvidence? TryBuildRelatedClusterEvidence(
        string jdItem,
        string canonicalJdSkill,
        List<CandidateEvidenceProfile> candidates,
        string? queryOverride = null)
    {
        var queryText = queryOverride ?? jdItem;
        var canonicalSignals = ExtractCanonicalSignals(queryText);
        if (!string.IsNullOrWhiteSpace(canonicalJdSkill))
        {
            canonicalSignals.Add(canonicalJdSkill);
        }

        var queryClusters = ExtractCapabilityClusters(queryText, canonicalSignals);
        if (queryClusters.Count == 0 && canonicalSignals.Count == 0)
        {
            return null;
        }

        var scored = candidates
            .Select(candidate => ScoreRelatedClusterCandidate(canonicalSignals, queryClusters, candidate))
            .Where(x => x.Score > 0f)
            .OrderByDescending(x => x.Score)
            .ThenByDescending(x => GetSourceStrength(x.Candidate.Source))
            .ToList();

        if (scored.Count == 0)
        {
            return null;
        }

        var primary = scored[0];
        var supportBonus = ComputeSupportBonus(primary.Candidate, scored.Skip(1).ToList());
        var similarity = Math.Clamp(primary.Score + supportBonus, _config.RelatedClusterMinScore, _config.RelatedClusterMaxScore);
        var primaryCluster = primary.SharedClusters.FirstOrDefault();
        var clusterLabel = primaryCluster is not null && CapabilityClusterNames.Value.TryGetValue(primaryCluster, out var displayName)
            ? displayName
            : "related capability";

        var supportingEvidence = scored
            .Skip(1)
            .Select(x => x.Candidate.Text)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(2)
            .ToList();

        var reason = new StringBuilder();
        reason.Append($"Matched via {clusterLabel} capability cluster");
        if (primary.SharedCanonicals.Count > 0)
        {
            reason.Append($" with concept overlap: {string.Join(", ", primary.SharedCanonicals.Take(2))}");
        }
        else
        {
            reason.Append($" using adjacent evidence '{primary.Candidate.Text}'");
        }

        if (supportingEvidence.Count > 0)
        {
            reason.Append($"; combined evidence supported by {string.Join(", ", supportingEvidence)}");
        }

        var relatedMatch = new MatchEvidence
        {
            JdItem = jdItem,
            BestResumeEvidence = primary.Candidate.Text,
            Source = primary.Candidate.Source,
            EvidenceSourcePath = primary.Candidate.Source,
            Similarity = similarity,
            MatchType = "related_cluster",
            MatchReason = reason.ToString()
        };
        var relatedSupports = CollectSupportingEvidence(queryText, canonicalJdSkill, candidates, "related_cluster", primary.Candidate.Text, primary.Candidate.Source);
        return ApplyEvidenceDepth(relatedMatch, relatedSupports, 1.14f);
    }

    private MatchEvidence CombineResponsibilityEvidence(string jdItem, MatchEvidence? capabilityEvidence, MatchEvidence semanticEvidence)
    {
        if (capabilityEvidence is null)
        {
            semanticEvidence.MatchReason = string.IsNullOrWhiteSpace(semanticEvidence.MatchReason)
                ? "Matched through semantic responsibility evidence."
                : semanticEvidence.MatchReason;
            return semanticEvidence;
        }

        var semanticWeight = semanticEvidence.Similarity >= _config.ResponsibilitySemanticThreshold
            ? _config.ResponsibilitySemanticBlendWeight
            : _config.ResponsibilityWeakSemanticBlendWeight;
        var capabilityWeight = 1f - semanticWeight;

        var similarity = Math.Clamp(
            (capabilityEvidence.Similarity * capabilityWeight)
            + (semanticEvidence.Similarity * semanticWeight)
            + (semanticEvidence.Similarity >= _config.ResponsibilityRelevantThreshold ? _config.ResponsibilityConceptSupportBonus : 0f),
            0f,
            1f);

        return new MatchEvidence
        {
            JdItem = jdItem,
            BestResumeEvidence = capabilityEvidence.Similarity >= semanticEvidence.Similarity
                ? capabilityEvidence.BestResumeEvidence
                : semanticEvidence.BestResumeEvidence,
            Source = capabilityEvidence.Similarity >= semanticEvidence.Similarity
                ? capabilityEvidence.Source
                : semanticEvidence.Source,
            EvidenceSourcePath = capabilityEvidence.Similarity >= semanticEvidence.Similarity
                ? capabilityEvidence.EvidenceSourcePath
                : semanticEvidence.EvidenceSourcePath,
            Similarity = similarity,
            MatchType = capabilityEvidence.MatchType,
            MatchReason = string.IsNullOrWhiteSpace(semanticEvidence.BestResumeEvidence)
                ? capabilityEvidence.MatchReason
                : $"{capabilityEvidence.MatchReason}; sentence-level semantic corroboration from '{semanticEvidence.BestResumeEvidence}'."
        };
    }

    private async Task<MatchEvidence> BuildManyToManySemanticEvidenceAsync(string jdItem, List<(string Text, string Source)> candidates, EmbeddingRuntime embeddingRuntime, string? queryOverride = null)
    {
        if (candidates.Count == 0) return new MatchEvidence { JdItem = jdItem, Similarity = 0f, MatchType = "rule", MatchReason = "No candidate evidence available for semantic comparison." };

        var ranked = await RankSemanticMatchesAsync(queryOverride ?? jdItem, candidates, embeddingRuntime);
        var uniqueRanked = DeduplicateRankedCandidates(ranked);
        if (uniqueRanked.Count == 0) return new MatchEvidence { JdItem = jdItem, Similarity = 0f, MatchType = "rule", MatchReason = "No distinct semantic evidence remained after deduplication." };

        var topK = Math.Max(1, _config.SemanticEvidenceTopK);
        var top = uniqueRanked.Take(topK).ToList();
        var aggregateSimilarity = AggregateTopKSimilarity(top);
        var best = top[0];

        var semanticMatch = new MatchEvidence
        {
            JdItem = jdItem,
            BestResumeEvidence = best.Text,
            Source = best.Source,
            EvidenceSourcePath = best.Source,
            Similarity = aggregateSimilarity,
            MatchType = "semantic",
            MatchReason = top.Count > 1
                ? $"Semantic many-to-many evidence aggregated from {top.Count} related resume items."
                : "Semantic similarity from strongest related resume evidence."
        };
        var semanticSupports = top
            .Where(x => x.Similarity >= 0.76f)
            .Select(x => new SupportingEvidence(
                x.Text,
                x.Source,
                GetEvidenceType(x.Source),
                GetEvidenceContextKey(x.Source),
                x.Similarity,
                NormalizeEvidence(queryOverride ?? jdItem)))
            .ToList();

        return ApplyEvidenceDepth(semanticMatch, semanticSupports, 1.12f);
    }

    private float AggregateTopKSimilarity(List<SemanticCandidateScore> top)
    {
        if (top.Count == 0) return 0f;

        var decay = Math.Clamp(_config.SemanticEvidenceDecay, 0.1f, 1f);
        var weightedSum = 0f;
        var totalWeight = 0f;
        var weight = 1f;

        foreach (var item in top)
        {
            weightedSum += item.Similarity * weight;
            totalWeight += weight;
            weight *= decay;
        }

        var decayWeightedAverage = totalWeight <= 0f ? 0f : weightedSum / totalWeight;
        var strongCount = top.Count(x => x.Similarity >= _config.SemanticEvidenceStrongThreshold);
        var coverageBonus = (strongCount / (float)Math.Max(1, top.Count)) * _config.SemanticEvidenceCoverageBonusMax;

        return Math.Clamp(decayWeightedAverage + coverageBonus, 0f, 1f);
    }

    private static List<SemanticCandidateScore> DeduplicateRankedCandidates(List<SemanticCandidateScore> ranked)
    {
        var byEvidence = new Dictionary<string, SemanticCandidateScore>();

        foreach (var item in ranked)
        {
            var key = NormalizeEvidence(item.Text);
            if (string.IsNullOrWhiteSpace(key)) continue;

            if (!byEvidence.TryGetValue(key, out var existing) || item.Similarity > existing.Similarity)
            {
                byEvidence[key] = item;
            }
        }

        return byEvidence.Values.OrderByDescending(x => x.Similarity).ToList();
    }

    private async Task<List<SemanticCandidateScore>> RankSemanticMatchesAsync(string query, List<(string Text, string Source)> candidates, EmbeddingRuntime embeddingRuntime)
    {
        var queryEmbedding = await embeddingRuntime.GetEmbeddingAsync(query);
        var ranked = await Task.WhenAll(candidates.Select(async candidate =>
        {
            var candidateEmbedding = await embeddingRuntime.GetEmbeddingAsync(candidate.Text);
            var semanticSimilarity = SimilarityMath.CosineSimilarity(queryEmbedding, candidateEmbedding);
            var lexicalSimilarity = ComputeLexicalSimilarity(query, candidate.Text);
            var similarity = (semanticSimilarity * (1f - _config.SemanticLexicalBlendWeight))
                + (lexicalSimilarity * _config.SemanticLexicalBlendWeight);
            return new SemanticCandidateScore(candidate.Text, candidate.Source, similarity);
        }));

        return ranked.OrderByDescending(x => x.Similarity).ToList();
    }

    private float ComputeLexicalSimilarity(string left, string right)
    {
        var leftTokens = TokenizeForSemanticComparison(left);
        var rightTokens = TokenizeForSemanticComparison(right);
        if (leftTokens.Count == 0 || rightTokens.Count == 0)
        {
            return 0f;
        }

        var overlap = leftTokens.Intersect(rightTokens, StringComparer.OrdinalIgnoreCase).Count();
        if (overlap <= 0)
        {
            return 0f;
        }

        return overlap / (float)Math.Max(leftTokens.Count, rightTokens.Count);
    }

    private static HashSet<string> TokenizeForSemanticComparison(string value)
    {
        var normalized = NormalizeEvidence(value);
        return normalized
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(token => token.Length >= 3 && !SemanticStopWords.Contains(token))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
    }

    private static HashSet<string> ExtractCanonicalSignals(string value)
    {
        var normalized = NormalizeSkillForCanonicalization(value);
        var signals = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        if (string.IsNullOrWhiteSpace(normalized))
        {
            return signals;
        }

        if (SkillAliasMap.Value.TryGetValue(normalized, out var directCanonical))
        {
            signals.Add(directCanonical);
        }

        foreach (var (phrase, canonical) in AliasSignalPhrases.Value)
        {
            if (ContainsNormalizedPhrase(normalized, phrase))
            {
                signals.Add(canonical);
            }
        }

        return signals;
    }

    private static HashSet<string> ExtractCapabilityClusters(string value, HashSet<string>? canonicalSignals = null)
    {
        canonicalSignals ??= ExtractCanonicalSignals(value);
        var normalized = NormalizeSkillForCanonicalization(value);
        var clusters = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var canonical in canonicalSignals)
        {
            if (CapabilityClusterLookup.Value.TryGetValue(canonical, out var mappedClusters))
            {
                foreach (var cluster in mappedClusters)
                {
                    clusters.Add(cluster);
                }
            }
        }

        foreach (var entry in CapabilityClusterLookup.Value)
        {
            if (ContainsNormalizedPhrase(normalized, entry.Key))
            {
                foreach (var cluster in entry.Value)
                {
                    clusters.Add(cluster);
                }
            }
        }

        return clusters;
    }

    private static bool ContainsNormalizedPhrase(string normalizedText, string normalizedPhrase)
    {
        if (string.IsNullOrWhiteSpace(normalizedText) || string.IsNullOrWhiteSpace(normalizedPhrase))
        {
            return false;
        }

        if (normalizedText.Equals(normalizedPhrase, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return $" {normalizedText} ".Contains($" {normalizedPhrase} ", StringComparison.OrdinalIgnoreCase);
    }

    private RelatedClusterCandidateScore ScoreRelatedClusterCandidate(
        HashSet<string> queryCanonicals,
        HashSet<string> queryClusters,
        CandidateEvidenceProfile candidate)
    {
        var sharedCanonicals = candidate.CanonicalSignals
            .Intersect(queryCanonicals, StringComparer.OrdinalIgnoreCase)
            .ToList();
        var sharedClusters = candidate.CapabilityClusters
            .Intersect(queryClusters, StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (sharedCanonicals.Count == 0 && sharedClusters.Count == 0)
        {
            return new RelatedClusterCandidateScore(candidate, 0f, [], []);
        }

        var canonicalCoverage = queryCanonicals.Count == 0
            ? 0f
            : sharedCanonicals.Count / (float)queryCanonicals.Count;
        var clusterCoverage = queryClusters.Count == 0
            ? 0f
            : sharedClusters.Count / (float)queryClusters.Count;

        var baseScore = _config.RelatedClusterMinScore
            + (canonicalCoverage * _config.RelatedClusterCanonicalCoverageWeight)
            + (clusterCoverage * _config.RelatedClusterCoverageWeight)
            + (GetSourceStrength(candidate.Source) * _config.RelatedClusterSourceWeight);

        return new RelatedClusterCandidateScore(candidate, Math.Clamp(baseScore, 0f, _config.RelatedClusterMaxScore), sharedCanonicals, sharedClusters);
    }

    private float ComputeSupportBonus(CandidateEvidenceProfile primary, List<RelatedClusterCandidateScore> secondaryCandidates)
    {
        var seenEvidence = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { primary.NormalizedText };
        var seenSignals = new HashSet<string>(primary.CanonicalSignals, StringComparer.OrdinalIgnoreCase);
        var bonus = 0f;

        foreach (var candidate in secondaryCandidates)
        {
            if (seenEvidence.Contains(candidate.Candidate.NormalizedText))
            {
                continue;
            }

            var introducesNewSignal = candidate.Candidate.CanonicalSignals.Any(signal => !seenSignals.Contains(signal));
            bonus += introducesNewSignal
                ? _config.RelatedClusterSecondarySignalBonus
                : _config.RelatedClusterSecondaryClusterBonus;

            seenEvidence.Add(candidate.Candidate.NormalizedText);
            foreach (var signal in candidate.Candidate.CanonicalSignals)
            {
                seenSignals.Add(signal);
            }

            if (bonus >= _config.RelatedClusterSupportCap)
            {
                break;
            }
        }

        return Math.Min(bonus, _config.RelatedClusterSupportCap);
    }

    private MatchEvidence ApplyEvidenceDepth(
        MatchEvidence match,
        IReadOnlyCollection<SupportingEvidence> rawSupports,
        float maxMultiplier)
    {
        var distinctSupports = rawSupports
            .GroupBy(x => $"{x.ContextKey}|{x.EvidenceType}|{x.ConceptKey}", StringComparer.OrdinalIgnoreCase)
            .Select(group => group
                .OrderByDescending(x => x.SupportScore)
                .ThenByDescending(x => GetDepthSourceWeight(x.Source))
                .First())
            .OrderByDescending(x => x.SupportScore * GetDepthSourceWeight(x.Source))
            .ToList();

        var evidenceTypes = distinctSupports
            .Select(x => x.EvidenceType)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var supportContributionWeights = new[] { 0f, 0.09f, 0.055f, 0.03f, 0.01f };
        var supportBonus = 0f;
        var concreteSupportCount = distinctSupports.Count(x => IsConcreteEvidenceType(x.EvidenceType));

        for (var index = 1; index < distinctSupports.Count && concreteSupportCount > 0; index++)
        {
            var contributionWeight = supportContributionWeights[Math.Min(index, supportContributionWeights.Length - 1)];
            if (contributionWeight <= 0f)
            {
                continue;
            }

            var supportQuality = Math.Clamp(distinctSupports[index].SupportScore * GetDepthSourceWeight(distinctSupports[index].Source), 0f, 1f);
            supportBonus += contributionWeight * supportQuality;
        }

        var diversityBonus = concreteSupportCount == 0
            ? 0f
            : evidenceTypes.Count switch
        {
            >= 3 => 0.028f,
            2 => 0.015f,
            _ => 0f
        };
        var multiplierBonusCap = Math.Max(0f, maxMultiplier - 1f);
        var multiplierBonus = Math.Min(multiplierBonusCap, supportBonus + diversityBonus);
        var depthMultiplier = Math.Clamp(1f + multiplierBonus, 1f, maxMultiplier);
        var baseMatchScore = Math.Clamp(match.BaseMatchScore > 0f ? match.BaseMatchScore : match.Similarity, 0f, 1f);
        var finalConfidence = Math.Clamp(baseMatchScore * depthMultiplier, 0f, 1f);
        var strongestEvidence = distinctSupports.FirstOrDefault()?.Text ?? match.BestResumeEvidence;
        var depthReason = distinctSupports.Count <= 1
            ? "Single strong support kept at full value without extra depth bonus."
            : $"Corroborated by {distinctSupports.Count} distinct supports across {evidenceTypes.Count} evidence type(s) with diminishing returns.";

        match.BaseMatchScore = baseMatchScore;
        match.EvidenceCountTotal = rawSupports.Count;
        match.EvidenceCountDistinct = distinctSupports.Count;
        match.EvidenceTypesUsed = evidenceTypes;
        match.StrongestEvidence = strongestEvidence;
        match.SupportBonusApplied = Math.Clamp(finalConfidence - baseMatchScore, 0f, 1f);
        match.DepthMultiplier = depthMultiplier;
        match.FinalMatchConfidence = finalConfidence;
        match.Similarity = finalConfidence;
        match.MatchReason = string.IsNullOrWhiteSpace(match.MatchReason)
            ? depthReason
            : $"{match.MatchReason}; {depthReason}";
        if (string.IsNullOrWhiteSpace(match.BestResumeEvidence) && !string.IsNullOrWhiteSpace(strongestEvidence))
        {
            match.BestResumeEvidence = strongestEvidence;
        }

        return match;
    }

    private static bool IsConcreteEvidenceType(string evidenceType) => evidenceType is
        "WorkBullet" or
        "ProjectBullet" or
        "WorkTechnology" or
        "ProjectTechnology" or
        "ProjectSummary";

    private List<SupportingEvidence> CollectSupportingEvidence(
        string queryText,
        string canonicalSkill,
        IReadOnlyCollection<CandidateEvidenceProfile> candidates,
        string matchType,
        string? requiredPrimaryEvidence = null,
        string? requiredPrimarySource = null)
    {
        var normalizedQuery = NormalizeSkill(queryText);
        var queryCanonicals = ExtractCanonicalSignals(queryText);
        if (!string.IsNullOrWhiteSpace(canonicalSkill))
        {
            queryCanonicals.Add(canonicalSkill);
        }

        var queryClusters = ExtractCapabilityClusters(queryText, queryCanonicals);
        var queryTokens = TokenizeForSemanticComparison(queryText);
        var supports = new List<SupportingEvidence>();

        foreach (var candidate in candidates)
        {
            var supportScore = ComputeSupportEvidenceScore(normalizedQuery, queryCanonicals, queryClusters, queryTokens, candidate);
            var minimumSupportThreshold = matchType switch
            {
                "exact" or "alias" => 0.68f,
                "related_cluster" => 0.72f,
                _ => 0.78f
            };

            if (supportScore < minimumSupportThreshold)
            {
                continue;
            }

            supports.Add(new SupportingEvidence(
                candidate.Text,
                candidate.Source,
                GetEvidenceType(candidate.Source),
                GetEvidenceContextKey(candidate.Source),
                supportScore,
                !string.IsNullOrWhiteSpace(canonicalSkill) ? canonicalSkill : NormalizeEvidence(queryText)));
        }

        if (!string.IsNullOrWhiteSpace(requiredPrimaryEvidence))
        {
            var primary = supports.FirstOrDefault(x =>
                x.Text.Equals(requiredPrimaryEvidence, StringComparison.OrdinalIgnoreCase)
                && (string.IsNullOrWhiteSpace(requiredPrimarySource) || x.Source.Equals(requiredPrimarySource, StringComparison.OrdinalIgnoreCase)));

            if (primary is null)
            {
                supports.Add(new SupportingEvidence(
                    requiredPrimaryEvidence,
                    requiredPrimarySource ?? string.Empty,
                    GetEvidenceType(requiredPrimarySource ?? string.Empty),
                    GetEvidenceContextKey(requiredPrimarySource ?? string.Empty),
                    1f,
                    !string.IsNullOrWhiteSpace(canonicalSkill) ? canonicalSkill : NormalizeEvidence(queryText)));
            }
        }

        return supports;
    }

    private float ComputeSupportEvidenceScore(
        string normalizedQuery,
        HashSet<string> queryCanonicals,
        HashSet<string> queryClusters,
        HashSet<string> queryTokens,
        CandidateEvidenceProfile candidate)
    {
        if (!string.IsNullOrWhiteSpace(normalizedQuery) && normalizedQuery.Equals(candidate.NormalizedSkillKey, StringComparison.OrdinalIgnoreCase))
        {
            return 1f;
        }

        var canonicalOverlap = queryCanonicals.Count == 0
            ? 0f
            : candidate.CanonicalSignals.Intersect(queryCanonicals, StringComparer.OrdinalIgnoreCase).Count() / (float)queryCanonicals.Count;
        var clusterOverlap = queryClusters.Count == 0
            ? 0f
            : candidate.CapabilityClusters.Intersect(queryClusters, StringComparer.OrdinalIgnoreCase).Count() / (float)queryClusters.Count;
        var lexicalOverlap = queryTokens.Count == 0
            ? 0f
            : candidate.Tokens.Intersect(queryTokens, StringComparer.OrdinalIgnoreCase).Count() / (float)queryTokens.Count;

        if (canonicalOverlap > 0f)
        {
            return Math.Clamp(0.86f + (canonicalOverlap * 0.12f), 0f, 1f);
        }

        if (clusterOverlap > 0f)
        {
            return Math.Clamp(0.72f + (clusterOverlap * 0.10f) + (lexicalOverlap * 0.06f), 0f, 0.9f);
        }

        if (lexicalOverlap >= 0.55f)
        {
            return Math.Clamp(0.58f + (lexicalOverlap * 0.14f), 0f, 0.78f);
        }

        return 0f;
    }

    private static string GetEvidenceType(string source) => GetSourceCategory(source) switch
    {
        "work_experience.bullets" => "WorkBullet",
        "work_experience.description" => "WorkSummary",
        "work_experience.technologies" => "WorkTechnology",
        "projects.bullets" => "ProjectBullet",
        "projects.description" => "ProjectSummary",
        "projects.technologies" => "ProjectTechnology",
        "skills" => "SkillList",
        "summary" => "Summary",
        "certifications" => "Certification",
        _ => "Other"
    };

    private static float GetDirectSkillMatchBaseScore(string source, string matchType)
    {
        var sourceCategory = GetSourceCategory(source);
        var sourceBase = sourceCategory switch
        {
            "work_experience.technologies" => 0.96f,
            "projects.technologies" => 0.94f,
            "work_experience.bullets" => 0.93f,
            "projects.bullets" => 0.91f,
            "skills" => 0.88f,
            "certifications" => 0.86f,
            _ => 0.89f
        };

        return matchType == "alias"
            ? Math.Max(0.82f, sourceBase - 0.05f)
            : sourceBase;
    }

    private static string GetEvidenceContextKey(string source)
    {
        if (string.IsNullOrWhiteSpace(source))
        {
            return "unknown";
        }

        var dotIndex = source.IndexOf('.');
        return dotIndex >= 0 ? source[..dotIndex] : source;
    }

    private static string GetSourceCategory(string source)
    {
        if (string.IsNullOrWhiteSpace(source))
        {
            return string.Empty;
        }

        if (source.StartsWith("skills", StringComparison.OrdinalIgnoreCase)) return "skills";
        if (source.StartsWith("summary", StringComparison.OrdinalIgnoreCase)) return "summary";
        if (source.StartsWith("certifications", StringComparison.OrdinalIgnoreCase)) return "certifications";
        if (source.StartsWith("work_experience", StringComparison.OrdinalIgnoreCase))
        {
            if (source.Contains(".bullets", StringComparison.OrdinalIgnoreCase)) return "work_experience.bullets";
            if (source.Contains(".description", StringComparison.OrdinalIgnoreCase)) return "work_experience.description";
            if (source.Contains(".technologies", StringComparison.OrdinalIgnoreCase)) return "work_experience.technologies";
            return "work_experience";
        }

        if (source.StartsWith("projects", StringComparison.OrdinalIgnoreCase))
        {
            if (source.Contains(".bullets", StringComparison.OrdinalIgnoreCase)) return "projects.bullets";
            if (source.Contains(".description", StringComparison.OrdinalIgnoreCase)) return "projects.description";
            if (source.Contains(".technologies", StringComparison.OrdinalIgnoreCase)) return "projects.technologies";
            return "projects";
        }

        return source;
    }

    private static float GetDepthSourceWeight(string source) => GetSourceCategory(source) switch
    {
        "work_experience.bullets" => 1f,
        "projects.bullets" => 0.94f,
        "work_experience.description" => 0.86f,
        "work_experience.technologies" => 0.82f,
        "projects.description" => 0.80f,
        "projects.technologies" => 0.76f,
        "summary" => 0.62f,
        "skills" => 0.50f,
        "certifications" => 0.55f,
        _ => 0.55f
    };

    private static float GetSourceStrength(string source) => source switch
    {
        var s when GetSourceCategory(s) == "work_experience.technologies" => 1f,
        var s when GetSourceCategory(s) == "skills" => 0.82f,
        var s when GetSourceCategory(s) == "projects.technologies" => 0.92f,
        var s when GetSourceCategory(s) == "work_experience.description" => 0.88f,
        var s when GetSourceCategory(s) == "projects.description" => 0.86f,
        var s when GetSourceCategory(s) == "work_experience.bullets" => 0.84f,
        var s when GetSourceCategory(s) == "projects.bullets" => 0.82f,
        var s when GetSourceCategory(s) == "certifications" => 0.76f,
        _ => 0.75f
    };

    private static string NormalizeSkill(string skill) => skill.Trim().ToLowerInvariant().Replace(".", string.Empty).Replace(" ", string.Empty);

    private static string CanonicalizeSkill(string value)
    {
        var normalized = NormalizeSkillForCanonicalization(value);
        if (string.IsNullOrWhiteSpace(normalized)) return string.Empty;

        if (SkillAliasMap.Value.TryGetValue(normalized, out var canonical))
        {
            return canonical;
        }

        return normalized;
    }

    private static string NormalizeSkillForCanonicalization(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return string.Empty;

        var normalized = value.Trim().ToLowerInvariant();
        normalized = normalized.Replace("&", " and ");
        normalized = normalized.Replace("/", " ");
        normalized = normalized.Replace("_", " ");
        normalized = normalized.Replace("-", " ");
        normalized = normalized.Replace("+", " ");
        normalized = normalized.Replace(".", " ");
        normalized = Regex.Replace(normalized, @"[^a-z0-9\s]", " ");
        normalized = Regex.Replace(normalized, @"\brestful\s+apis?\b", " rest api ");
        normalized = Regex.Replace(normalized, @"\bweb\s+apis?\b", " web api ");
        normalized = Regex.Replace(normalized, @"\bhttp\s+apis?\b", " http api ");
        normalized = Regex.Replace(normalized, @"\bapis\b", " api ");
        normalized = Regex.Replace(normalized, @"\bdatabases\b", " database ");
        normalized = Regex.Replace(normalized, @"\bservices\b", " service ");
        normalized = Regex.Replace(normalized, @"\b(api\s+development|development|experience\s+with|knowledge\s+of)\b", " ");
        normalized = VersionSuffixRegex.Replace(normalized, " ");

        return string.Join(' ', normalized.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
    }

    private static Dictionary<string, string> LoadSkillAliasMap()
    {
        var map = BuildBaseSkillAliasMap();

        foreach (var file in ResolveSkillAliasFiles())
        {
            try
            {
                using var doc = JsonDocument.Parse(File.ReadAllText(file));
                if (!doc.RootElement.TryGetProperty("skills", out var skills) || skills.ValueKind != JsonValueKind.Object) continue;

                foreach (var entry in skills.EnumerateObject())
                {
                    var canonical = NormalizeSkillForCanonicalization(entry.Name);
                    if (string.IsNullOrWhiteSpace(canonical)) continue;

                    map[canonical] = canonical;
                    if (entry.Value.TryGetProperty("aliases", out var aliases) && aliases.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var alias in aliases.EnumerateArray())
                        {
                            var aliasValue = NormalizeSkillForCanonicalization(alias.GetString() ?? string.Empty);
                            if (!string.IsNullOrWhiteSpace(aliasValue)) map[aliasValue] = canonical;
                        }
                    }
                }
            }
            catch
            {
                // Ignore malformed alias file and keep base map.
            }
        }

        return map;
    }

    private static List<(string Phrase, string Canonical)> BuildAliasSignalPhrases()
        => SkillAliasMap.Value
            .Select(x => (Phrase: x.Key, Canonical: x.Value))
            .Where(x => !string.IsNullOrWhiteSpace(x.Phrase) && x.Phrase.Length >= 3)
            .Distinct()
            .OrderByDescending(x => x.Phrase.Length)
            .ToList();

    private static IEnumerable<string> ResolveSkillAliasFiles()
    {
        var cwd = Directory.GetCurrentDirectory();
        var candidates = new[]
        {
            Path.Combine(cwd, "skill_aliases.json"),
            Path.Combine(cwd, "server", "SkillSense.Api", "skill_aliases.json"),
            Path.Combine(AppContext.BaseDirectory, "skill_aliases.json")
        };

        return candidates.Where(File.Exists).Distinct(StringComparer.OrdinalIgnoreCase);
    }

    private static Dictionary<string, string> BuildBaseSkillAliasMap()
    {
        var pairs = new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["c sharp"] = "c sharp",
            ["dotnet"] = "dotnet",
            ["net"] = "dotnet",
            ["net core"] = "dotnet",
            ["net framework"] = "dotnet",
            ["dot net"] = "dotnet",
            ["asp net core"] = "asp net core",
            ["aspnet core"] = "asp net core",
            ["asp net"] = "asp net core",
            ["aspnet"] = "asp net core",
            ["rest api"] = "rest api",
            ["restful api"] = "rest api",
            ["web api"] = "rest api",
            ["http api"] = "rest api",
            ["backend api"] = "rest api",
            ["api integration"] = "rest api",
            ["api design"] = "rest api",
            ["javascript"] = "javascript",
            ["js"] = "javascript",
            ["typescript"] = "typescript",
            ["ts"] = "typescript",
            ["postgresql"] = "postgresql",
            ["postgres"] = "postgresql",
            ["sql server"] = "sql server",
            ["mssql"] = "sql server",
            ["ms sql"] = "sql server",
            ["mysql"] = "mysql",
            ["mariadb"] = "mariadb",
            ["sqlite"] = "sqlite",
            ["oracle sql"] = "oracle sql",
            ["relational database"] = "relational database",
            ["jwt authentication"] = "jwt",
            ["jwt auth"] = "jwt",
            ["json web token"] = "jwt",
            ["role based access control"] = "rbac",
            ["rbac"] = "rbac",
            ["claims based auth"] = "claims based auth",
            ["bearer token auth"] = "bearer token auth",
            ["authentication"] = "authentication",
            ["authorization"] = "authorization",
            ["backend services"] = "backend services",
            ["backend service"] = "backend services",
            ["query optimization"] = "query optimization",
            ["performance tuning"] = "performance tuning",
            ["async processing"] = "async processing",
            ["asynchronous programming"] = "asynchronous programming",
            ["caching"] = "caching",
            ["response time optimization"] = "response time optimization",
            ["github actions"] = "github actions",
            ["azure devops"] = "azure devops",
            ["deployment pipelines"] = "deployment pipelines",
            ["ci cd"] = "ci cd",
            ["git"] = "git",
            ["github"] = "github"
        };

        var normalized = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var pair in pairs)
        {
            var key = NormalizeSkillForCanonicalization(pair.Key);
            var value = NormalizeSkillForCanonicalization(pair.Value);
            if (string.IsNullOrWhiteSpace(key) || string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            normalized[key] = value;
        }

        return normalized;
    }

    private static Dictionary<string, string[]> BuildCapabilityClusterLookup()
    {
        var map = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        void Add(string term, params string[] clusters) => map[NormalizeSkillForCanonicalization(term)] = clusters;

        foreach (var term in new[] { "sql server", "postgresql", "mysql", "mariadb", "oracle sql", "sqlite", "relational database", "database design", "sql" })
        {
            Add(term, "database_relational");
        }

        foreach (var term in new[] { "rest api", "http api", "web api", "api integration", "api design", "backend services", "backend service" })
        {
            Add(term, "api_backend");
        }

        foreach (var term in new[] { "jwt", "bearer token auth", "rbac", "role based access control", "claims based auth", "authentication", "authorization", "identity", "auth middleware" })
        {
            Add(term, "auth_security");
        }

        foreach (var term in new[] { "react", "angular", "vue js", "typescript", "javascript" })
        {
            Add(term, "frontend_web");
        }

        foreach (var term in new[] { "query optimization", "performance tuning", "async processing", "asynchronous programming", "caching", "response time optimization" })
        {
            Add(term, "performance_backend");
        }

        foreach (var term in new[] { "git", "github", "ci cd", "deployment pipelines", "azure devops", "github actions" })
        {
            Add(term, "devops_versioning");
        }

        return map;
    }

    private static Dictionary<string, string> BuildCapabilityClusterNames()
        => new(StringComparer.OrdinalIgnoreCase)
        {
            ["database_relational"] = "relational database",
            ["api_backend"] = "backend API",
            ["auth_security"] = "authentication and authorization",
            ["frontend_web"] = "frontend web",
            ["performance_backend"] = "backend performance",
            ["devops_versioning"] = "versioning and delivery"
        };

    private static bool IsHigherQualityEvidence(CandidateEvidenceProfile candidate, CandidateEvidenceProfile existing)
        => GetSourceStrength(candidate.Source) > GetSourceStrength(existing.Source);

    private static string NormalizeEvidence(string text)
    {
        var chars = text.Trim().ToLowerInvariant().ToCharArray();
        var sb = new StringBuilder(chars.Length);

        foreach (var c in chars)
        {
            if (char.IsLetterOrDigit(c) || char.IsWhiteSpace(c))
            {
                sb.Append(c);
            }
        }

        return string.Join(' ', sb.ToString().Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
    }

    private static float ScoreEducation(string required, ParsedResume resume)
    {
        if (string.IsNullOrWhiteSpace(required)) return 1f;
        var requiredRank = EducationRank(required);
        var best = resume.Education.Select(e => EducationRank($"{e.EducationLevel} {e.Degree}")).DefaultIfEmpty(0).Max();
        return best >= requiredRank ? 1f : 0f;
    }

    private static int EducationRank(string value)
    {
        var v = value.ToLowerInvariant();
        if (v.Contains("doctor") || v.Contains("phd")) return 4;
        if (v.Contains("master")) return 3;
        if (v.Contains("bachelor")) return 2;
        if (v.Contains("associate") || v.Contains("diploma")) return 1;
        return 0;
    }

    private float ScoreYears(int minYears, ParsedResume resume)
    {
        if (minYears <= 0) return 1f;
        var years = GetCandidateYears(resume);
        if (years >= minYears) return 1f;

        var ratio = Math.Clamp(years / minYears, 0f, 1f);
        if (ratio <= 0f)
        {
            return _config.YearsExperienceZeroExperienceFloor;
        }

        var softened = _config.YearsExperiencePartialFloor
            + ((1f - _config.YearsExperiencePartialFloor) * MathF.Pow(ratio, _config.YearsExperienceCurveExponent));

        if (years + _config.YearsNearMissBufferYears >= minYears)
        {
            softened = Math.Max(softened, _config.YearsNearMissFloor);
        }

        return Math.Clamp(softened, 0f, 1f);
    }

    private static float GetCandidateYears(ParsedResume resume)
    {
        var months = resume.Derived.TotalExperienceMonths > 0
            ? resume.Derived.TotalExperienceMonths
            : resume.WorkExperience.Sum(w => Math.Max(0, w.DurationMonths));
        return months / 12f;
    }

    private float CalibrateSemanticSimilarity(
        float rawSimilarity,
        float threshold,
        float floor,
        float ceiling,
        string? source = null)
    {
        if (rawSimilarity <= 0f)
        {
            return 0f;
        }

        if (rawSimilarity < threshold)
        {
            return Math.Clamp(rawSimilarity * _config.SubThresholdSemanticScale, 0f, ceiling);
        }

        var normalized = (rawSimilarity - threshold) / Math.Max(0.001f, 1f - threshold);
        var calibrated = floor + ((ceiling - floor) * MathF.Pow(Math.Clamp(normalized, 0f, 1f), _config.SemanticCalibrationExponent));

        if (!string.IsNullOrWhiteSpace(source))
        {
            if (source.StartsWith("work_experience", StringComparison.OrdinalIgnoreCase))
            {
                calibrated += _config.WorkExperienceEvidenceBonus;
            }
            else if (source.StartsWith("projects", StringComparison.OrdinalIgnoreCase))
            {
                calibrated += _config.ProjectEvidenceBonus;
            }
        }

        return Math.Clamp(calibrated, 0f, 1f);
    }

    private sealed record SemanticCandidateScore(string Text, string Source, float Similarity);
    private sealed record ResponsibilityInput(string Original, string Cleaned);
    private sealed record ResponsibilityConcept(string Text, float Weight);
    private sealed record CandidateEvidenceProfile(
        string Text,
        string Source,
        string NormalizedText,
        string NormalizedSkillKey,
        HashSet<string> CanonicalSignals,
        HashSet<string> CapabilityClusters,
        HashSet<string> Tokens);
    private sealed record RelatedClusterCandidateScore(
        CandidateEvidenceProfile Candidate,
        float Score,
        List<string> SharedCanonicals,
        List<string> SharedClusters);
    private sealed record SupportingEvidence(
        string Text,
        string Source,
        string EvidenceType,
        string ContextKey,
        float SupportScore,
        string ConceptKey);
    private sealed record EvidenceDepthResult(
        int TotalEvidenceCount,
        int DistinctEvidenceCount,
        List<string> EvidenceTypesUsed,
        string StrongestEvidence,
        float SupportBonusApplied,
        float DepthMultiplier,
        string Reason);
    private sealed record ImplementationEvidenceBreakdown(
        float OverallScore,
        float WorkScore,
        float ProjectScore,
        float SupportScore,
        float WorkWeight,
        float ProjectWeight,
        float SupportWeight,
        float JuniorProjectFactor,
        int WorkMatchCount,
        int ProjectMatchCount,
        int SupportingMatchCount);
    private sealed record PenaltyBreakdown(
        float TotalPenalty,
        float EducationPenalty,
        float BaseYearsPenalty,
        float ReliefApplied);
    private sealed record SkillCandidateIndex(
        Dictionary<string, CandidateEvidenceProfile> Exact,
        Dictionary<string, CandidateEvidenceProfile> Canonical);

    private sealed class EmbeddingRuntime(ITextEmbeddingService embeddingService, CancellationToken cancellationToken) : IDisposable
    {
        private readonly ConcurrentDictionary<string, Lazy<Task<IReadOnlyList<float>>>> _cache = new(StringComparer.Ordinal);
        private readonly SemaphoreSlim _gate = new(Math.Max(1, Environment.ProcessorCount / 2));

        public Task<IReadOnlyList<float>> GetEmbeddingAsync(string text)
        {
            var key = text ?? string.Empty;
            var lazy = _cache.GetOrAdd(
                key,
                static (cacheKey, state) => new Lazy<Task<IReadOnlyList<float>>>(
                    () => state.RunEmbeddingAsync(cacheKey),
                    LazyThreadSafetyMode.ExecutionAndPublication),
                this);

            return lazy.Value;
        }

        private async Task<IReadOnlyList<float>> RunEmbeddingAsync(string text)
        {
            await _gate.WaitAsync(cancellationToken);
            try
            {
                return await embeddingService.EmbedAsync(text, cancellationToken);
            }
            finally
            {
                _gate.Release();
            }
        }

        public void Dispose() => _gate.Dispose();
    }

    private sealed record AtsScoringConfig
    {
        public float WorkExperienceWeight { get; init; } = 0.18f;
        public float SkillsWeight { get; init; } = 0.41f;
        public float ResponsibilitiesWeight { get; init; } = 0.23f;
        public float SummaryWeight { get; init; } = 0.07f;
        public float EducationWeight { get; init; } = 0.03f;
        public float YearsExperienceWeight { get; init; } = 0.07f;
        public float SkillsScoreCeiling { get; init; } = 0.90f;
        public float ResponsibilitiesScoreCeiling { get; init; } = 0.85f;
        public float DescriptionScoreCeiling { get; init; } = 0.82f;
        public float WorkScoreCeiling { get; init; } = 0.87f;

        public float RequiredSkillsBlend { get; init; } = 0.90f;
        public float PreferredSkillsBlend { get; init; } = 0.10f;
        public float WorkScoreResponsibilityBlend { get; init; } = 0.52f;
        public float WorkScoreSummaryBlend { get; init; } = 0.04f;
        public float WorkScoreRequiredSkillsBlend { get; init; } = 0.43f;
        public float WorkScoreImplementationBlend { get; init; } = 0.36f;

        public float ImplementationEvidenceWorkWeight { get; init; } = 0.50f;
        public float ImplementationEvidenceProjectWeight { get; init; } = 0.24f;
        public float JuniorProjectEvidenceWeightBoost { get; init; } = 0.16f;
        public float JuniorProjectEvidenceWorkShift { get; init; } = 0.10f;
        public float JuniorProjectEvidenceYearsThreshold { get; init; } = 2.5f;
        public float ExperiencedProjectEvidenceYearsThreshold { get; init; } = 5f;
        public int ImplementationEvidenceTopWindow { get; init; } = 4;
        public float ImplementationEvidenceSimilarityWeight { get; init; } = 0.62f;
        public float ImplementationEvidenceMatchTypeWeight { get; init; } = 0.24f;
        public float ImplementationEvidenceSourceWeight { get; init; } = 0.14f;
        public float ImplementationEvidenceQualityWeight { get; init; } = 0.72f;
        public float ImplementationEvidenceCoverageWeight { get; init; } = 0.18f;
        public float ImplementationEvidenceDiversityUnitBonus { get; init; } = 0.025f;
        public float ImplementationEvidenceDiversityCap { get; init; } = 0.08f;
        public float ImplementationEvidenceCorroborationUnitBonus { get; init; } = 0.02f;
        public float ImplementationEvidenceCorroborationCap { get; init; } = 0.05f;
        public float ImplementationStrongThreshold { get; init; } = 0.80f;
        public float ImplementationEvidenceMinimumSemantic { get; init; } = 0.68f;

        public float SemanticSkillThreshold { get; init; } = 0.68f;
        public float SemanticSkillFloor { get; init; } = 0.72f;
        public float SemanticSkillCeiling { get; init; } = 0.96f;
        public int SemanticEvidenceTopK { get; init; } = 3;
        public float SemanticEvidenceDecay { get; init; } = 0.75f;
        public float SemanticEvidenceStrongThreshold { get; init; } = 0.78f;
        public float SemanticEvidenceCoverageBonusMax { get; init; } = 0.04f;
        public float SemanticLexicalBlendWeight { get; init; } = 0.30f;
        public float RequiredSkillMissingFloor { get; init; } = 0.24f;
        public float RequiredSkillsNeutralScore { get; init; } = 0.36f;
        public float PreferredSkillsNeutralScore { get; init; } = 0.48f;
        public float RequiredSkillStrongThreshold { get; init; } = 0.90f;
        public float PreferredSkillStrongThreshold { get; init; } = 0.86f;
        public float RequiredSkillCoverageWeight { get; init; } = 0.36f;
        public float PreferredSkillCoverageWeight { get; init; } = 0.28f;
        public float RequiredSkillStrongMatchBonusMax { get; init; } = 0.08f;
        public float PreferredSkillStrongMatchBonusMax { get; init; } = 0.09f;
        public float SkillEvidenceConfidenceWeight { get; init; } = 0.16f;
        public float SkillSimilarityWeight { get; init; } = 0.68f;
        public float SkillEvidenceConfidenceSignalWeight { get; init; } = 0.20f;
        public float SkillMatchTypeSignalWeight { get; init; } = 0.12f;
        public float ExactMatchScoreBonusMax { get; init; } = 0.04f;
        public float AliasMatchScoreBonusMax { get; init; } = 0.02f;
        public float ExactMatchConfidence { get; init; } = 1f;
        public float AliasMatchConfidence { get; init; } = 0.96f;
        public float RelatedClusterMatchConfidence { get; init; } = 0.88f;
        public float RelatedClusterMinScore { get; init; } = 0.68f;
        public float RelatedClusterMaxScore { get; init; } = 0.82f;
        public float RelatedClusterCanonicalCoverageWeight { get; init; } = 0.10f;
        public float RelatedClusterCoverageWeight { get; init; } = 0.06f;
        public float RelatedClusterSourceWeight { get; init; } = 0.04f;
        public float RelatedClusterSecondarySignalBonus { get; init; } = 0.03f;
        public float RelatedClusterSecondaryClusterBonus { get; init; } = 0.015f;
        public float RelatedClusterSupportCap { get; init; } = 0.06f;
        public float SemanticMatchConfidenceFloor { get; init; } = 0.72f;
        public float ConfidenceWorkEvidenceBonus { get; init; } = 0.03f;
        public float ConfidenceProjectEvidenceBonus { get; init; } = 0.015f;
        public float ResponsibilitySemanticThreshold { get; init; } = 0.58f;
        public float ResponsibilitySemanticFloor { get; init; } = 0.64f;
        public float ResponsibilitySemanticCeiling { get; init; } = 0.93f;
        public float DescriptionSemanticThreshold { get; init; } = 0.60f;
        public float DescriptionSemanticFloor { get; init; } = 0.66f;
        public float DescriptionSemanticCeiling { get; init; } = 0.90f;
        public float DescriptionCorroborationThreshold { get; init; } = 0.58f;
        public float SummaryOnlyDescriptionPenaltyScale { get; init; } = 0.65f;
        public float DescriptionRelevantChunkThreshold { get; init; } = 0.60f;
        public float DescriptionStrongChunkThreshold { get; init; } = 0.78f;
        public float DescriptionQualityWeight { get; init; } = 0.58f;
        public float DescriptionCoverageWeight { get; init; } = 0.30f;
        public float DescriptionStrongChunkBonusWeight { get; init; } = 0.12f;
        public float ResponsibilityRelevantThreshold { get; init; } = 0.62f;
        public float ResponsibilityStrongThreshold { get; init; } = 0.78f;
        public float ResponsibilityQualityWeight { get; init; } = 0.42f;
        public float ResponsibilityCoverageWeight { get; init; } = 0.34f;
        public float ResponsibilityMomentumWeight { get; init; } = 0.14f;
        public float ResponsibilityMomentumCoverageRatio { get; init; } = 0.65f;
        public float ResponsibilityQualityWindowRatio { get; init; } = 0.80f;
        public float ResponsibilityCoverageFloor { get; init; } = 0.48f;
        public float ResponsibilityEvidenceRetentionFloor { get; init; } = 0.98f;
        public float ResponsibilityRelevantMatchBonusMax { get; init; } = 0.04f;
        public float ResponsibilityStrongMatchBonusMax { get; init; } = 0.06f;
        public float ResponsibilitySemanticBlendWeight { get; init; } = 0.32f;
        public float ResponsibilityWeakSemanticBlendWeight { get; init; } = 0.18f;
        public float ResponsibilityConceptSupportBonus { get; init; } = 0.03f;
        public float ResponsibilityConceptCoverageWeight { get; init; } = 0.64f;
        public float ResponsibilitySentenceSemanticWeight { get; init; } = 0.18f;
        public float ResponsibilityConceptSupportUnitBonus { get; init; } = 0.02f;
        public float ResponsibilityConceptSupportCap { get; init; } = 0.06f;
        public float ResponsibilityConceptCoverageBonusMax { get; init; } = 0.04f;
        public float ResponsibilityCoherenceUnitBonus { get; init; } = 0.015f;
        public float ResponsibilityCoherenceBonusCap { get; init; } = 0.04f;
        public float SubThresholdSemanticScale { get; init; } = 0.85f;
        public float SemanticCalibrationExponent { get; init; } = 0.78f;
        public float WorkExperienceEvidenceBonus { get; init; } = 0.03f;
        public float ProjectEvidenceBonus { get; init; } = 0.015f;
        public float MissingResponsibilitiesNeutralScore { get; init; } = 0.55f;
        public float MissingSummaryNeutralScore { get; init; } = 0.55f;

        public float StrongMatchThreshold { get; init; } = 0.78f;
        public float StrongExperienceBoost { get; init; } = 0.015f;
        public float StrongSkillsBoost { get; init; } = 0.025f;
        public float StrongResponsibilitiesBoost { get; init; } = 0.02f;
        public float StrongSummaryBoost { get; init; } = 0.01f;
        public float StrongImplementationBoost { get; init; } = 0.012f;
        public float CombinedStrongMatchBoost { get; init; } = 0.01f;
        public float StrongCoverageThreshold { get; init; } = 0.85f;
        public float CoverageBoostMax { get; init; } = 0.01f;
        public float MaxBoost { get; init; } = 0.05f;

        public float EducationGapPenalty { get; init; } = 0.01f;
        public float ExperienceGapPenaltyScale { get; init; } = 0.015f;
        public float ExperienceGapPenaltyExponent { get; init; } = 1.5f;
        public float MaxPenalty { get; init; } = 0.03f;
        public float YearsExperiencePartialFloor { get; init; } = 0.45f;
        public float YearsExperienceZeroExperienceFloor { get; init; } = 0.25f;
        public float YearsNearMissBufferYears { get; init; } = 0.5f;
        public float YearsNearMissFloor { get; init; } = 0.94f;
        public float YearsExperienceCurveExponent { get; init; } = 0.65f;
        public float ImplementationYearsReliefThreshold { get; init; } = 0.72f;
        public float ProjectYearsReliefThreshold { get; init; } = 0.70f;
        public float YearsPenaltyMaxRelief { get; init; } = 0.58f;
        public float YearsPenaltyNearMissWeight { get; init; } = 0.33f;
        public float YearsPenaltyImplementationWeight { get; init; } = 0.29f;
        public float YearsPenaltyProjectWeight { get; init; } = 0.18f;
        public float YearsPenaltyLowRequirementWeight { get; init; } = 0.12f;
        public float YearsPenaltyExistingScoreWeight { get; init; } = 0.08f;
        public float BaseScoreExponent { get; init; } = 1.08f;

        public static AtsScoringConfig FromConfiguration(IConfiguration? configuration)
        {
            var section = configuration?.GetSection("AtsScoring");

            return new AtsScoringConfig
            {
                WorkExperienceWeight = section?.GetValue<float?>("WorkExperienceWeight") ?? 0.18f,
                SkillsWeight = section?.GetValue<float?>("SkillsWeight") ?? 0.41f,
                ResponsibilitiesWeight = section?.GetValue<float?>("ResponsibilitiesWeight") ?? 0.23f,
                SummaryWeight = section?.GetValue<float?>("SummaryWeight") ?? 0.07f,
                EducationWeight = section?.GetValue<float?>("EducationWeight") ?? 0.03f,
                YearsExperienceWeight = section?.GetValue<float?>("YearsExperienceWeight") ?? 0.07f,
                SkillsScoreCeiling = section?.GetValue<float?>("SkillsScoreCeiling") ?? 0.90f,
                ResponsibilitiesScoreCeiling = section?.GetValue<float?>("ResponsibilitiesScoreCeiling") ?? 0.85f,
                DescriptionScoreCeiling = section?.GetValue<float?>("DescriptionScoreCeiling") ?? 0.82f,
                WorkScoreCeiling = section?.GetValue<float?>("WorkScoreCeiling") ?? 0.87f,

                RequiredSkillsBlend = section?.GetValue<float?>("RequiredSkillsBlend") ?? 0.90f,
                PreferredSkillsBlend = section?.GetValue<float?>("PreferredSkillsBlend") ?? 0.10f,
                WorkScoreResponsibilityBlend = section?.GetValue<float?>("WorkScoreResponsibilityBlend") ?? 0.52f,
                WorkScoreSummaryBlend = section?.GetValue<float?>("WorkScoreSummaryBlend") ?? 0.04f,
                WorkScoreRequiredSkillsBlend = section?.GetValue<float?>("WorkScoreRequiredSkillsBlend") ?? 0.43f,
                WorkScoreImplementationBlend = section?.GetValue<float?>("WorkScoreImplementationBlend") ?? 0.36f,

                ImplementationEvidenceWorkWeight = section?.GetValue<float?>("ImplementationEvidenceWorkWeight") ?? 0.50f,
                ImplementationEvidenceProjectWeight = section?.GetValue<float?>("ImplementationEvidenceProjectWeight") ?? 0.24f,
                JuniorProjectEvidenceWeightBoost = section?.GetValue<float?>("JuniorProjectEvidenceWeightBoost") ?? 0.16f,
                JuniorProjectEvidenceWorkShift = section?.GetValue<float?>("JuniorProjectEvidenceWorkShift") ?? 0.10f,
                JuniorProjectEvidenceYearsThreshold = section?.GetValue<float?>("JuniorProjectEvidenceYearsThreshold") ?? 2.5f,
                ExperiencedProjectEvidenceYearsThreshold = section?.GetValue<float?>("ExperiencedProjectEvidenceYearsThreshold") ?? 5f,
                ImplementationEvidenceTopWindow = section?.GetValue<int?>("ImplementationEvidenceTopWindow") ?? 4,
                ImplementationEvidenceSimilarityWeight = section?.GetValue<float?>("ImplementationEvidenceSimilarityWeight") ?? 0.62f,
                ImplementationEvidenceMatchTypeWeight = section?.GetValue<float?>("ImplementationEvidenceMatchTypeWeight") ?? 0.24f,
                ImplementationEvidenceSourceWeight = section?.GetValue<float?>("ImplementationEvidenceSourceWeight") ?? 0.14f,
                ImplementationEvidenceQualityWeight = section?.GetValue<float?>("ImplementationEvidenceQualityWeight") ?? 0.72f,
                ImplementationEvidenceCoverageWeight = section?.GetValue<float?>("ImplementationEvidenceCoverageWeight") ?? 0.18f,
                ImplementationEvidenceDiversityUnitBonus = section?.GetValue<float?>("ImplementationEvidenceDiversityUnitBonus") ?? 0.025f,
                ImplementationEvidenceDiversityCap = section?.GetValue<float?>("ImplementationEvidenceDiversityCap") ?? 0.08f,
                ImplementationEvidenceCorroborationUnitBonus = section?.GetValue<float?>("ImplementationEvidenceCorroborationUnitBonus") ?? 0.02f,
                ImplementationEvidenceCorroborationCap = section?.GetValue<float?>("ImplementationEvidenceCorroborationCap") ?? 0.05f,
                ImplementationStrongThreshold = section?.GetValue<float?>("ImplementationStrongThreshold") ?? 0.80f,
                ImplementationEvidenceMinimumSemantic = section?.GetValue<float?>("ImplementationEvidenceMinimumSemantic") ?? 0.68f,

                SemanticSkillThreshold = section?.GetValue<float?>("SemanticSkillThreshold") ?? 0.68f,
                SemanticSkillFloor = section?.GetValue<float?>("SemanticSkillFloor") ?? 0.72f,
                SemanticSkillCeiling = section?.GetValue<float?>("SemanticSkillCeiling") ?? 0.96f,
                SemanticEvidenceTopK = section?.GetValue<int?>("SemanticEvidenceTopK") ?? 3,
                SemanticEvidenceDecay = section?.GetValue<float?>("SemanticEvidenceDecay") ?? 0.75f,
                SemanticEvidenceStrongThreshold = section?.GetValue<float?>("SemanticEvidenceStrongThreshold") ?? 0.78f,
                SemanticEvidenceCoverageBonusMax = section?.GetValue<float?>("SemanticEvidenceCoverageBonusMax") ?? 0.04f,
                SemanticLexicalBlendWeight = section?.GetValue<float?>("SemanticLexicalBlendWeight") ?? 0.30f,
                RequiredSkillMissingFloor = section?.GetValue<float?>("RequiredSkillMissingFloor") ?? 0.24f,
                RequiredSkillsNeutralScore = section?.GetValue<float?>("RequiredSkillsNeutralScore") ?? 0.36f,
                PreferredSkillsNeutralScore = section?.GetValue<float?>("PreferredSkillsNeutralScore") ?? 0.48f,
                RequiredSkillStrongThreshold = section?.GetValue<float?>("RequiredSkillStrongThreshold") ?? 0.90f,
                PreferredSkillStrongThreshold = section?.GetValue<float?>("PreferredSkillStrongThreshold") ?? 0.86f,
                RequiredSkillCoverageWeight = section?.GetValue<float?>("RequiredSkillCoverageWeight") ?? 0.36f,
                PreferredSkillCoverageWeight = section?.GetValue<float?>("PreferredSkillCoverageWeight") ?? 0.28f,
                RequiredSkillStrongMatchBonusMax = section?.GetValue<float?>("RequiredSkillStrongMatchBonusMax") ?? 0.08f,
                PreferredSkillStrongMatchBonusMax = section?.GetValue<float?>("PreferredSkillStrongMatchBonusMax") ?? 0.09f,
                SkillEvidenceConfidenceWeight = section?.GetValue<float?>("SkillEvidenceConfidenceWeight") ?? 0.16f,
                SkillSimilarityWeight = section?.GetValue<float?>("SkillSimilarityWeight") ?? 0.68f,
                SkillEvidenceConfidenceSignalWeight = section?.GetValue<float?>("SkillEvidenceConfidenceSignalWeight") ?? 0.20f,
                SkillMatchTypeSignalWeight = section?.GetValue<float?>("SkillMatchTypeSignalWeight") ?? 0.12f,
                ExactMatchScoreBonusMax = section?.GetValue<float?>("ExactMatchScoreBonusMax") ?? 0.04f,
                AliasMatchScoreBonusMax = section?.GetValue<float?>("AliasMatchScoreBonusMax") ?? 0.02f,
                ExactMatchConfidence = section?.GetValue<float?>("ExactMatchConfidence") ?? 1f,
                AliasMatchConfidence = section?.GetValue<float?>("AliasMatchConfidence") ?? 0.96f,
                RelatedClusterMatchConfidence = section?.GetValue<float?>("RelatedClusterMatchConfidence") ?? 0.88f,
                RelatedClusterMinScore = section?.GetValue<float?>("RelatedClusterMinScore") ?? 0.68f,
                RelatedClusterMaxScore = section?.GetValue<float?>("RelatedClusterMaxScore") ?? 0.82f,
                RelatedClusterCanonicalCoverageWeight = section?.GetValue<float?>("RelatedClusterCanonicalCoverageWeight") ?? 0.10f,
                RelatedClusterCoverageWeight = section?.GetValue<float?>("RelatedClusterCoverageWeight") ?? 0.06f,
                RelatedClusterSourceWeight = section?.GetValue<float?>("RelatedClusterSourceWeight") ?? 0.04f,
                RelatedClusterSecondarySignalBonus = section?.GetValue<float?>("RelatedClusterSecondarySignalBonus") ?? 0.03f,
                RelatedClusterSecondaryClusterBonus = section?.GetValue<float?>("RelatedClusterSecondaryClusterBonus") ?? 0.015f,
                RelatedClusterSupportCap = section?.GetValue<float?>("RelatedClusterSupportCap") ?? 0.06f,
                SemanticMatchConfidenceFloor = section?.GetValue<float?>("SemanticMatchConfidenceFloor") ?? 0.72f,
                ConfidenceWorkEvidenceBonus = section?.GetValue<float?>("ConfidenceWorkEvidenceBonus") ?? 0.03f,
                ConfidenceProjectEvidenceBonus = section?.GetValue<float?>("ConfidenceProjectEvidenceBonus") ?? 0.015f,
                ResponsibilitySemanticThreshold = section?.GetValue<float?>("ResponsibilitySemanticThreshold") ?? 0.58f,
                ResponsibilitySemanticFloor = section?.GetValue<float?>("ResponsibilitySemanticFloor") ?? 0.64f,
                ResponsibilitySemanticCeiling = section?.GetValue<float?>("ResponsibilitySemanticCeiling") ?? 0.93f,
                DescriptionSemanticThreshold = section?.GetValue<float?>("DescriptionSemanticThreshold") ?? 0.60f,
                DescriptionSemanticFloor = section?.GetValue<float?>("DescriptionSemanticFloor") ?? 0.66f,
                DescriptionSemanticCeiling = section?.GetValue<float?>("DescriptionSemanticCeiling") ?? 0.90f,
                DescriptionCorroborationThreshold = section?.GetValue<float?>("DescriptionCorroborationThreshold") ?? 0.58f,
                SummaryOnlyDescriptionPenaltyScale = section?.GetValue<float?>("SummaryOnlyDescriptionPenaltyScale") ?? 0.65f,
                DescriptionRelevantChunkThreshold = section?.GetValue<float?>("DescriptionRelevantChunkThreshold") ?? 0.60f,
                DescriptionStrongChunkThreshold = section?.GetValue<float?>("DescriptionStrongChunkThreshold") ?? 0.78f,
                DescriptionQualityWeight = section?.GetValue<float?>("DescriptionQualityWeight") ?? 0.58f,
                DescriptionCoverageWeight = section?.GetValue<float?>("DescriptionCoverageWeight") ?? 0.30f,
                DescriptionStrongChunkBonusWeight = section?.GetValue<float?>("DescriptionStrongChunkBonusWeight") ?? 0.12f,
                ResponsibilityRelevantThreshold = section?.GetValue<float?>("ResponsibilityRelevantThreshold") ?? 0.62f,
                ResponsibilityStrongThreshold = section?.GetValue<float?>("ResponsibilityStrongThreshold") ?? 0.78f,
                ResponsibilityQualityWeight = section?.GetValue<float?>("ResponsibilityQualityWeight") ?? 0.42f,
                ResponsibilityCoverageWeight = section?.GetValue<float?>("ResponsibilityCoverageWeight") ?? 0.34f,
                ResponsibilityMomentumWeight = section?.GetValue<float?>("ResponsibilityMomentumWeight") ?? 0.14f,
                ResponsibilityMomentumCoverageRatio = section?.GetValue<float?>("ResponsibilityMomentumCoverageRatio") ?? 0.65f,
                ResponsibilityQualityWindowRatio = section?.GetValue<float?>("ResponsibilityQualityWindowRatio") ?? 0.80f,
                ResponsibilityCoverageFloor = section?.GetValue<float?>("ResponsibilityCoverageFloor") ?? 0.48f,
                ResponsibilityEvidenceRetentionFloor = section?.GetValue<float?>("ResponsibilityEvidenceRetentionFloor") ?? 0.98f,
                ResponsibilityRelevantMatchBonusMax = section?.GetValue<float?>("ResponsibilityRelevantMatchBonusMax") ?? 0.04f,
                ResponsibilityStrongMatchBonusMax = section?.GetValue<float?>("ResponsibilityStrongMatchBonusMax") ?? 0.06f,
                ResponsibilitySemanticBlendWeight = section?.GetValue<float?>("ResponsibilitySemanticBlendWeight") ?? 0.32f,
                ResponsibilityWeakSemanticBlendWeight = section?.GetValue<float?>("ResponsibilityWeakSemanticBlendWeight") ?? 0.18f,
                ResponsibilityConceptSupportBonus = section?.GetValue<float?>("ResponsibilityConceptSupportBonus") ?? 0.03f,
                ResponsibilityConceptCoverageWeight = section?.GetValue<float?>("ResponsibilityConceptCoverageWeight") ?? 0.64f,
                ResponsibilitySentenceSemanticWeight = section?.GetValue<float?>("ResponsibilitySentenceSemanticWeight") ?? 0.18f,
                ResponsibilityConceptSupportUnitBonus = section?.GetValue<float?>("ResponsibilityConceptSupportUnitBonus") ?? 0.02f,
                ResponsibilityConceptSupportCap = section?.GetValue<float?>("ResponsibilityConceptSupportCap") ?? 0.06f,
                ResponsibilityConceptCoverageBonusMax = section?.GetValue<float?>("ResponsibilityConceptCoverageBonusMax") ?? 0.04f,
                ResponsibilityCoherenceUnitBonus = section?.GetValue<float?>("ResponsibilityCoherenceUnitBonus") ?? 0.015f,
                ResponsibilityCoherenceBonusCap = section?.GetValue<float?>("ResponsibilityCoherenceBonusCap") ?? 0.04f,
                SubThresholdSemanticScale = section?.GetValue<float?>("SubThresholdSemanticScale") ?? 0.85f,
                SemanticCalibrationExponent = section?.GetValue<float?>("SemanticCalibrationExponent") ?? 0.78f,
                WorkExperienceEvidenceBonus = section?.GetValue<float?>("WorkExperienceEvidenceBonus") ?? 0.03f,
                ProjectEvidenceBonus = section?.GetValue<float?>("ProjectEvidenceBonus") ?? 0.015f,
                MissingResponsibilitiesNeutralScore = section?.GetValue<float?>("MissingResponsibilitiesNeutralScore") ?? 0.55f,
                MissingSummaryNeutralScore = section?.GetValue<float?>("MissingSummaryNeutralScore") ?? 0.55f,

                StrongMatchThreshold = section?.GetValue<float?>("StrongMatchThreshold") ?? 0.78f,
                StrongExperienceBoost = section?.GetValue<float?>("StrongExperienceBoost") ?? 0.015f,
                StrongSkillsBoost = section?.GetValue<float?>("StrongSkillsBoost") ?? 0.025f,
                StrongResponsibilitiesBoost = section?.GetValue<float?>("StrongResponsibilitiesBoost") ?? 0.02f,
                StrongSummaryBoost = section?.GetValue<float?>("StrongSummaryBoost") ?? 0.01f,
                StrongImplementationBoost = section?.GetValue<float?>("StrongImplementationBoost") ?? 0.012f,
                CombinedStrongMatchBoost = section?.GetValue<float?>("CombinedStrongMatchBoost") ?? 0.01f,
                StrongCoverageThreshold = section?.GetValue<float?>("StrongCoverageThreshold") ?? 0.85f,
                CoverageBoostMax = section?.GetValue<float?>("CoverageBoostMax") ?? 0.01f,
                MaxBoost = section?.GetValue<float?>("MaxBoost") ?? 0.05f,

                EducationGapPenalty = section?.GetValue<float?>("EducationGapPenalty") ?? 0.01f,
                ExperienceGapPenaltyScale = section?.GetValue<float?>("ExperienceGapPenaltyScale") ?? 0.015f,
                ExperienceGapPenaltyExponent = section?.GetValue<float?>("ExperienceGapPenaltyExponent") ?? 1.5f,
                MaxPenalty = section?.GetValue<float?>("MaxPenalty") ?? 0.03f,
                YearsExperiencePartialFloor = section?.GetValue<float?>("YearsExperiencePartialFloor") ?? 0.45f,
                YearsExperienceZeroExperienceFloor = section?.GetValue<float?>("YearsExperienceZeroExperienceFloor") ?? 0.25f,
                YearsNearMissBufferYears = section?.GetValue<float?>("YearsNearMissBufferYears") ?? 0.5f,
                YearsNearMissFloor = section?.GetValue<float?>("YearsNearMissFloor") ?? 0.94f,
                YearsExperienceCurveExponent = section?.GetValue<float?>("YearsExperienceCurveExponent") ?? 0.65f,
                ImplementationYearsReliefThreshold = section?.GetValue<float?>("ImplementationYearsReliefThreshold") ?? 0.72f,
                ProjectYearsReliefThreshold = section?.GetValue<float?>("ProjectYearsReliefThreshold") ?? 0.70f,
                YearsPenaltyMaxRelief = section?.GetValue<float?>("YearsPenaltyMaxRelief") ?? 0.58f,
                YearsPenaltyNearMissWeight = section?.GetValue<float?>("YearsPenaltyNearMissWeight") ?? 0.33f,
                YearsPenaltyImplementationWeight = section?.GetValue<float?>("YearsPenaltyImplementationWeight") ?? 0.29f,
                YearsPenaltyProjectWeight = section?.GetValue<float?>("YearsPenaltyProjectWeight") ?? 0.18f,
                YearsPenaltyLowRequirementWeight = section?.GetValue<float?>("YearsPenaltyLowRequirementWeight") ?? 0.12f,
                YearsPenaltyExistingScoreWeight = section?.GetValue<float?>("YearsPenaltyExistingScoreWeight") ?? 0.08f,
                BaseScoreExponent = section?.GetValue<float?>("BaseScoreExponent") ?? 1.08f
            };
        }

        public Dictionary<string, float> GetNormalizedSectionWeights()
        {
            var raw = new Dictionary<string, float>
            {
                ["work_experience"] = Math.Max(0f, WorkExperienceWeight),
                ["skills"] = Math.Max(0f, SkillsWeight),
                ["responsibilities"] = Math.Max(0f, ResponsibilitiesWeight),
                ["description"] = Math.Max(0f, SummaryWeight),
                ["education"] = Math.Max(0f, EducationWeight),
                ["years_experience"] = Math.Max(0f, YearsExperienceWeight)
            };

            var total = raw.Values.Sum();
            if (total <= 0f)
            {
                return new Dictionary<string, float>
                {
                    ["work_experience"] = 0.18f,
                    ["skills"] = 0.41f,
                    ["responsibilities"] = 0.23f,
                    ["description"] = 0.07f,
                    ["education"] = 0.03f,
                    ["years_experience"] = 0.07f
                };
            }

            return raw.ToDictionary(x => x.Key, x => x.Value / total);
        }
    }
}
