using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Contracts.Scoring.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Services.Recruiter;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Application.Tests;

public sealed class CandidateExplanationServiceTests
{
    [Fact]
    public async Task GenerateForShortlistedAsync_UsesStructuredEvidenceToAvoidFalseMissingAndFalseExactClaims()
    {
        var payload = BuildPayload(
            requiredSkills: ["C#", "SQL Server", "REST APIs"],
            responsibilities:
            [
                Match("Design, develop, and maintain scalable web applications using ASP.NET Core and modern frontend frameworks",
                    "Built ASP.NET Core APIs and React/TypeScript UI components for internal platforms",
                    "semantic", 0.82f, "projects[0].bullets[0]", "projects")
            ],
            description:
            [
                Match("ASP.NET Core, React, TypeScript, REST APIs",
                    "Built ASP.NET Core Web API services and React dashboards with TypeScript",
                    "semantic", 0.84f, "projects[0].summary", "projects")
            ],
            requiredSkillMatches:
            [
                Match("C#", "C#, ASP.NET Core, and LINQ", "exact", 0.97f, "skills[0]", "skills"),
                Match("SQL Server", "PostgreSQL and MySQL database design for backend services", "related_cluster", 0.74f, "projects[0].bullets[1]", "projects"),
                Match("REST APIs", "Built RESTful APIs using ASP.NET Core", "alias", 0.93f, "work_experience[0].bullets[0]", "work_experience")
            ]);

        var provider = new StubExplanationProvider(new CandidateStructuredExplanation
        {
            Summary = "Missing required skills in C# and LINQ. Demonstrated expertise in SQL Server.",
            Strengths = ["Missing C#.", "Demonstrated expertise in SQL Server."],
            Gaps = ["Missing REST APIs."]
        });

        var repository = new RecordingCandidateExplanationRepository(payload);
        var service = new CandidateExplanationService(repository, provider, NullLogger<CandidateExplanationService>.Instance);

        await service.GenerateForShortlistedAsync(Guid.NewGuid(), payload.Submission.Id, CancellationToken.None);

        var stored = repository.Stored.Single();
        var strengths = DeserializeList(stored.StrengthsJson);
        var gaps = DeserializeList(stored.GapsJson);
        var explanationText = stored.ExplanationText.ToLowerInvariant();

        Assert.Equal(ExplanationStatus.Succeeded, stored.Status);
        Assert.DoesNotContain("missing c#", explanationText, StringComparison.Ordinal);
        Assert.DoesNotContain("expertise in sql server", explanationText, StringComparison.Ordinal);
        Assert.Contains(strengths, x => x.Contains("C#", StringComparison.OrdinalIgnoreCase));
        Assert.Contains(strengths, x => x.Contains("REST APIs", StringComparison.OrdinalIgnoreCase));
        Assert.Contains(gaps, x => x.Contains("SQL Server", StringComparison.OrdinalIgnoreCase));
        Assert.Contains(gaps, x => x.Contains("PostgreSQL", StringComparison.OrdinalIgnoreCase) || x.Contains("MySQL", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task GenerateForShortlistedAsync_PreservesStrongResponsibilityAndApiAlignment()
    {
        var payload = BuildPayload(
            requiredSkills: ["REST APIs", "ASP.NET Core"],
            responsibilities:
            [
                Match("Build and optimize RESTful APIs to support high-traffic applications and backend services",
                    "Developed RESTful APIs using ASP.NET Core and improved async processing performance",
                    "semantic", 0.86f, "work_experience[0].bullets[1]", "work_experience")
            ],
            description:
            [
                Match("API optimization and backend services",
                    "Improved query performance and backend API throughput",
                    "semantic", 0.79f, "projects[0].bullets[0]", "projects")
            ],
            requiredSkillMatches:
            [
                Match("REST APIs", "RESTful API Design and ASP.NET Core Web API delivery", "alias", 0.94f, "projects[0].summary", "projects"),
                Match("ASP.NET Core", "Built backend services in ASP.NET Core", "exact", 0.95f, "work_experience[0].bullets[0]", "work_experience")
            ]);

        var provider = new StubExplanationProvider(new CandidateStructuredExplanation
        {
            Summary = "Missing responsibility in building RESTful APIs.",
            Strengths = ["Missing REST APIs."],
            Gaps = ["Missing backend services responsibility."]
        });

        var repository = new RecordingCandidateExplanationRepository(payload);
        var service = new CandidateExplanationService(repository, provider, NullLogger<CandidateExplanationService>.Instance);

        await service.GenerateForShortlistedAsync(Guid.NewGuid(), payload.Submission.Id, CancellationToken.None);

        var stored = repository.Stored.Single();
        var strengths = DeserializeList(stored.StrengthsJson);
        var explanationText = stored.ExplanationText.ToLowerInvariant();

        Assert.Equal(ExplanationStatus.Succeeded, stored.Status);
        Assert.DoesNotContain("missing responsibility", explanationText, StringComparison.Ordinal);
        Assert.DoesNotContain("missing rest api", explanationText, StringComparison.Ordinal);
        Assert.Contains(strengths, x => x.Contains("REST APIs", StringComparison.OrdinalIgnoreCase));
        Assert.Contains(strengths, x => x.Contains("role responsibilities", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task GenerateForShortlistedAsync_ReportsTrueNotFoundGapWithoutOverclaiming()
    {
        var payload = BuildPayload(
            requiredSkills: ["Docker Compose", "React"],
            responsibilities: [],
            description:
            [
                Match("Frontend application delivery",
                    "Built React and TypeScript admin dashboards",
                    "semantic", 0.73f, "projects[0].summary", "projects")
            ],
            requiredSkillMatches:
            [
                Match("Docker Compose", string.Empty, "weak_rule", 0.18f, string.Empty, string.Empty),
                Match("React", "Built React dashboards with TypeScript", "exact", 0.96f, "projects[0].summary", "projects")
            ]);

        var provider = new StubExplanationProvider(new CandidateStructuredExplanation
        {
            Summary = "Demonstrated expertise in Docker Compose.",
            Strengths = ["Has Docker Compose."],
            Gaps = []
        });

        var repository = new RecordingCandidateExplanationRepository(payload);
        var service = new CandidateExplanationService(repository, provider, NullLogger<CandidateExplanationService>.Instance);

        await service.GenerateForShortlistedAsync(Guid.NewGuid(), payload.Submission.Id, CancellationToken.None);

        var stored = repository.Stored.Single();
        var gaps = DeserializeList(stored.GapsJson);
        var explanationText = stored.ExplanationText.ToLowerInvariant();

        Assert.Equal(ExplanationStatus.Succeeded, stored.Status);
        Assert.DoesNotContain("docker compose expertise", explanationText, StringComparison.Ordinal);
        Assert.Contains(gaps, x => x.Contains("Docker Compose", StringComparison.OrdinalIgnoreCase));
        Assert.Contains(gaps, x => x.Contains("not found", StringComparison.OrdinalIgnoreCase));
    }

    private static CandidateExplanationPayloadData BuildPayload(
        IEnumerable<string> requiredSkills,
        IEnumerable<MatchEvidence> responsibilities,
        IEnumerable<MatchEvidence> description,
        IEnumerable<MatchEvidence> requiredSkillMatches)
    {
        var jobId = Guid.NewGuid();
        var submissionId = Guid.NewGuid();

        return new CandidateExplanationPayloadData
        {
            Job = new JobEntity
            {
                Id = jobId,
                CompanyId = Guid.NewGuid(),
                RecruiterId = Guid.NewGuid(),
                Title = ".NET Full-Stack Engineer",
                Description = "Build scalable full-stack applications.",
                RequiredSkillsJson = JsonSerializer.Serialize(requiredSkills.ToList()),
                PreferredSkillsJson = JsonSerializer.Serialize(new List<string> { "Azure DevOps" }),
                ResponsibilitiesText = "Build APIs\nSupport frontend delivery",
                MinYears = 1,
                Education = "Bachelor's Degree",
                Location = "Singapore",
                WorkSetup = WorkSetup.Hybrid,
                EmploymentType = EmploymentType.FullTime,
            },
            Submission = new ResumeSubmissionEntity
            {
                Id = submissionId,
                CompanyId = Guid.NewGuid(),
                JobId = jobId,
                Status = ResumeSubmissionStatus.Shortlisted,
                FullName = "Alex Candidate",
                Email = "alex@example.com",
                Location = "Singapore",
                ParsedResumeJson = JsonSerializer.Serialize(new
                {
                    Derived = new
                    {
                        TotalExperienceMonths = 10,
                        EducationMaxLevel = "Bachelor",
                        NormalizedSkills = new[] { "c#", "asp.net core", "react", "typescript", "postgresql", "mysql" }
                    }
                })
            },
            Score = new ResumeScoreEntity
            {
                Id = Guid.NewGuid(),
                ResumeSubmissionId = submissionId,
                JobId = jobId,
                JobDescriptionText = "Build scalable full-stack applications.",
                SkillsScore = 82,
                ExperienceScore = 76,
                EducationScore = 80,
                SummaryScore = 78,
                FinalWeightedScore = 84,
                ScoreBreakdownJson = JsonSerializer.Serialize(new FinalMatchScore
                {
                    FinalScore = 84,
                    SectionScores = new Dictionary<string, float>(StringComparer.OrdinalIgnoreCase)
                    {
                        ["responsibilities"] = 0.78f,
                        ["description"] = 0.75f
                    },
                    Matches = new MatchGroups
                    {
                        RequiredSkills = requiredSkillMatches.ToList(),
                        Responsibilities = responsibilities.ToList(),
                        DescriptionTopMatches = description.ToList(),
                        PreferredSkills = []
                    },
                    HardRequirements = new HardRequirementResult
                    {
                        MinimumYearsExperienceMet = false,
                        MinimumEducationMet = true
                    }
                })
            }
        };
    }

    private static MatchEvidence Match(string jdItem, string bestEvidence, string matchType, float confidence, string path, string source)
    {
        return new MatchEvidence
        {
            JdItem = jdItem,
            BestResumeEvidence = bestEvidence,
            StrongestEvidence = bestEvidence,
            MatchType = matchType,
            Similarity = confidence,
            BaseMatchScore = confidence,
            FinalMatchConfidence = confidence,
            EvidenceSourcePath = path,
            Source = source,
            MatchReason = "Test evidence",
            EvidenceCountTotal = string.IsNullOrWhiteSpace(bestEvidence) ? 0 : 1,
            EvidenceCountDistinct = string.IsNullOrWhiteSpace(bestEvidence) ? 0 : 1,
            EvidenceTypesUsed = string.IsNullOrWhiteSpace(source) ? [] : [source.Contains("work_experience", StringComparison.OrdinalIgnoreCase) ? "WorkBullet" : source.Contains("projects", StringComparison.OrdinalIgnoreCase) ? "ProjectBullet" : "SkillList"]
        };
    }

    private static List<string> DeserializeList(string json)
    {
        return JsonSerializer.Deserialize<List<string>>(json) ?? [];
    }

    private sealed class StubExplanationProvider(CandidateStructuredExplanation explanation) : IGenerativeExplanationProvider
    {
        public string ProviderName => "stub";
        public string ModelName => "stub-model";

        public Task<CandidateExplanationGenerationResult> GenerateRecruiterExplanationAsync(CandidateExplanationFacts facts, CancellationToken ct = default)
        {
            return Task.FromResult(new CandidateExplanationGenerationResult
            {
                Explanation = explanation,
                RawProviderResponse = JsonSerializer.Serialize(explanation)
            });
        }
    }

    private sealed class RecordingCandidateExplanationRepository(CandidateExplanationPayloadData payload) : ICandidateExplanationRepository
    {
        public List<CandidateExplanationEntity> Stored { get; } = [];

        public Task<CandidateExplanationEntity?> GetBySubmissionIdAsync(Guid submissionId, CancellationToken ct = default)
        {
            return Task.FromResult(Stored.SingleOrDefault(x => x.ResumeSubmissionId == submissionId));
        }

        public Task<CandidateExplanationPayloadData?> GetExplanationPayloadAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default)
        {
            return Task.FromResult<CandidateExplanationPayloadData?>(payload.Submission.Id == submissionId ? payload : null);
        }

        public Task<CandidateExplanationEntity?> GetSucceededExplanationAsync(Guid submissionId, CancellationToken ct = default)
        {
            return Task.FromResult(Stored.SingleOrDefault(x => x.ResumeSubmissionId == submissionId && x.Status == ExplanationStatus.Succeeded));
        }

        public Task AddAsync(CandidateExplanationEntity entity, CancellationToken ct = default)
        {
            Stored.Add(entity);
            return Task.CompletedTask;
        }

        public Task SaveChangesAsync(CancellationToken ct = default) => Task.CompletedTask;
    }
}
