using System.Text.Json;
using SkillSense.Application.Contracts.Recruiter.Request;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services;

public sealed class JobService(IJobRepository jobRepository, ITextEmbeddingService embeddingService) : IJobService
{
    public async Task<JobResponse> CreateAsync(CreateJobRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Description))
        {
            throw new ArgumentException("title and description are required");
        }

        var status = ParseStatusOrDefault(request.Status);
        var embedding = await embeddingService.EmbedAsync(request.Description, ct);
        var structured = BuildNormalizedJobDescription(request);

        var job = new JobEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            DescriptionEmbeddingJson = JsonSerializer.Serialize(embedding),
            ResponsibilitiesText = request.Responsibilities,
            RequiredSkillsJson = JsonSerializer.Serialize(request.RequiredSkills),
            PreferredSkillsJson = JsonSerializer.Serialize(request.PreferredSkills),
            ExperienceLevel = request.ExperienceLevel,
            MinYears = request.MinYears,
            Education = request.Education ?? request.MinEducation,
            JobDescriptionStructuredJson = JsonSerializer.Serialize(structured),
            Status = status,
            CreatedAtUtc = DateTime.UtcNow
        };

        await jobRepository.AddAsync(job, ct);

        return new JobResponse
        {
            JobId = job.Id,
            Title = job.Title,
            Description = job.Description,
            Status = job.Status.ToString()
        };
    }

    private static NormalizedJobDescription BuildNormalizedJobDescription(CreateJobRequest request)
        => new()
        {
            Title = request.Title ?? string.Empty,
            Description = request.Description ?? string.Empty,
            Responsibilities = (request.Responsibilities ?? string.Empty)
                .Split(new[] { "\n", ";", "." }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList(),
            RequiredSkills = request.RequiredSkills,
            PreferredSkills = request.PreferredSkills,
            MinimumYearsExperience = request.MinYears ?? 0,
            MinimumEducationLevel = request.MinEducation ?? request.Education ?? string.Empty,
            EducationRequirements = string.IsNullOrWhiteSpace(request.Education) ? [] : [request.Education],
            Metadata = new Dictionary<string, string> { ["experience_level"] = request.ExperienceLevel ?? string.Empty }
        };


    private static JobStatus ParseStatusOrDefault(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return JobStatus.Draft;
        }

        return Enum.TryParse<JobStatus>(status, ignoreCase: true, out var parsed)
            ? parsed
            : JobStatus.Draft;
    }
}
