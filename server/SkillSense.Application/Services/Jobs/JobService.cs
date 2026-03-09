using System.Text.Json;
using AutoMapper;
using SkillSense.Application.Common.Jobs;
using SkillSense.Application.Contracts.Recruiter.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services.Jobs;

public sealed class JobService(
    IJobRepository jobRepository,
    ITextEmbeddingService embeddingService,
    IMapper mapper) : IJobService
{
    public async Task<JobResponse> CreateAsync(CreateJobRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Description))
        {
            throw new ArgumentException("title and description are required");
        }

        var status = ParseStatusOrDefault(request.Status);
        var embedding = await embeddingService.EmbedAsync(request.Description, ct);
        var structured = NormalizedJobDescriptionFactory.Create(request);

        var job = mapper.Map<JobEntity>(request);
        job.Id = Guid.NewGuid();
        job.Status = status;
        job.DescriptionEmbeddingJson = JsonSerializer.Serialize(embedding);
        job.RequiredSkillsJson = JsonSerializer.Serialize(request.RequiredSkills);
        job.PreferredSkillsJson = JsonSerializer.Serialize(request.PreferredSkills);
        job.JobDescriptionStructuredJson = JsonSerializer.Serialize(structured);
        job.CreatedAtUtc = DateTime.UtcNow;

        await jobRepository.AddAsync(job, ct);
        return mapper.Map<JobResponse>(job);
    }

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
