using System.Text.Json;
using SkillSense.Application.Contracts.Recruiter.Request;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Domain.Entities;

namespace SkillSense.Application.Common.Jobs;

internal static class NormalizedJobDescriptionFactory
{
    public static NormalizedJobDescription Create(CreateJobRequest request)
        => new()
        {
            Title = request.Title ?? string.Empty,
            Description = request.Description ?? string.Empty,
            Responsibilities = SplitResponsibilities(request.Responsibilities),
            RequiredSkills = request.RequiredSkills,
            PreferredSkills = request.PreferredSkills,
            MinimumYearsExperience = request.MinYears ?? 0,
            MinimumEducationLevel = request.MinEducation ?? request.Education ?? string.Empty,
            EducationRequirements = string.IsNullOrWhiteSpace(request.Education) ? [] : [request.Education],
            Metadata = new Dictionary<string, string> { ["experience_level"] = request.ExperienceLevel ?? string.Empty }
        };

    public static NormalizedJobDescription Create(UpdateJobRequest request)
        => new()
        {
            Title = request.Title ?? string.Empty,
            Description = request.Description ?? string.Empty,
            Responsibilities = SplitResponsibilities(request.Responsibilities),
            RequiredSkills = request.RequiredSkills,
            PreferredSkills = request.PreferredSkills,
            MinimumYearsExperience = request.MinYears ?? 0,
            MinimumEducationLevel = request.MinEducation ?? request.Education ?? string.Empty,
            EducationRequirements = string.IsNullOrWhiteSpace(request.Education) ? [] : [request.Education],
            Metadata = new Dictionary<string, string> { ["experience_level"] = request.ExperienceLevel ?? string.Empty }
        };

    public static NormalizedJobDescription Create(JobEntity job, string appliedJobPosition)
    {
        var requiredSkills = JsonSerializer.Deserialize<List<string>>(job.RequiredSkillsJson) ?? [];
        var preferredSkills = JsonSerializer.Deserialize<List<string>>(job.PreferredSkillsJson) ?? [];

        return new NormalizedJobDescription
        {
            JobId = job.Id.ToString(),
            Title = string.IsNullOrWhiteSpace(appliedJobPosition) ? job.Title : appliedJobPosition,
            Description = job.Description,
            Responsibilities = SplitResponsibilities(job.ResponsibilitiesText),
            RequiredSkills = requiredSkills,
            PreferredSkills = preferredSkills,
            MinimumYearsExperience = job.MinYears ?? 0,
            MinimumEducationLevel = job.Education ?? string.Empty,
            EducationRequirements = string.IsNullOrWhiteSpace(job.Education) ? [] : [job.Education],
            Metadata = new Dictionary<string, string> { ["experience_level"] = job.ExperienceLevel ?? string.Empty }
        };
    }

    private static List<string> SplitResponsibilities(string? responsibilities)
        => (responsibilities ?? string.Empty)
            .Split(new[] { "\n", ";", "." }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToList();
}
