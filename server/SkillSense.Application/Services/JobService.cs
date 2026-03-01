using System.Text.Json;
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
        var structured = BuildJobDescriptionInput(request);

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

    private static JobDescriptionInput BuildJobDescriptionInput(CreateJobRequest request)
        => new()
        {
            Text = request.Description,
            Title = request.Title,
            Responsibilities = request.Responsibilities,
            RequiredSkills = request.RequiredSkills,
            PreferredSkills = request.PreferredSkills,
            ExperienceLevel = request.ExperienceLevel,
            MinYears = request.MinYears,
            Education = request.Education,
            MinEducation = request.MinEducation
        };


    private static JobStatus ParseStatusOrDefault(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return JobStatus.Pending;
        }

        return Enum.TryParse<JobStatus>(status, ignoreCase: true, out var parsed)
            ? parsed
            : JobStatus.Pending;
    }
}
