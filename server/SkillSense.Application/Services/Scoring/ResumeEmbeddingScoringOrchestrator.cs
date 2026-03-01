using System.Text.Json;
using Microsoft.Extensions.Options;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Contracts.Scoring.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Scoring;
using SkillSense.Domain.Entities;

namespace SkillSense.Application.Services.Scoring;

public sealed class ResumeEmbeddingScoringOrchestrator(
    ITextEmbeddingService embeddingService,
    IExperienceYearsCalculator experienceYearsCalculator,
    IExperienceContentBuilder experienceContentBuilder,
    ISimilarityEngine similarityEngine,
    ISkillsMatcher skillsMatcher,
    IEducationEvaluator educationEvaluator,
    ISummaryScorer summaryScorer,
    IBonusEvaluator bonusEvaluator,
    IScoreAggregator scoreAggregator,
    IOptions<AtsScoringOptions> options) : IResumeScoringOrchestrator
{
    public async Task<(List<ResumeEmbeddingEntity> Embeddings, AtsScoreResponse Score)> BuildAsync(
        Guid submissionId,
        ResumeParseResult resume,
        JobDescriptionInput jobDescription,
        CancellationToken ct)
    {
        var sections = ResumeSectionBuilder.Build(resume);
        ApplySkillBuckets(sections, jobDescription);

        var embeddings = new List<ResumeEmbeddingEntity>();
        foreach (var section in sections.EnumerateEmbeddingTexts().Where(x => !string.IsNullOrWhiteSpace(x.Text)))
        {
            var vector = (await embeddingService.EmbedAsync(section.Text, ct)).ToList();
            embeddings.Add(new ResumeEmbeddingEntity
            {
                Id = Guid.NewGuid(),
                ResumeSubmissionId = submissionId,
                SectionType = section.SectionType,
                SubSectionKey = section.SubSectionKey,
                EmbeddingJson = JsonSerializer.Serialize(vector),
                SourceText = section.Text,
                CreatedAtUtc = DateTime.UtcNow
            });
        }

        var score = await ScoreAsync(jobDescription, resume, ct);
        return (embeddings, score);
    }

    private async Task<AtsScoreResponse> ScoreAsync(
        JobDescriptionInput input,
        ResumeParseResult parsed,
        CancellationToken ct)
    {
        var experienceYears = experienceYearsCalculator.Calculate(parsed, input.MinYears);
        var experienceCorpus = experienceContentBuilder.BuildCorpus(parsed);
        var jdContext = experienceContentBuilder.BuildJobContext(input);
        var experienceContentSimilarity = await similarityEngine.CompareAsync(jdContext, experienceCorpus, ct);

        var (yearsSplit, contentSplit) = NormalizeExperienceSplits(options.Value.ExperienceYearsSplit, options.Value.ExperienceContentSplit);
        var experienceScore = Math.Clamp(
            (experienceYears.YearsScore * yearsSplit)
            + (experienceContentSimilarity.Combined * contentSplit),
            0f,
            1f);

        var skills = skillsMatcher.Evaluate(input, parsed);
        var education = educationEvaluator.Evaluate(input, parsed);
        var summarySimilarity = await summaryScorer.ScoreAsync(parsed, input, ct);
        var summaryScore = Math.Clamp(summarySimilarity.Combined, 0f, 1f);
        var bonus = bonusEvaluator.Evaluate(parsed);

        var aggregated = scoreAggregator.Aggregate(new ScoreAggregationInput
        {
            WorkExperienceScore = experienceScore,
            SkillsScore = skills.Score,
            EducationScore = education.Score,
            SummaryScore = summaryScore,
            BonusPoints = bonus.BonusPoints
        });

        var experiencePoints = experienceScore * options.Value.WorkExperienceWeight * 100f;
        var skillsPoints = skills.Score * options.Value.SkillsWeight * 100f;
        var educationPoints = education.Score * options.Value.EducationWeight * 100f;
        var summaryPoints = summaryScore * options.Value.SummaryWeight * 100f;

        var componentBreakdown = new Dictionary<string, object>
        {
            ["experience"] = new { raw_score = experienceScore, weight = options.Value.WorkExperienceWeight, contribution_points = experiencePoints },
            ["skills"] = new { raw_score = skills.Score, weight = options.Value.SkillsWeight, contribution_points = skillsPoints },
            ["education"] = new { raw_score = education.Score, weight = options.Value.EducationWeight, contribution_points = educationPoints },
            ["summary"] = new { raw_score = summaryScore, weight = options.Value.SummaryWeight, contribution_points = summaryPoints }
        };

        return new AtsScoreResponse
        {
            SkillsScore = skills.Score,
            ExperienceScore = experienceScore,
            EducationScore = education.Score,
            SummaryScore = summaryScore,
            FinalScore = aggregated.FinalScore,
            Breakdown = new Dictionary<string, object>
            {
                ["component_breakdown"] = componentBreakdown,
                ["bonus_breakdown"] = new
                {
                    projects_bonus_points = bonus.Reasons.Contains("projects_present") ? options.Value.BonusProjectsPoints : 0f,
                    certifications_bonus_points = bonus.Reasons.Contains("certifications_present") ? options.Value.BonusCertificationsPoints : 0f,
                    achievements_bonus_points = bonus.Reasons.Contains("achievements_present") ? options.Value.BonusAchievementsPoints : 0f,
                    total_bonus_points = bonus.BonusPoints,
                    cap_applied = bonus.BonusPoints >= options.Value.BonusMaxPoints,
                    max_bonus_points = options.Value.BonusMaxPoints
                },
                ["experience_details"] = new
                {
                    total_years_experience = experienceYears.TotalYears,
                    min_years_required = input.MinYears,
                    years_match_score_normalized = experienceYears.YearsScore,
                    content_relevance_score_normalized = experienceContentSimilarity.Combined,
                    corpus_sources_used = new { work_experience = parsed.WorkExperience.Count, events = parsed.Events.Count, projects = parsed.Projects.Count }
                },
                ["skills_details"] = new
                {
                    required_skill_coverage = skills.RequiredCoverage,
                    matched_required_skills = skills.MatchedRequiredSkills,
                    missing_required_skills = input.RequiredSkills.Where(x => !skills.MatchedRequiredSkills.Contains(x, StringComparer.OrdinalIgnoreCase)).ToList(),
                    boost_applied = skills.BoostApplied > 0,
                    boost_amount = skills.BoostApplied
                },
                ["education_details"] = new
                {
                    min_education_required = input.MinEducation ?? input.Education,
                    resume_highest_education_detected = parsed.Education.Select(x => x.Degree).FirstOrDefault() ?? string.Empty,
                    education_score_normalized = education.Score
                },
                ["summary_details"] = new
                {
                    summary_score_normalized = summaryScore
                },
                ["base_points_before_bonus"] = aggregated.BasePoints,
                ["deprecated_fields"] = new[] { "legacy_component_fields_removed" },
                ["deprecated_legacy_similarity"] = new
                {
                    lexical = new { summary = summarySimilarity.Lexical, experience_content = experienceContentSimilarity.Lexical },
                    semantic = new { summary = summarySimilarity.Semantic, experience_content = experienceContentSimilarity.Semantic },
                    semantic_alpha_used = new { summary = summarySimilarity.AlphaUsed, experience_content = experienceContentSimilarity.AlphaUsed }
                }
            }
        };
    }

    private static (float YearsSplit, float ContentSplit) NormalizeExperienceSplits(float yearsSplit, float contentSplit)
    {
        yearsSplit = Math.Clamp(yearsSplit, 0f, 1f);
        contentSplit = Math.Clamp(contentSplit, 0f, 1f);

        var total = yearsSplit + contentSplit;
        if (total <= 0f)
        {
            return (0.6f, 0.4f);
        }

        return (yearsSplit / total, contentSplit / total);
    }

    private static void ApplySkillBuckets(ResumeTextSections sections, JobDescriptionInput input)
    {
        var required = new HashSet<string>(input.RequiredSkills, StringComparer.OrdinalIgnoreCase);
        var preferred = new HashSet<string>(input.PreferredSkills, StringComparer.OrdinalIgnoreCase);

        var requiredSkills = new List<string>();
        var preferredSkills = new List<string>();
        var otherSkills = new List<string>();

        foreach (var skill in sections.SkillsOtherText.Split([' ', ',', ';', '\n'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            if (required.Contains(skill)) requiredSkills.Add(skill);
            else if (preferred.Contains(skill)) preferredSkills.Add(skill);
            else otherSkills.Add(skill);
        }

        sections.SkillsRequiredText = string.Join(' ', requiredSkills);
        sections.SkillsPreferredText = string.Join(' ', preferredSkills);
        sections.SkillsOtherText = string.Join(' ', otherSkills);
    }
}
