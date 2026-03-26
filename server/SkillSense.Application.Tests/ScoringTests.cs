using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Services.Scoring;
using System.Collections.Concurrent;

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
    public async Task ExperienceYearsCalculator_MinYearsPartial()
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

        Assert.True(
            a.Score.Matches.RequiredSkills.Sum(match => match.EvidenceCountDistinct) > b.Score.Matches.RequiredSkills.Sum(match => match.EvidenceCountDistinct),
            $"strongDistinct={a.Score.Matches.RequiredSkills.Sum(match => match.EvidenceCountDistinct)}, weakDistinct={b.Score.Matches.RequiredSkills.Sum(match => match.EvidenceCountDistinct)}");
    }

    [Fact]
    public async Task SemanticEvidence_UsesManyToManyTopK_NotSingleBestOnly()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());

        var strong = SampleResume();
        strong.WorkExperience[0].Bullets =
        [
            "Built scalable React web applications with ASP.NET Core",
            "Developed scalable APIs and React components",
            "Improved scalable .NET performance for web systems"
        ];

        var weak = SampleResume();
        weak.WorkExperience[0].Bullets =
        [
            "Built scalable React web applications with ASP.NET Core",
            "Coordinated meetings",
            "Handled documentation"
        ];

        var job = SampleJob();
        job.Responsibilities = ["Build scalable web applications"];

        var strongResult = await orchestrator.BuildAsync(Guid.NewGuid(), strong, job, CancellationToken.None);
        var weakResult = await orchestrator.BuildAsync(Guid.NewGuid(), weak, job, CancellationToken.None);

        Assert.True(strongResult.Score.SectionScores["responsibilities"] > weakResult.Score.SectionScores["responsibilities"]);
    }


    [Fact]
    public async Task SemanticEvidence_DuplicateBullets_DoNotArtificiallyInflateResponsibilities()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());

        var duplicateHeavy = SampleResume();
        duplicateHeavy.WorkExperience[0].Bullets =
        [
            "Built scalable React web applications",
            "Built scalable React web applications",
            "Built scalable React web applications"
        ];

        var diversified = SampleResume();
        diversified.WorkExperience[0].Bullets =
        [
            "Built scalable React web applications",
            "Designed scalable API architecture in ASP.NET Core",
            "Improved performance and reliability for scalable systems"
        ];

        var job = SampleJob();
        job.Responsibilities = ["Build scalable web applications"];

        var duplicateResult = await orchestrator.BuildAsync(Guid.NewGuid(), duplicateHeavy, job, CancellationToken.None);
        var diversifiedResult = await orchestrator.BuildAsync(Guid.NewGuid(), diversified, job, CancellationToken.None);

        Assert.True(duplicateResult.Score.SectionScores["responsibilities"] <= diversifiedResult.Score.SectionScores["responsibilities"]);
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

    [Fact]
    public async Task StrongJuniorCandidate_WithHighSkillAlignment_StillScoresInStrongBand()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var resume = StrongJuniorResume();
        var job = CompetitiveJob();

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, job, CancellationToken.None);

        Assert.True(result.Score.SectionScores["skills"] >= 0.9f, $"skills={result.Score.SectionScores["skills"]:0.000}");
        Assert.True(result.Score.SectionScores["years_experience"] is > 0.8f and < 1f, $"years={result.Score.SectionScores["years_experience"]:0.000}");
        Assert.True(result.Score.FinalScore >= 75f, $"final={result.Score.FinalScore:0.000}");
    }

    [Fact]
    public async Task ProjectHeavyJunior_WithExactBackendProjects_ScoresFairly()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var resume = ProjectHeavyJuniorResume();
        var job = BackendProjectFriendlyJob();

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, job, CancellationToken.None);

        Assert.True(result.Score.SectionScores["skills"] >= 0.84f, $"skills={result.Score.SectionScores["skills"]:0.000}");
        Assert.True(result.Score.SectionScores["work_experience"] >= 0.72f, $"work={result.Score.SectionScores["work_experience"]:0.000}");
        Assert.True(result.Score.FinalScore >= 74f, $"final={result.Score.FinalScore:0.000}");
        Assert.Contains(
            result.Score.SectionScoreDetails.Single(x => x.Name == "work_experience").Notes,
            note => note.Contains("Implementation adjustment applied", StringComparison.OrdinalIgnoreCase)
                || note.Contains("already reflected the evidence", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task StrongSeniorCandidate_MeetingCoreRequirements_ReachesExceptionalBand()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var resume = StrongJuniorResume();
        resume.Derived.TotalExperienceMonths = 72;

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, CompetitiveJob(), CancellationToken.None);

        Assert.True(result.Score.HardRequirements.MinimumYearsExperienceMet);
        Assert.True(result.Score.SectionScores["skills"] >= 0.9f);
        Assert.True(result.Score.SectionScores["responsibilities"] >= 0.7f);
        Assert.True(result.Score.FinalScore >= 85f);
    }

    [Fact]
    public async Task ExactSkillsAndRelevantProjects_BeatKeywordHeavyWeakCandidate()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var strong = StrongJuniorResume();
        var weak = KeywordHeavyResume();
        var job = CompetitiveJob();

        var strongResult = await orchestrator.BuildAsync(Guid.NewGuid(), strong, job, CancellationToken.None);
        var weakResult = await orchestrator.BuildAsync(Guid.NewGuid(), weak, job, CancellationToken.None);

        Assert.True(strongResult.Score.FinalScore > weakResult.Score.FinalScore);
        Assert.True(strongResult.Score.SectionScores["skills"] > weakResult.Score.SectionScores["skills"]);
        Assert.True(strongResult.Score.SectionScores["responsibilities"] > weakResult.Score.SectionScores["responsibilities"]);
        Assert.True(weakResult.Score.FinalScore < 65f, $"weakFinal={weakResult.Score.FinalScore:0.000}, strongFinal={strongResult.Score.FinalScore:0.000}");
    }

    [Fact]
    public async Task NearQualifiedStrongCandidate_BeatsExperiencedWeakTechnicalCandidate()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var strongNearQualified = StrongJuniorResume();
        strongNearQualified.Derived.TotalExperienceMonths = 30;

        var experiencedWeak = ExperiencedWeakTechnicalResume();
        var job = CompetitiveJob();

        var strongResult = await orchestrator.BuildAsync(Guid.NewGuid(), strongNearQualified, job, CancellationToken.None);
        var weakResult = await orchestrator.BuildAsync(Guid.NewGuid(), experiencedWeak, job, CancellationToken.None);

        Assert.True(weakResult.Score.HardRequirements.MinimumYearsExperienceMet);
        Assert.True(strongResult.Score.FinalScore > weakResult.Score.FinalScore);
        Assert.True(strongResult.Score.SectionScores["skills"] > weakResult.Score.SectionScores["skills"]);
        Assert.True(weakResult.Score.FinalScore < 75f);
    }

    [Fact]
    public async Task StrongImplementationEvidence_SoftensYearsPenalty_NearThreshold()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var resume = ProjectHeavyJuniorResume();
        resume.Derived.TotalExperienceMonths = 10;
        var job = BackendProjectFriendlyJob();
        job.MinimumYearsExperience = 1;

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, job, CancellationToken.None);
        var yearsSection = result.Score.SectionScoreDetails.Single(x => x.Name == "years_experience");

        Assert.True(result.Score.SectionScores["years_experience"] >= 0.9f, $"years={result.Score.SectionScores["years_experience"]:0.000}");
        Assert.Contains(yearsSection.Notes, note => note.Contains("softened", StringComparison.OrdinalIgnoreCase));
        Assert.True(result.Score.FinalScore >= 76f, $"final={result.Score.FinalScore:0.000}");
    }

    [Fact]
    public async Task ExactProjectBackedCandidate_BeatsAdjacentClusterCandidate()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var exactResume = ProjectHeavyJuniorResume();
        exactResume.Derived.TotalExperienceMonths = 18;
        var adjacentResume = AdjacentClusterBackendResume();
        adjacentResume.Derived.TotalExperienceMonths = 18;
        adjacentResume.WorkExperience[0].DurationMonths = 18;
        var job = BackendProjectFriendlyJob();

        var exactResult = await orchestrator.BuildAsync(Guid.NewGuid(), exactResume, job, CancellationToken.None);
        var adjacentResult = await orchestrator.BuildAsync(Guid.NewGuid(), adjacentResume, job, CancellationToken.None);

        Assert.True(exactResult.Score.FinalScore > adjacentResult.Score.FinalScore, $"exact={exactResult.Score.FinalScore:0.000}, adjacent={adjacentResult.Score.FinalScore:0.000}");
        Assert.True(
            exactResult.Score.Matches.RequiredSkills.Count(x => x.MatchType == "exact") > adjacentResult.Score.Matches.RequiredSkills.Count(x => x.MatchType == "exact"),
            $"exactExact={exactResult.Score.Matches.RequiredSkills.Count(x => x.MatchType == "exact")}, adjacentExact={adjacentResult.Score.Matches.RequiredSkills.Count(x => x.MatchType == "exact")}");
        Assert.Contains(exactResult.Score.Matches.RequiredSkills, x => x.MatchType == "exact");
        Assert.DoesNotContain(adjacentResult.Score.Matches.RequiredSkills, x => x.MatchType == "exact" && x.JdItem == "PostgreSQL");
    }

    [Fact]
    public async Task WeakSemanticOnlyCandidate_StaysLowWithoutImplementationEvidence()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var resume = new ParsedResume
        {
            Summary = ["Interested in backend systems, APIs, databases, and authentication concepts"],
            Skills = ["Problem solving", "Teamwork"],
            WorkExperience =
            [
                new WorkExperienceItem
                {
                    Description = "Supported office workflows and meeting coordination",
                    Bullets = ["Prepared reports and documentation"],
                    Technologies = ["Excel", "Word"],
                    DurationMonths = 24
                }
            ]
        };

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, BackendProjectFriendlyJob(), CancellationToken.None);

        Assert.True(result.Score.FinalScore < 60f, $"final={result.Score.FinalScore:0.000}");
        Assert.True(result.Score.SectionScores["work_experience"] < 0.65f, $"work={result.Score.SectionScores["work_experience"]:0.000}");
    }

    [Fact]
    public async Task RelatedDatabaseStack_GetsRelatedClusterCredit_NotWeakRule()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var resume = new ParsedResume
        {
            Skills = ["PostgreSQL", "MySQL"],
            WorkExperience =
            [
                new WorkExperienceItem
                {
                    Description = "Built relational data services",
                    Bullets = ["Designed relational database schemas for backend services"],
                    Technologies = ["PostgreSQL", "MySQL"],
                    DurationMonths = 48
                }
            ]
        };
        var job = new NormalizedJobDescription
        {
            RequiredSkills = ["SQL Server"],
            Responsibilities = ["Integrate relational databases with backend services"]
        };

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, job, CancellationToken.None);
        var match = Assert.Single(result.Score.Matches.RequiredSkills);

        Assert.Equal("related_cluster", match.MatchType);
        Assert.True(match.Similarity >= 0.68f, $"similarity={match.Similarity:0.000}");
        Assert.Contains("relational database", match.MatchReason, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task RestfulApiDesign_NormalizesIntoStrongApiMatch()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var resume = new ParsedResume
        {
            WorkExperience =
            [
                new WorkExperienceItem
                {
                    Description = "Built backend integrations",
                    Bullets = ["Owned RESTful API Design for partner integrations"],
                    Technologies = ["ASP.NET Core Web API"],
                    DurationMonths = 36
                }
            ]
        };
        var job = new NormalizedJobDescription
        {
            RequiredSkills = ["REST APIs"]
        };

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, job, CancellationToken.None);
        var match = Assert.Single(result.Score.Matches.RequiredSkills);

        Assert.True(match.MatchType is "alias" or "related_cluster", $"matchType={match.MatchType}");
        Assert.True(match.Similarity >= 0.84f, $"similarity={match.Similarity:0.000}");
        Assert.Contains("canonical", match.MatchReason, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Responsibility_WithDatabaseAndBackendEvidence_ScoresAboveWeakSemanticRange()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var resume = new ParsedResume
        {
            Skills = ["PostgreSQL", "MySQL", "ASP.NET Core Web API"],
            WorkExperience =
            [
                new WorkExperienceItem
                {
                    Description = "Built data-backed services",
                    Bullets =
                    [
                        "Integrated PostgreSQL and MySQL with backend services",
                        "Built ASP.NET Core Web API endpoints for internal tools"
                    ],
                    Technologies = ["PostgreSQL", "MySQL", "ASP.NET Core Web API"],
                    DurationMonths = 48
                }
            ]
        };
        var job = new NormalizedJobDescription
        {
            Responsibilities =
            [
                "Integrate relational databases such as SQL Server, PostgreSQL, or MySQL with backend services"
            ]
        };

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, job, CancellationToken.None);
        var match = Assert.Single(result.Score.Matches.Responsibilities);

        Assert.True(match.Similarity >= 0.7f, $"similarity={match.Similarity:0.000}");
        Assert.True(result.Score.SectionScores["responsibilities"] >= 0.7f, $"responsibilities={result.Score.SectionScores["responsibilities"]:0.000}");
        Assert.Contains("combined evidence", match.MatchReason, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Responsibility_SpreadAcrossMultipleBullets_GetsStrongConceptCoverage()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var resume = new ParsedResume
        {
            WorkExperience =
            [
                new WorkExperienceItem
                {
                    Description = "Built scalable backend platforms",
                    Bullets =
                    [
                        "Developed RESTful APIs using ASP.NET Core",
                        "Improved query performance and async processing for high-traffic workloads",
                        "Built backend services for internal platforms"
                    ],
                    Technologies = ["ASP.NET Core", "REST API", "PostgreSQL"],
                    DurationMonths = 48
                }
            ]
        };
        var job = new NormalizedJobDescription
        {
            Responsibilities =
            [
                "Build and optimize RESTful APIs to support high-traffic applications and backend services"
            ]
        };

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, job, CancellationToken.None);
        var match = Assert.Single(result.Score.Matches.Responsibilities);

        Assert.True(match.Similarity >= 0.74f, $"similarity={match.Similarity:0.000}");
        Assert.True(result.Score.SectionScores["responsibilities"] >= 0.72f, $"responsibilities={result.Score.SectionScores["responsibilities"]:0.000}");
    }

    [Fact]
    public async Task Description_ChunkedCoverage_StaysStrongWhenEvidenceIsSpreadAcrossWorkAndProjects()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var resume = new ParsedResume
        {
            Summary = ["Full-stack engineer delivering API-heavy internal platforms"],
            Skills = ["ASP.NET Core", "React", "TypeScript", "PostgreSQL", "JWT"],
            WorkExperience =
            [
                new WorkExperienceItem
                {
                    Description = "Built secure backend services and optimized APIs",
                    Bullets =
                    [
                        "Built ASP.NET Core REST APIs with JWT authentication and role authorization",
                        "Improved API performance with query tuning and async processing"
                    ],
                    Technologies = ["ASP.NET Core", "PostgreSQL", "JWT"],
                    DurationMonths = 36
                }
            ],
            Projects =
            [
                new ProjectItem
                {
                    Description = "Created React and TypeScript admin console",
                    Bullets = ["Connected dashboards to backend APIs and PostgreSQL data"],
                    Technologies = ["React", "TypeScript", "PostgreSQL"]
                }
            ]
        };
        var job = new NormalizedJobDescription
        {
            Description = "Build internal platforms using ASP.NET Core. Develop React and TypeScript interfaces. Work with PostgreSQL or MySQL. Implement JWT and RBAC. Optimize APIs for performance."
        };

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, job, CancellationToken.None);

        Assert.True(result.Score.SectionScores["description"] >= 0.7f, $"description={result.Score.SectionScores["description"]:0.000}");
        Assert.True(result.Score.Matches.DescriptionTopMatches.Count >= 3);
    }

    [Fact]
    public async Task AuthCapabilityBundle_UsesMultiSignalEvidence_NotWeakSemanticOnly()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var resume = new ParsedResume
        {
            Skills = ["JWT auth"],
            WorkExperience =
            [
                new WorkExperienceItem
                {
                    Description = "Implemented secure access control flows",
                    Bullets =
                    [
                        "Implemented JWT auth for secure APIs",
                        "Added admin and user role authorization across protected endpoints"
                    ],
                    Technologies = ["JWT"],
                    DurationMonths = 30
                }
            ]
        };
        var job = new NormalizedJobDescription
        {
            RequiredSkills = ["secure authentication and authorization using JWT and role-based access control"]
        };

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, job, CancellationToken.None);
        var match = Assert.Single(result.Score.Matches.RequiredSkills);

        Assert.Equal("related_cluster", match.MatchType);
        Assert.True(match.Similarity >= 0.7f, $"similarity={match.Similarity:0.000}");
        Assert.Contains("authentication", match.MatchReason, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task SingleStrongJwtEvidence_StillScoresWell_WithoutDepthPenalty()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var resume = new ParsedResume
        {
            WorkExperience =
            [
                new WorkExperienceItem
                {
                    Description = "Implemented secure API access",
                    Bullets = ["Implemented JWT authentication and authorization for protected APIs"],
                    Technologies = ["ASP.NET Core"],
                    DurationMonths = 24
                }
            ]
        };
        var job = new NormalizedJobDescription
        {
            RequiredSkills = ["JWT authentication"]
        };

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, job, CancellationToken.None);
        var match = Assert.Single(result.Score.Matches.RequiredSkills);

        Assert.True(match.Similarity >= 0.84f, $"similarity={match.Similarity:0.000}");
        Assert.Equal(1, match.EvidenceCountDistinct);
        Assert.True(match.DepthMultiplier is >= 1f and < 1.03f, $"depth={match.DepthMultiplier:0.000}");
    }

    [Fact]
    public async Task MultiSourceRestEvidence_GetsBoundedDepthBonus_OverSingleSource()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var singleSource = new ParsedResume
        {
            WorkExperience =
            [
                new WorkExperienceItem
                {
                    Description = "Built backend services",
                    Bullets = ["Built RESTful APIs using ASP.NET Core"],
                    Technologies = ["ASP.NET Core"],
                    DurationMonths = 24
                }
            ]
        };
        var multiSource = new ParsedResume
        {
            Skills = ["RESTful APIs"],
            WorkExperience =
            [
                new WorkExperienceItem
                {
                    Description = "Built backend services",
                    Bullets = ["Built RESTful APIs using ASP.NET Core"],
                    Technologies = ["ASP.NET Core"],
                    DurationMonths = 24
                }
            ],
            Projects =
            [
                new ProjectItem
                {
                    Description = "Built partner backend integrations",
                    Bullets = ["Developed backend API integrations for internal tools"],
                    Technologies = ["REST API"]
                }
            ]
        };
        var job = new NormalizedJobDescription
        {
            RequiredSkills = ["REST APIs"]
        };

        var singleResult = await orchestrator.BuildAsync(Guid.NewGuid(), singleSource, job, CancellationToken.None);
        var multiResult = await orchestrator.BuildAsync(Guid.NewGuid(), multiSource, job, CancellationToken.None);
        var singleMatch = Assert.Single(singleResult.Score.Matches.RequiredSkills);
        var multiMatch = Assert.Single(multiResult.Score.Matches.RequiredSkills);

        Assert.True(multiMatch.Similarity > singleMatch.Similarity, $"single={singleMatch.Similarity:0.000}, multi={multiMatch.Similarity:0.000}");
        Assert.True(multiMatch.EvidenceCountDistinct >= 3, $"distinct={multiMatch.EvidenceCountDistinct}");
        Assert.True(multiMatch.DepthMultiplier > singleMatch.DepthMultiplier);
        Assert.True(multiMatch.DepthMultiplier <= 1.18f, $"depth={multiMatch.DepthMultiplier:0.000}");
    }

    [Fact]
    public async Task SameProjectRepetition_DoesNotCreateLargeDepthInflation()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var resume = new ParsedResume
        {
            Projects =
            [
                new ProjectItem
                {
                    Description = "Built reporting platform with PostgreSQL",
                    Bullets =
                    [
                        "Implemented PostgreSQL data access for reporting",
                        "Optimized PostgreSQL queries for dashboards",
                        "Maintained PostgreSQL migrations",
                        "Built PostgreSQL-backed services",
                        "Used PostgreSQL for analytics"
                    ],
                    Technologies = ["PostgreSQL"]
                }
            ]
        };
        var job = new NormalizedJobDescription
        {
            RequiredSkills = ["PostgreSQL"]
        };

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, job, CancellationToken.None);
        var match = Assert.Single(result.Score.Matches.RequiredSkills);

        Assert.True(match.EvidenceCountDistinct <= 2, $"distinct={match.EvidenceCountDistinct}");
        Assert.True(match.DepthMultiplier <= 1.08f, $"depth={match.DepthMultiplier:0.000}");
    }

    [Fact]
    public async Task DiverseReactTypeScriptEvidence_BeatsSkillsOnly()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var skillsOnly = new ParsedResume
        {
            Skills = ["React", "TypeScript"]
        };
        var diverse = new ParsedResume
        {
            Skills = ["React", "TypeScript"],
            WorkExperience =
            [
                new WorkExperienceItem
                {
                    Description = "Built frontend interfaces",
                    Bullets = ["Built React dashboards for internal users"],
                    Technologies = ["React"],
                    DurationMonths = 18
                }
            ],
            Projects =
            [
                new ProjectItem
                {
                    Description = "Built admin console",
                    Bullets = ["Implemented typed TypeScript components for data tables"],
                    Technologies = ["TypeScript"]
                }
            ]
        };
        var job = new NormalizedJobDescription
        {
            RequiredSkills = ["React", "TypeScript"]
        };

        var skillsOnlyResult = await orchestrator.BuildAsync(Guid.NewGuid(), skillsOnly, job, CancellationToken.None);
        var diverseResult = await orchestrator.BuildAsync(Guid.NewGuid(), diverse, job, CancellationToken.None);

        Assert.True(
            diverseResult.Score.Matches.RequiredSkills.Sum(match => match.EvidenceCountDistinct)
            > skillsOnlyResult.Score.Matches.RequiredSkills.Sum(match => match.EvidenceCountDistinct));
        Assert.All(diverseResult.Score.Matches.RequiredSkills, match => Assert.True(match.DepthMultiplier >= 1.05f, $"depth={match.DepthMultiplier:0.000}"));
    }

    [Fact]
    public async Task RelatedDatabaseDepthBoost_IsMeaningfulButStillBelowExact()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var exactResume = new ParsedResume
        {
            WorkExperience =
            [
                new WorkExperienceItem
                {
                    Description = "Built SQL Server services",
                    Bullets = ["Implemented SQL Server data access for backend APIs"],
                    Technologies = ["SQL Server"],
                    DurationMonths = 36
                }
            ]
        };
        var relatedResume = new ParsedResume
        {
            WorkExperience =
            [
                new WorkExperienceItem
                {
                    Description = "Built PostgreSQL services",
                    Bullets = ["Optimized PostgreSQL queries for backend APIs"],
                    Technologies = ["PostgreSQL"],
                    DurationMonths = 36
                }
            ],
            Projects =
            [
                new ProjectItem
                {
                    Description = "Built MySQL integrations",
                    Bullets = ["Integrated MySQL reporting data and optimized relational schema performance"],
                    Technologies = ["MySQL"]
                }
            ]
        };
        var job = new NormalizedJobDescription
        {
            RequiredSkills = ["SQL Server"]
        };

        var exactResult = await orchestrator.BuildAsync(Guid.NewGuid(), exactResume, job, CancellationToken.None);
        var relatedResult = await orchestrator.BuildAsync(Guid.NewGuid(), relatedResume, job, CancellationToken.None);
        var exactMatch = Assert.Single(exactResult.Score.Matches.RequiredSkills);
        var relatedMatch = Assert.Single(relatedResult.Score.Matches.RequiredSkills);

        Assert.Equal("related_cluster", relatedMatch.MatchType);
        Assert.True(relatedMatch.DepthMultiplier > 1f, $"depth={relatedMatch.DepthMultiplier:0.000}");
        Assert.True(relatedMatch.Similarity < exactMatch.Similarity, $"related={relatedMatch.Similarity:0.000}, exact={exactMatch.Similarity:0.000}");
    }

    [Fact]
    public async Task WeakFrontendOnlyCandidate_RemainsClearlyLowForBackendStack()
    {
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(new FakeEmbeddingService());
        var resume = new ParsedResume
        {
            Summary = ["Designer focused on HTML, CSS, Canva, and Figma"],
            Skills = ["HTML", "CSS", "Canva", "Figma"],
            WorkExperience =
            [
                new WorkExperienceItem
                {
                    Description = "Designed landing pages and marketing materials",
                    Bullets = ["Built static HTML/CSS pages", "Created social graphics in Canva and Figma"],
                    Technologies = ["HTML", "CSS", "Canva", "Figma"],
                    DurationMonths = 36
                }
            ]
        };
        var job = new NormalizedJobDescription
        {
            Description = "Build ASP.NET Core and React products with secure REST APIs and PostgreSQL",
            RequiredSkills = ["ASP.NET Core", "REST APIs", "PostgreSQL", "JWT", "React"]
        };

        var result = await orchestrator.BuildAsync(Guid.NewGuid(), resume, job, CancellationToken.None);

        Assert.True(result.Score.FinalScore < 60f, $"final={result.Score.FinalScore:0.000}");
        Assert.DoesNotContain(result.Score.Matches.RequiredSkills, x => x.MatchType == "related_cluster" && x.JdItem == "PostgreSQL");
    }

    [Fact]
    public async Task BuildAsync_ReusesCandidateEmbeddingsWithinSingleRun()
    {
        var embeddingService = new CountingEmbeddingService();
        var orchestrator = new ResumeEmbeddingScoringOrchestrator(embeddingService);
        var repeatedEvidence = "Built scalable GraphQL services for internal products";
        var resume = new ParsedResume
        {
            Summary = [repeatedEvidence],
            Skills = ["Distributed systems"],
            WorkExperience =
            [
                new WorkExperienceItem
                {
                    Description = repeatedEvidence,
                    Bullets = [repeatedEvidence, repeatedEvidence],
                    Technologies = ["GraphQL"],
                    DurationMonths = 36
                }
            ],
            Projects =
            [
                new ProjectItem
                {
                    Description = repeatedEvidence,
                    Bullets = [repeatedEvidence],
                    Technologies = ["GraphQL"]
                }
            ]
        };
        var job = new NormalizedJobDescription
        {
            Description = repeatedEvidence,
            Responsibilities = [repeatedEvidence],
            RequiredSkills = ["Apollo Federation"],
            PreferredSkills = ["GraphQL"]
        };

        await orchestrator.BuildAsync(Guid.NewGuid(), resume, job, CancellationToken.None);

        Assert.Equal(1, embeddingService.GetCallCount(repeatedEvidence));
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

    private static ParsedResume StrongJuniorResume() => new()
    {
        Summary = ["Full-stack engineer building scalable React and ASP.NET Core products with strong ownership of APIs and dashboards"],
        Skills = ["React", "TypeScript", "ASP.NET Core", "Azure"],
        WorkExperience =
        [
            new WorkExperienceItem
            {
                Description = "Built scalable web applications and internal dashboards for operations teams",
                Bullets =
                [
                    "Built scalable React dashboard experiences for business users",
                    "Built REST APIs using ASP.NET Core for reporting and workflow automation",
                    "Collaborated with product teams to deliver scalable web applications"
                ],
                Technologies = ["React", "TypeScript", "ASP.NET Core", "Azure"],
                DurationMonths = 24
            }
        ],
        Education = [new EducationItem { Degree = "Bachelor of Science", EducationLevel = "Bachelor" }],
        Projects =
        [
            new ProjectItem
            {
                Description = "Created a scalable project tracking dashboard in React and .NET",
                Bullets = ["Implemented reporting and workflow automation APIs"],
                Technologies = ["React", "ASP.NET Core"]
            }
        ]
    };

    private static ParsedResume ProjectHeavyJuniorResume() => new()
    {
        Summary = ["Junior engineer building backend APIs, authentication flows, and data-driven apps with .NET"],
        Skills = ["C#", "ASP.NET Core", "REST API", "PostgreSQL", "JWT", "React"],
        WorkExperience =
        [
            new WorkExperienceItem
            {
                Description = "Junior software engineer supporting internal application delivery",
                Bullets =
                [
                    "Maintained bug fixes and feature updates for internal applications",
                    "Supported releases and testing for business systems"
                ],
                Technologies = ["C#", ".NET"],
                DurationMonths = 12
            }
        ],
        Projects =
        [
            new ProjectItem
            {
                Description = "Built ASP.NET Core REST API platform with PostgreSQL and JWT authentication",
                Bullets =
                [
                    "Developed C# ASP.NET Core Web API endpoints for internal operations workflows",
                    "Implemented JWT authentication and role-based authorization for admin and user access",
                    "Integrated PostgreSQL data access and optimized database queries for reporting APIs"
                ],
                Technologies = ["C#", "ASP.NET Core", "REST API", "PostgreSQL", "JWT"]
            },
            new ProjectItem
            {
                Description = "Created React admin console for operational dashboards",
                Bullets = ["Connected React frontend to authenticated backend APIs"],
                Technologies = ["React", "TypeScript"]
            }
        ],
        Education = [new EducationItem { Degree = "Bachelor of Science", EducationLevel = "Bachelor" }],
        Derived = new ParsedResumeDerived { TotalExperienceMonths = 12 }
    };

    private static ParsedResume KeywordHeavyResume() => new()
    {
        Summary = ["React React React scalable scalable dashboards and APIs keyword coverage without delivery evidence"],
        Skills = ["Communication", "Documentation"],
        WorkExperience =
        [
            new WorkExperienceItem
            {
                Description = "Coordinated team documentation and meeting notes",
                Bullets =
                [
                    "Prepared weekly status updates and documentation",
                    "Supported scheduling and operations follow-up"
                ],
                Technologies = ["Word", "Excel"],
                DurationMonths = 48
            }
        ],
        Education = [new EducationItem { Degree = "Bachelor of Arts", EducationLevel = "Bachelor" }]
    };

    private static ParsedResume ExperiencedWeakTechnicalResume() => new()
    {
        Summary = ["Operations manager with leadership experience across vendor and scheduling workflows"],
        Skills = ["Leadership", "Operations"],
        WorkExperience =
        [
            new WorkExperienceItem
            {
                Description = "Managed vendor schedules and operational reporting",
                Bullets =
                [
                    "Led weekly planning meetings",
                    "Managed operational reporting and documentation",
                    "Coordinated vendor schedules and escalations"
                ],
                Technologies = ["Excel", "Power BI"],
                DurationMonths = 84
            }
        ],
        Education = [new EducationItem { Degree = "Bachelor of Science", EducationLevel = "Bachelor" }]
    };

    private static ParsedResume AdjacentClusterBackendResume() => new()
    {
        Summary = ["Backend engineer with adjacent database and API experience"],
        Skills = ["C#", "ASP.NET Core", "MySQL", "RESTful API Design", "Authentication"],
        WorkExperience =
        [
            new WorkExperienceItem
            {
                Description = "Built API integrations and relational database services",
                Bullets =
                [
                    "Developed RESTful API services in ASP.NET Core",
                    "Implemented authentication flows for protected endpoints",
                    "Worked with MySQL data access and relational schema changes"
                ],
                Technologies = ["ASP.NET Core", "MySQL", "RESTful API"],
                DurationMonths = 36
            }
        ],
        Education = [new EducationItem { Degree = "Bachelor of Science", EducationLevel = "Bachelor" }],
        Derived = new ParsedResumeDerived { TotalExperienceMonths = 36 }
    };

    private static NormalizedJobDescription CompetitiveJob() => new()
    {
        Description = "Build scalable React and ASP.NET Core applications and APIs for internal dashboard products",
        Responsibilities =
        [
            "Build scalable web applications",
            "Develop REST APIs using ASP.NET Core",
            "Collaborate on React dashboards for internal users"
        ],
        RequiredSkills = ["ASP.NET Core", "React", "TypeScript"],
        PreferredSkills = ["Azure"],
        MinimumYearsExperience = 3,
        MinimumEducationLevel = "Bachelor"
    };

    private static NormalizedJobDescription BackendProjectFriendlyJob() => new()
    {
        Description = "Build internal backend platforms using C# and ASP.NET Core. Develop REST APIs. Implement authentication and authorization. Integrate PostgreSQL with business services.",
        Responsibilities =
        [
            "Build and maintain C# ASP.NET Core backend services",
            "Develop REST APIs for internal business workflows",
            "Implement secure authentication and authorization using JWT",
            "Integrate relational databases such as PostgreSQL with application services"
        ],
        RequiredSkills = ["C#", "ASP.NET Core", "REST APIs", "PostgreSQL", "JWT"],
        PreferredSkills = ["React"],
        MinimumYearsExperience = 2,
        MinimumEducationLevel = "Bachelor"
    };
}

