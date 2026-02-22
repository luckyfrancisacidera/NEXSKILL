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

        var job = new JobEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            DescriptionEmbeddingJson = JsonSerializer.Serialize(embedding),
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
