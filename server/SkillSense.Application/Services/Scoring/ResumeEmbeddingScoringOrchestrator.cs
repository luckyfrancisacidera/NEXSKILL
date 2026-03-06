using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Contracts.Scoring.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Domain.Entities;

namespace SkillSense.Application.Services.Scoring;

public sealed class ResumeEmbeddingScoringOrchestrator(ITextEmbeddingService embeddingService) : IResumeScoringOrchestrator
{
    private const float WorkWeight = 0.35f;
    private const float SkillsWeight = 0.25f;
    private const float ResponsibilitiesWeight = 0.20f;
    private const float DescriptionWeight = 0.10f;
    private const float EducationWeight = 0.05f;
    private const float YearsWeight = 0.05f;
    private const float SemanticSkillThreshold = 0.72f;

    public async Task<(List<ResumeEmbeddingEntity> Embeddings, FinalMatchScore Score)> BuildAsync(Guid submissionId, ParsedResume resume, NormalizedJobDescription job, CancellationToken ct)
    {
        var requiredMatches = await MatchSkillsAsync(job.RequiredSkills, BuildSkillCandidates(resume), ct, true);
        var preferredMatches = await MatchSkillsAsync(job.PreferredSkills, BuildSkillCandidates(resume), ct, false);
        var responsibilityMatches = await MatchResponsibilitiesAsync(job.Responsibilities, resume, ct);
        var descriptionMatches = await MatchDescriptionAsync(job.Description, resume, ct);

        var requiredScore = requiredMatches.Count == 0 ? 1f : requiredMatches.Average(x => x.Similarity);
        var preferredScore = preferredMatches.Count == 0 ? 1f : preferredMatches.Average(x => x.Similarity);
        var skillsScore = Math.Clamp(requiredScore * 0.8f + preferredScore * 0.2f, 0f, 1f);
        var responsibilitiesScore = responsibilityMatches.Count == 0 ? 0f : responsibilityMatches.Average(x => x.Similarity);
        var descriptionScore = descriptionMatches.Count == 0 ? 0f : descriptionMatches.Max(x => x.Similarity);
        var educationScore = ScoreEducation(job.MinimumEducationLevel, resume);
        var yearsScore = ScoreYears(job.MinimumYearsExperience, resume);
        var workScore = Math.Clamp((responsibilitiesScore * 0.4f) + (descriptionScore * 0.3f) + (requiredScore * 0.3f), 0f, 1f);

        var sectionScores = new Dictionary<string, float>
        {
            ["work_experience"] = workScore,
            ["skills"] = skillsScore,
            ["responsibilities"] = responsibilitiesScore,
            ["description"] = descriptionScore,
            ["education"] = educationScore,
            ["years_experience"] = yearsScore
        };

        var final = (workScore * WorkWeight + skillsScore * SkillsWeight + responsibilitiesScore * ResponsibilitiesWeight + descriptionScore * DescriptionWeight + educationScore * EducationWeight + yearsScore * YearsWeight) * 100f;

        return ([], new FinalMatchScore
        {
            FinalScore = Math.Clamp(final, 0f, 100f),
            SectionScores = sectionScores,
            SectionScoreDetails =
            [
                new SectionScore { Name = "work_experience", Score = workScore, Weight = WorkWeight, MatchedItems = requiredMatches.Concat(responsibilityMatches).Take(5).ToList() },
                new SectionScore { Name = "skills", Score = skillsScore, Weight = SkillsWeight, MatchedItems = requiredMatches.Concat(preferredMatches).ToList() },
                new SectionScore { Name = "responsibilities", Score = responsibilitiesScore, Weight = ResponsibilitiesWeight, MatchedItems = responsibilityMatches },
                new SectionScore { Name = "description", Score = descriptionScore, Weight = DescriptionWeight, MatchedItems = descriptionMatches },
                new SectionScore { Name = "education", Score = educationScore, Weight = EducationWeight, Notes = [job.MinimumEducationLevel] },
                new SectionScore { Name = "years_experience", Score = yearsScore, Weight = YearsWeight, Notes = [job.MinimumYearsExperience.ToString()] }
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
            var normalized = NormalizeSkill(jdSkill);
            var exact = candidates.FirstOrDefault(c => NormalizeSkill(c.Text) == normalized);
            if (!string.IsNullOrEmpty(exact.Text))
            {
                results.Add(new MatchEvidence { JdItem = jdSkill, BestResumeEvidence = exact.Text, Source = exact.Source, Similarity = exact.Source.StartsWith("work_experience") ? 1f : 0.95f, MatchType = "exact" });
                continue;
            }

            var semantic = await BestSemanticMatchAsync(jdSkill, candidates, ct);
            if (semantic.Similarity >= SemanticSkillThreshold)
            {
                semantic.MatchType = required ? "semantic" : "semantic";
                results.Add(semantic);
            }
            else if (required)
            {
                results.Add(new MatchEvidence { JdItem = jdSkill, BestResumeEvidence = string.Empty, Source = string.Empty, Similarity = 0f, MatchType = "rule" });
            }
        }
        return results;
    }

    private async Task<List<MatchEvidence>> MatchResponsibilitiesAsync(List<string> responsibilities, ParsedResume resume, CancellationToken ct)
    {
        var candidates = resume.WorkExperience.SelectMany(w => w.Bullets.Select(b => (b, "work_experience.bullets")))
            .Concat(resume.WorkExperience.Select(w => (w.Description, "work_experience.description")))
            .Concat(resume.Projects.SelectMany(p => p.Bullets.Select(b => (b, "projects.bullets"))))
            .Concat(resume.Projects.Select(p => (p.Description, "projects.description")))
            .Where(x => !string.IsNullOrWhiteSpace(x.Item1)).ToList();

        var matches = new List<MatchEvidence>();
        foreach (var r in responsibilities.Where(x => !string.IsNullOrWhiteSpace(x))) matches.Add(await BestSemanticMatchAsync(r, candidates, ct));
        return matches;
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
        return [await BestSemanticMatchAsync("overall_description", candidates, ct, jdDescription)];
    }

    private async Task<MatchEvidence> BestSemanticMatchAsync(string jdItem, List<(string Text, string Source)> candidates, CancellationToken ct, string? queryOverride = null)
    {
        if (candidates.Count == 0) return new MatchEvidence { JdItem = jdItem, Similarity = 0f, MatchType = "rule" };
        var query = queryOverride ?? jdItem;
        var qVec = await embeddingService.EmbedAsync(query, ct);
        MatchEvidence? best = null;
        foreach (var c in candidates)
        {
            var vec = await embeddingService.EmbedAsync(c.Text, ct);
            var sim = SimilarityMath.CosineSimilarity(qVec, vec);
            if (best is null || sim > best.Similarity)
            {
                best = new MatchEvidence { JdItem = jdItem, BestResumeEvidence = c.Text, Source = c.Source, Similarity = sim, MatchType = "semantic" };
            }
        }

        return best!;
    }

    private static string NormalizeSkill(string skill) => skill.Trim().ToLowerInvariant().Replace(".", string.Empty).Replace(" ", string.Empty);

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
}