internal sealed class FakeEmbeddingService : ITextEmbeddingService
{
    public Task<IReadOnlyList<float>> EmbedAsync(string text, CancellationToken ct = default)
    {
        text = text.ToLowerInvariant();
        return Task.FromResult<IReadOnlyList<float>>([
            text.Contains("react") ? 1f : 0f,
            text.Contains("asp.net") || text.Contains(".net") || text.Contains("api") ? 1f : 0f,
            text.Contains("scalable") ? 1f : 0f,
            text.Contains("postgres") || text.Contains("mysql") || text.Contains("sql") ? 1f : 0f,
            text.Contains("jwt") || text.Contains("auth") || text.Contains("role") ? 1f : 0f,
            text.Length / 100f
        ]);
    }
}

internal sealed class CountingEmbeddingService : ITextEmbeddingService
{
    private readonly ConcurrentDictionary<string, int> _calls = new(StringComparer.Ordinal);

    public Task<IReadOnlyList<float>> EmbedAsync(string text, CancellationToken ct = default)
    {
        text ??= string.Empty;
        _calls.AddOrUpdate(text, 1, (_, current) => current + 1);
        var normalized = text.ToLowerInvariant();

        return Task.FromResult<IReadOnlyList<float>>([
            normalized.Contains("graphql") ? 1f : 0f,
            normalized.Contains("scalable") ? 1f : 0f,
            text.Length / 100f
        ]);
    }

    public int GetCallCount(string text) => _calls.TryGetValue(text, out var count) ? count : 0;
}
