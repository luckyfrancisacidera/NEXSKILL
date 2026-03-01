using System.Text.Json;
using Microsoft.Extensions.Options;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Services.Scoring;
using SkillSense.Domain.Entities;

namespace SkillSense.Application.Tests;

public sealed class ScoringTests
{
    [Fact]
    public void ExperienceYearsCalculator_HandlesPresent()
    {
        var calculator = new ExperienceYearsCalculator(new FixedDateTimeProvider(new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)), Options.Create(new AtsScoringOptions()));
        var resume = SampleResume(startDate: "2022", endDate: "Present");

        var result = calculator.Calculate(resume, requiredYears: 2);

        Assert.True(result.TotalYears >= 3.9f);
        Assert.Equal(1f, result.YearsScore, 3);
    }

    [Fact]
    public void ExperienceYearsCalculator_MinYearsPartial()
    {
        var calculator = new ExperienceYearsCalculator(new FixedDateTimeProvider(new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)), Options.Create(new AtsScoringOptions()));
        var resume = SampleResume(startDate: "2025", endDate: "Present");

        var result = calculator.Calculate(resume, requiredYears: 4);

        Assert.True(result.YearsScore > 0);
        Assert.True(result.YearsScore < 1);
    }

    [Fact]
    public void SkillsMatcher_AppliesBoostAndClamps()
    {
        var matcher = new SkillsMatcher(Options.Create(new AtsScoringOptions { RequiredSkillBoostMax = 0.25f }));
        var resume = SampleResume(skills: ["c#", "sql", "react"]);
        var jd = new JobDescriptionInput
        {
            RequiredSkills = ["C#", "SQL"],
            PreferredSkills = ["React"]
        };

        var result = matcher.Evaluate(jd, resume);

        Assert.Equal(1f, result.RequiredCoverage, 3);
        Assert.True(result.BoostApplied > 0);
        Assert.InRange(result.Score, 0f, 1f);
    }

    [Fact]
    public void EducationEvaluator_MeetsMinimum()
    {
        var evaluator = new EducationEvaluator();
        var resume = SampleResume();
        var jd = new JobDescriptionInput { MinEducation = "Bachelor degree" };

        var result = evaluator.Evaluate(jd, resume);

        Assert.True(result.MeetsMinimum);
        Assert.True(result.Score >= 0.8f);
    }

    [Fact]
    public void BonusEvaluator_EnforcesCap()
    {
        var evaluator = new BonusEvaluator(Options.Create(new AtsScoringOptions
        {
            BonusProjectsPoints = 6,
            BonusCertificationsPoints = 6,
            BonusAchievementsPoints = 6,
            BonusMaxPoints = 10
        }));

        var resume = SampleResume(certificationCount: 1, includeAchievements: true);
        var result = evaluator.Evaluate(resume);

        Assert.Equal(10f, result.BonusPoints, 3);
    }

    [Fact]
    public async Task Orchestrator_FinalScoreClampedTo100()
    {
        var orchestrator = CreateOrchestrator(new AtsScoringOptions
        {
            WorkExperienceWeight = 0.4f,
            SkillsWeight = 0.3f,
            EducationWeight = 0.1f,
            SummaryWeight = 0.05f,
            RequiredSkillBoostMax = 0.3f,
            BonusProjectsPoints = 6f,
            BonusCertificationsPoints = 6f,
            BonusAchievementsPoints = 6f,
            BonusMaxPoints = 10f
        });

        var resume = SampleResume(certificationCount: 1, includeAchievements: true);
        var jd = new JobDescriptionInput
        {
            Text = "Strong backend in dotnet and sql",
            Title = "Senior .NET Engineer",
            MinYears = 1,
            RequiredSkills = ["c#", "sql"]
        };

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, jd, CancellationToken.None);

        Assert.InRange(result.Score.FinalScore, 0f, 100f);
    }

    [Fact]
    public async Task Orchestrator_DurationYearsZeroRegression_DoesNotTankExperience()
    {
        var orchestrator = CreateOrchestrator();

        var resume = SampleResume(startDate: "Sep 2023", endDate: "Present");
        var jd = new JobDescriptionInput
        {
            Text = "Need 1 year experience in software engineering",
            Title = "Software Engineer",
            MinYears = 1,
            MinEducation = "Bachelor"
        };

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, jd, CancellationToken.None);

        Assert.True(result.Score.ExperienceScore > 0.5f);
        Assert.True(result.Score.EducationScore > 0f);

        var json = JsonSerializer.Serialize(result.Score.Breakdown);
        using var doc = JsonDocument.Parse(json);
        var totalYears = doc.RootElement.GetProperty("total_years_experience").GetSingle();
        Assert.True(totalYears >= 1f);
    }


    [Fact]
    public async Task Orchestrator_OutputDoesNotContainResponsibilitiesFields()
    {
        var orchestrator = CreateOrchestrator();
        var resume = SampleResume();
        var jd = new JobDescriptionInput { Text = "Backend role", Title = "Software Engineer", MinYears = 1 };

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, jd, CancellationToken.None);
        var payload = JsonSerializer.Serialize(result.Score);

        Assert.DoesNotContain("responsibil", payload, StringComparison.OrdinalIgnoreCase);
    }

    private static ResumeEmbeddingScoringOrchestrator CreateOrchestrator(AtsScoringOptions? opts = null)
    {
        opts ??= new AtsScoringOptions();
        var options = Options.Create(opts);

        return new ResumeEmbeddingScoringOrchestrator(
            new FakeEmbeddingService(),
            new ExperienceYearsCalculator(new FixedDateTimeProvider(new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)), options),
            new ExperienceContentBuilder(),
            new SimilarityEngine(new FakeEmbeddingService(), options),
            new SkillsMatcher(options),
            new EducationEvaluator(),
            new SummaryScorer(new SimilarityEngine(new FakeEmbeddingService(), options)),
            new BonusEvaluator(options),
            new ScoreAggregator(options),
            options);
    }

    private static ResumeParseResult SampleResume(
        string startDate = "2022",
        string endDate = "Present",
        List<string>? skills = null,
        int certificationCount = 0,
        bool includeAchievements = false) => new()
        {
            PersonalInfo = new PersonalInfo { JobTarget = "Backend Engineer" },
            Summary = ["Backend engineer with .NET and cloud experience"],
            Skills = skills ?? ["c#", "sql", "azure"],
            WorkExperience =
        [
            new WorkExperienceItem
            {
                Company = "Tech Corp",
                JobTitle = "Software Engineer",
                StartDate = startDate,
                EndDate = endDate,
                DescriptionItems = ["Built APIs in .NET and SQL", "Designed secure auth with JWT"],
                EmbeddingText = "Built APIs in .NET and SQL"
            }
        ],
            Education = [new EducationItem { Degree = "Bachelor of Computer Science" }],
            Events = [new EventItem { EmbeddingText = "Led migration and improved reliability" }],
            Projects = [new ProjectItem { EmbeddingText = "Cloud automation project using Azure" }],
            Certifications = Enumerable.Range(0, certificationCount).Select(_ => new CertificationItem { Name = "AWS" }).ToList(),
            Achievements = includeAchievements ? ["Hackathon Winner"] : []
        };
}

internal sealed class FakeEmbeddingService : ITextEmbeddingService
{
    public Task<IReadOnlyList<float>> EmbedAsync(string text, CancellationToken ct = default)
    {
        var len = Math.Max(1, text.Length % 11);
        return Task.FromResult<IReadOnlyList<float>>([len / 10f, 0.5f, 0.25f]);
    }
}

internal sealed class FixedDateTimeProvider(DateTime utcNow) : IDateTimeProvider
{
    public DateTime UtcNow { get; } = utcNow;
}
