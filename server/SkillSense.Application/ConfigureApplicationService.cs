using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Auth;
using SkillSense.Application.Interfaces.Jobseeker;
using SkillSense.Application.Interfaces.Recruiter;
using SkillSense.Application.Services.Auth;
using SkillSense.Application.Services.Jobseeker;
using SkillSense.Application.Services.Jobs;
using SkillSense.Application.Services.Recruiter;
using SkillSense.Application.Services.Resume;
using SkillSense.Application.Services.Scoring;
using SkillSense.Application.Services.System;

namespace SkillSense.Application;

/// <summary>
/// Registers application-layer services and orchestration components.
/// </summary>a
public static class ApplicationServiceRegistration
{
    /// <summary>
    /// Adds application-layer dependencies required by API and background processing entry points.
    /// </summary>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IDateTimeProvider, SystemDateTimeProvider>();
        services.AddScoped<IResumeScoringOrchestrator, ResumeEmbeddingScoringOrchestrator>();
        services.AddScoped<IResumeUploadService, ResumeUploadService>();
        services.AddScoped<IResumeProcessingService, ResumeProcessingService>();
        services.AddScoped<IResumeScoringService, ResumeScoringService>();
        services.AddScoped<IResumeReadService, ResumeReadService>();
        services.AddScoped<IJobService, JobService>();
        services.AddScoped<IRecruiterService, RecruiterService>();
        services.AddScoped<ICandidateExplanationService, CandidateExplanationService>();
        services.AddScoped<IJobSeekerService, JobSeekerService>();
        services.AddSingleton<IAppCacheService, AppCacheService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddSingleton<IInputSanitizer, InputSanitizer>();

        return services;
    }
}
