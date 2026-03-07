using Microsoft.Extensions.Configuration;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Contracts.Scoring.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Domain.Entities;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace SkillSense.Application.Services.Scoring;

public sealed class ResumeEmbeddingScoringOrchestrator(ITextEmbeddingService embeddingService, IConfiguration? configuration = null) : IResumeScoringOrchestrator
{
    private readonly AtsScoringConfig _config = AtsScoringConfig.FromConfiguration(configuration);

    private static readonly Lazy<Dictionary<string, string>> SkillAliasMap = new(LoadSkillAliasMap);
    private static readonly Regex VersionSuffixRegex = new(@"\b(v|version)?\s*\d+(\.\d+)*\b", RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public async Task<(List<ResumeEmbeddingEntity> Embeddings, FinalMatchScore Score)> BuildAsync(Guid submissionId, ParsedResume resume, NormalizedJobDescription job, CancellationToken ct)
    {
        var skillCandidates = BuildSkillCandidates(resume);
        var requiredMatches = await MatchSkillsAsync(job.RequiredSkills, skillCandidates, ct, true);
        var preferredMatches = await MatchSkillsAsync(job.PreferredSkills, skillCandidates, ct, false);
        var responsibilityMatches = await MatchResponsibilitiesAsync(job.Responsibilities, resume, ct);
        var descriptionMatches = await MatchDescriptionAsync(job.Description, resume, ct);

        var requiredScore = requiredMatches.Count == 0 ? 1f : requiredMatches.Average(x => x.Similarity);
        var preferredScore = preferredMatches.Count == 0 ? 1f : preferredMatches.Average(x => x.Similarity);
        var skillsScore = Math.Clamp((requiredScore * _config.RequiredSkillsBlend) + (preferredScore * _config.PreferredSkillsBlend), 0f, 1f);
        var responsibilitiesScore = responsibilityMatches.Count == 0 ? _config.MissingResponsibilitiesNeutralScore : responsibilityMatches.Average(x => x.Similarity);
        var descriptionScore = descriptionMatches.Count == 0 ? _config.MissingSummaryNeutralScore : descriptionMatches.Max(x => x.Similarity);
        var educationScore = ScoreEducation(job.MinimumEducationLevel, resume);
        var yearsScore = ScoreYears(job.MinimumYearsExperience, resume);
        var workScore = Math.Clamp(
            (responsibilitiesScore * _config.WorkScoreResponsibilityBlend)
            + (descriptionScore * _config.WorkScoreSummaryBlend)
            + (requiredScore * _config.WorkScoreRequiredSkillsBlend),
            0f,
            1f);

        var sectionScores = new Dictionary<string, float>
        {
            ["work_experience"] = workScore,
            ["skills"] = skillsScore,
            ["responsibilities"] = responsibilitiesScore,
            ["description"] = descriptionScore,
            ["education"] = educationScore,
            ["years_experience"] = yearsScore
        };

        var sectionWeights = _config.GetNormalizedSectionWeights();
        var weightedBaseScore = sectionScores.Sum(x => x.Value * sectionWeights.GetValueOrDefault(x.Key, 0f));
        var strongMatchBoost = ComputeStrongMatchBoost(workScore, descriptionScore);
        var penalty = ComputePenalty(educationScore, yearsScore);

        var final = (weightedBaseScore + strongMatchBoost - penalty) * 100f;

        return ([], new FinalMatchScore
        {
            FinalScore = Math.Clamp(final, 0f, 100f),
            SectionScores = sectionScores,
            SectionScoreDetails =
            [
                new SectionScore { Name = "work_experience", Score = workScore, Weight = sectionWeights.GetValueOrDefault("work_experience"), MatchedItems = requiredMatches.Concat(responsibilityMatches).Take(5).ToList() },
                new SectionScore { Name = "skills", Score = skillsScore, Weight = sectionWeights.GetValueOrDefault("skills"), MatchedItems = requiredMatches.Concat(preferredMatches).ToList() },
                new SectionScore { Name = "responsibilities", Score = responsibilitiesScore, Weight = sectionWeights.GetValueOrDefault("responsibilities"), MatchedItems = responsibilityMatches },
                new SectionScore { Name = "description", Score = descriptionScore, Weight = sectionWeights.GetValueOrDefault("description"), MatchedItems = descriptionMatches },
                new SectionScore { Name = "education", Score = educationScore, Weight = sectionWeights.GetValueOrDefault("education"), Notes = [job.MinimumEducationLevel] },
                new SectionScore { Name = "years_experience", Score = yearsScore, Weight = sectionWeights.GetValueOrDefault("years_experience"), Notes = [job.MinimumYearsExperience.ToString()] }
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

    private float ComputeStrongMatchBoost(float workScore, float descriptionScore)
    {
        var threshold = _config.StrongMatchThreshold;
        var workBoost = workScore < threshold
            ? 0f
            : _config.StrongExperienceBoost * ((workScore - threshold) / Math.Max(0.001f, 1f - threshold));
        var summaryBoost = descriptionScore < threshold
            ? 0f
            : _config.StrongSummaryBoost * ((descriptionScore - threshold) / Math.Max(0.001f, 1f - threshold));
        var combinedBoost = workScore >= threshold && descriptionScore >= threshold ? _config.CombinedStrongMatchBoost : 0f;

        return Math.Clamp(workBoost + summaryBoost + combinedBoost, 0f, _config.MaxBoost);
    }

    private float ComputePenalty(float educationScore, float yearsScore)
    {
        var educationPenalty = educationScore >= 1f ? 0f : _config.EducationGapPenalty;
        var yearsPenalty = yearsScore >= 1f ? 0f : (1f - yearsScore) * _config.ExperienceGapPenaltyScale;

        return Math.Clamp(educationPenalty + yearsPenalty, 0f, _config.MaxPenalty);
    }

    private static List<(string Text, string Source)> BuildSkillCandidates(ParsedResume resume)
    {
        var items = new List<(string, string)>();
        items.AddRange(resume.Skills.Select(s => (s, "skills")));
        items.AddRange(resume.WorkExperience.SelectMany(w => w.Technologies.Select(t => (t, "work_experience.technologies"))));
        items.AddRange(resume.WorkExperience.SelectMany(w => w.Bullets.Select(b => (b, "work_experience.bullets"))));
        items.AddRange(resume.Projects.SelectMany(p => p.Technologies.Select(t => (t, "projects.technologies"))));
        items.AddRange(resume.Certifications.Select(c => (c.Name, "certifications.name")));
        return items.Where(x => !string.IsNullOrWhiteSpace(x.Item1)).ToList();
    }

    private async Task<List<MatchEvidence>> MatchSkillsAsync(List<string> jdSkills, List<(string Text, string Source)> candidates, CancellationToken ct, bool required)
    {
        var results = new List<MatchEvidence>();
        foreach (var jdSkill in jdSkills.Where(s => !string.IsNullOrWhiteSpace(s)))
        {
            var canonicalJdSkill = CanonicalizeSkill(jdSkill);
            var exact = candidates.FirstOrDefault(c => NormalizeSkill(c.Text) == NormalizeSkill(jdSkill));
            if (!string.IsNullOrEmpty(exact.Text))
            {
                results.Add(new MatchEvidence { JdItem = jdSkill, BestResumeEvidence = exact.Text, Source = exact.Source, Similarity = exact.Source.StartsWith("work_experience") ? 1f : 0.95f, MatchType = "exact" });
                continue;
            }

            var canonical = candidates.FirstOrDefault(c => CanonicalizeSkill(c.Text) == canonicalJdSkill);
            if (!string.IsNullOrEmpty(canonical.Text))
            {
                results.Add(new MatchEvidence { JdItem = jdSkill, BestResumeEvidence = canonical.Text, Source = canonical.Source, Similarity = canonical.Source.StartsWith("work_experience") ? 1f : 0.95f, MatchType = "alias" });
                continue;
            }

            var semantic = await BuildManyToManySemanticEvidenceAsync(jdSkill, candidates, ct);
            if (semantic.Similarity >= _config.SemanticSkillThreshold)
            {
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
                    Similarity = _config.RequiredSkillMissingFloor,
                    MatchType = "rule"
                });
            }
        }

        return results;
    }

    private async Task<List<MatchEvidence>> MatchResponsibilitiesAsync(List<string> responsibilities, ParsedResume resume, CancellationToken ct)
    {
        var normalizedResponsibilities = PreprocessResponsibilities(responsibilities);
        var candidates = BuildResponsibilityCandidates(resume);

        var matches = new List<MatchEvidence>();
        foreach (var responsibility in normalizedResponsibilities)
        {
            matches.Add(await BuildManyToManySemanticEvidenceAsync(responsibility.Original, candidates, ct, responsibility.Cleaned));
        }

        return matches;
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

        candidates.AddRange(resume.WorkExperience.SelectMany(w => w.Bullets.Select(b => (b, "work_experience.bullets"))));
        candidates.AddRange(resume.WorkExperience.Select(w => (w.Description, "work_experience.description")));
        candidates.AddRange(resume.WorkExperience.SelectMany(w => w.Technologies.Select(t => (t, "work_experience.technologies"))));
        candidates.AddRange(resume.Projects.SelectMany(p => p.Bullets.Select(b => (b, "projects.bullets"))));
        candidates.AddRange(resume.Projects.Select(p => (p.Description, "projects.description")));
        candidates.AddRange(resume.Projects.SelectMany(p => p.Technologies.Select(t => (t, "projects.technologies"))));
        candidates.AddRange(resume.Skills.Select(s => (s, "skills")));

        return candidates.Where(x => !string.IsNullOrWhiteSpace(x.Item1)).ToList();
    }

    private async Task<List<MatchEvidence>> MatchDescriptionAsync(string jdDescription, ParsedResume resume, CancellationToken ct)
    {
        var candidates = resume.Summary.Select(s => (s, "summary"))
            .Concat(resume.WorkExperience.Select(w => (w.Description, "work_experience.description")))
            .Concat(resume.WorkExperience.SelectMany(w => w.Bullets.Select(b => (b, "work_experience.bullets"))))
            .Concat(resume.Projects.Select(p => (p.Description, "projects.description")))
            .Concat(resume.Projects.SelectMany(p => p.Bullets.Select(b => (b, "projects.bullets"))))
            .Where(x => !string.IsNullOrWhiteSpace(x.Item1)).ToList();

        if (string.IsNullOrWhiteSpace(jdDescription) || candidates.Count == 0) return [];
        return [await BuildManyToManySemanticEvidenceAsync("overall_description", candidates, ct, jdDescription)];
    }

    private async Task<MatchEvidence> BuildManyToManySemanticEvidenceAsync(string jdItem, List<(string Text, string Source)> candidates, CancellationToken ct, string? queryOverride = null)
    {
        if (candidates.Count == 0) return new MatchEvidence { JdItem = jdItem, Similarity = 0f, MatchType = "rule" };

        var ranked = await RankSemanticMatchesAsync(queryOverride ?? jdItem, candidates, ct);
        var uniqueRanked = DeduplicateRankedCandidates(ranked);
        if (uniqueRanked.Count == 0) return new MatchEvidence { JdItem = jdItem, Similarity = 0f, MatchType = "rule" };

        var topK = Math.Max(1, _config.SemanticEvidenceTopK);
        var top = uniqueRanked.Take(topK).ToList();
        var aggregateSimilarity = AggregateTopKSimilarity(top);
        var best = top[0];

        return new MatchEvidence
        {
            JdItem = jdItem,
            BestResumeEvidence = best.Text,
            Source = best.Source,
            Similarity = aggregateSimilarity,
            MatchType = "semantic"
        };
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

    private async Task<List<SemanticCandidateScore>> RankSemanticMatchesAsync(string query, List<(string Text, string Source)> candidates, CancellationToken ct)
    {
        var queryEmbedding = await embeddingService.EmbedAsync(query, ct);
        var ranked = new List<SemanticCandidateScore>(candidates.Count);

        foreach (var candidate in candidates)
        {
            var candidateEmbedding = await embeddingService.EmbedAsync(candidate.Text, ct);
            var similarity = SimilarityMath.CosineSimilarity(queryEmbedding, candidateEmbedding);
            ranked.Add(new SemanticCandidateScore(candidate.Text, candidate.Source, similarity));
        }

        return ranked.OrderByDescending(x => x.Similarity).ToList();
    }

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
        normalized = Regex.Replace(normalized, @"\b(apis|api\s+development|development|experience\s+with|knowledge\s+of)\b", " ");
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
            ["javascript"] = "javascript",
            ["js"] = "javascript",
            ["typescript"] = "typescript",
            ["ts"] = "typescript",
            ["postgresql"] = "postgresql",
            ["postgres"] = "postgresql",
            ["sql server"] = "sql server",
            ["mssql"] = "sql server",
            ["ms sql"] = "sql server"
        };

        return pairs.ToDictionary(x => NormalizeSkillForCanonicalization(x.Key), x => NormalizeSkillForCanonicalization(x.Value));
    }

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

    private static float ScoreYears(int minYears, ParsedResume resume)
    {
        if (minYears <= 0) return 1f;
        var months = resume.Derived.TotalExperienceMonths > 0 ? resume.Derived.TotalExperienceMonths : resume.WorkExperience.Sum(w => Math.Max(0, w.DurationMonths));
        var years = months / 12f;
        return years >= minYears ? 1f : Math.Clamp(years / minYears, 0f, 1f);
    }

    private sealed record SemanticCandidateScore(string Text, string Source, float Similarity);
    private sealed record ResponsibilityInput(string Original, string Cleaned);

    private sealed record AtsScoringConfig
    {
        public float WorkExperienceWeight { get; init; } = 0.22f;
        public float SkillsWeight { get; init; } = 0.45f;
        public float ResponsibilitiesWeight { get; init; } = 0.10f;
        public float SummaryWeight { get; init; } = 0.15f;
        public float EducationWeight { get; init; } = 0.03f;
        public float YearsExperienceWeight { get; init; } = 0.05f;

        public float RequiredSkillsBlend { get; init; } = 0.75f;
        public float PreferredSkillsBlend { get; init; } = 0.25f;
        public float WorkScoreResponsibilityBlend { get; init; } = 0.30f;
        public float WorkScoreSummaryBlend { get; init; } = 0.45f;
        public float WorkScoreRequiredSkillsBlend { get; init; } = 0.25f;

        public float SemanticSkillThreshold { get; init; } = 0.68f;
        public int SemanticEvidenceTopK { get; init; } = 3;
        public float SemanticEvidenceDecay { get; init; } = 0.75f;
        public float SemanticEvidenceStrongThreshold { get; init; } = 0.78f;
        public float SemanticEvidenceCoverageBonusMax { get; init; } = 0.04f;
        public float RequiredSkillMissingFloor { get; init; } = 0.35f;
        public float MissingResponsibilitiesNeutralScore { get; init; } = 0.62f;
        public float MissingSummaryNeutralScore { get; init; } = 0.62f;

        public float StrongMatchThreshold { get; init; } = 0.65f;
        public float StrongExperienceBoost { get; init; } = 0.10f;
        public float StrongSummaryBoost { get; init; } = 0.09f;
        public float CombinedStrongMatchBoost { get; init; } = 0.05f;
        public float MaxBoost { get; init; } = 0.18f;

        public float EducationGapPenalty { get; init; } = 0.02f;
        public float ExperienceGapPenaltyScale { get; init; } = 0.04f;
        public float MaxPenalty { get; init; } = 0.06f;

        public static AtsScoringConfig FromConfiguration(IConfiguration? configuration)
        {
            var section = configuration?.GetSection("AtsScoring");

            return new AtsScoringConfig
            {
                WorkExperienceWeight = section?.GetValue<float?>("WorkExperienceWeight") ?? 0.22f,
                SkillsWeight = section?.GetValue<float?>("SkillsWeight") ?? 0.45f,
                ResponsibilitiesWeight = section?.GetValue<float?>("ResponsibilitiesWeight") ?? 0.10f,
                SummaryWeight = section?.GetValue<float?>("SummaryWeight") ?? 0.15f,
                EducationWeight = section?.GetValue<float?>("EducationWeight") ?? 0.03f,
                YearsExperienceWeight = section?.GetValue<float?>("YearsExperienceWeight") ?? 0.05f,

                RequiredSkillsBlend = section?.GetValue<float?>("RequiredSkillsBlend") ?? 0.75f,
                PreferredSkillsBlend = section?.GetValue<float?>("PreferredSkillsBlend") ?? 0.25f,
                WorkScoreResponsibilityBlend = section?.GetValue<float?>("WorkScoreResponsibilityBlend") ?? 0.30f,
                WorkScoreSummaryBlend = section?.GetValue<float?>("WorkScoreSummaryBlend") ?? 0.45f,
                WorkScoreRequiredSkillsBlend = section?.GetValue<float?>("WorkScoreRequiredSkillsBlend") ?? 0.25f,

                SemanticSkillThreshold = section?.GetValue<float?>("SemanticSkillThreshold") ?? 0.68f,
                SemanticEvidenceTopK = section?.GetValue<int?>("SemanticEvidenceTopK") ?? 3,
                SemanticEvidenceDecay = section?.GetValue<float?>("SemanticEvidenceDecay") ?? 0.75f,
                SemanticEvidenceStrongThreshold = section?.GetValue<float?>("SemanticEvidenceStrongThreshold") ?? 0.78f,
                SemanticEvidenceCoverageBonusMax = section?.GetValue<float?>("SemanticEvidenceCoverageBonusMax") ?? 0.04f,
                RequiredSkillMissingFloor = section?.GetValue<float?>("RequiredSkillMissingFloor") ?? 0.35f,
                MissingResponsibilitiesNeutralScore = section?.GetValue<float?>("MissingResponsibilitiesNeutralScore") ?? 0.62f,
                MissingSummaryNeutralScore = section?.GetValue<float?>("MissingSummaryNeutralScore") ?? 0.62f,

                StrongMatchThreshold = section?.GetValue<float?>("StrongMatchThreshold") ?? 0.65f,
                StrongExperienceBoost = section?.GetValue<float?>("StrongExperienceBoost") ?? 0.10f,
                StrongSummaryBoost = section?.GetValue<float?>("StrongSummaryBoost") ?? 0.09f,
                CombinedStrongMatchBoost = section?.GetValue<float?>("CombinedStrongMatchBoost") ?? 0.05f,
                MaxBoost = section?.GetValue<float?>("MaxBoost") ?? 0.18f,

                EducationGapPenalty = section?.GetValue<float?>("EducationGapPenalty") ?? 0.02f,
                ExperienceGapPenaltyScale = section?.GetValue<float?>("ExperienceGapPenaltyScale") ?? 0.04f,
                MaxPenalty = section?.GetValue<float?>("MaxPenalty") ?? 0.06f
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
                    ["work_experience"] = 0.22f,
                    ["skills"] = 0.45f,
                    ["responsibilities"] = 0.10f,
                    ["description"] = 0.15f,
                    ["education"] = 0.03f,
                    ["years_experience"] = 0.05f
                };
            }

            return raw.ToDictionary(x => x.Key, x => x.Value / total);
        }
    }
}