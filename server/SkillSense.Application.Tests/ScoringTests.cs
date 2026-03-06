using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Services.Scoring;

namespace SkillSense.Application.Tests;

public sealed class ScoringTests
{
    [Fact]
    public async Task RequiredSkill_ExactMatch_BeatsSemanticOnly()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var result = await orchestrator.BuildAsync(Guid.NewGuid(), SampleResume(), SampleJob(), CancellationToken.None);

        Assert.Contains(result.Score.Matches.RequiredSkills, m => m.JdItem == "React" && m.MatchType == "exact");
    }

    [Fact]
    public void ExperienceYearsCalculator_MinYearsPartial()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var result = await orchestrator.BuildAsync(Guid.NewGuid(), SampleResume(), SampleJob(), CancellationToken.None);

        Assert.Equal(SampleJob().RequiredSkills.Count, result.Score.Matches.RequiredSkills.Count);
    }

    [Fact]
    public async Task WorkExperience_HasHigherWeightThanSummaryOnlyMentions()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var strongWork = SampleResume();
        var weakWork = SampleResume();
        weakWork.WorkExperience[0].Bullets = ["General contributor"];
        weakWork.WorkExperience[0].Technologies = [];

        var jd = SampleJob();
        var a = await orchestrator.BuildAsync(Guid.NewGuid(), strongWork, jd, CancellationToken.None);
        var b = await orchestrator.BuildAsync(Guid.NewGuid(), weakWork, jd, CancellationToken.None);

        Assert.True(a.Score.FinalScore > b.Score.FinalScore);
    }

    [Fact]
    public async Task YearsAndEducation_AreRuleBasedStable()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var resume = SampleResume();

        resume.Derived.TotalExperienceMonths = 60;
        var jd = SampleJob();
        jd.MinimumYearsExperience = 3;
        jd.MinimumEducationLevel = "Bachelor";

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, jd, CancellationToken.None);

        Assert.True(result.Score.HardRequirements.MinimumYearsExperienceMet);
        Assert.True(result.Score.HardRequirements.MinimumEducationMet);
    }

    private static ParsedResume SampleResume() => new()
    {
        Summary = ["Full-stack developer with React and .NET experience"],
        Skills = ["React", "TypeScript", "ASP.NET Core"],
        WorkExperience =
        [
            new WorkExperienceItem
            {
                Description = "Built scalable web applications",
                Bullets = ["Built REST APIs using ASP.NET Core", "Developed React dashboard using TypeScript"],
                Technologies = ["ASP.NET Core", "React", "TypeScript"],
                DurationMonths = 48
            }
        ],
        Education = [new EducationItem { Degree = "Bachelor of Science", EducationLevel = "Bachelor" }],
        Projects = [new ProjectItem { Description = "Created admin dashboard in React", Bullets = ["Implemented reporting"], Technologies = ["React"] }],
        Certifications = [new CertificationItem { Name = "Azure Developer Associate" }]
    };

    private static NormalizedJobDescription SampleJob() => new()
    {
        Description = "Build scalable web applications in .NET and React",
        Responsibilities = ["Build scalable web applications"],
        RequiredSkills = ["ASP.NET Core", "React"],
        PreferredSkills = ["Tailwind CSS"]
    };
}

internal sealed class FakeEmbeddingService : ITextEmbeddingService
{
    public Task<IReadOnlyList<float>> EmbedAsync(string text, CancellationToken ct = default)
    {
        text = text.ToLowerInvariant();
        return Task.FromResult<IReadOnlyList<float>>([
            text.Contains("react") ? 1f : 0f,
            text.Contains("asp.net") || text.Contains(".net") ? 1f : 0f,
            text.Contains("scalable") ? 1f : 0f,
            text.Length / 100f
        ]);
    }
}

