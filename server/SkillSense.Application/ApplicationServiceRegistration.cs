using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Auth;
using SkillSense.Application.Interfaces.Jobseeker;
using SkillSense.Application.Interfaces.Recruiter;
using SkillSense.Application.Interfaces.Scoring;
using SkillSense.Application.Services;
using SkillSense.Application.Services.Auth;
using SkillSense.Application.Services.Jobseeker;
using SkillSense.Application.Services.Scoring;

namespace SkillSense.Application
{
    public static class ApplicationServiceRegistration
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<AtsScoringOptions>(configuration.GetSection(AtsScoringOptions.SectionName));
            services.AddSingleton<IDateTimeProvider, SystemDateTimeProvider>();
            services.AddScoped<ISimilarityEngine, SimilarityEngine>();
            services.AddScoped<IExperienceYearsCalculator, ExperienceYearsCalculator>();
            services.AddScoped<IExperienceContentBuilder, ExperienceContentBuilder>();
            services.AddScoped<ISkillsMatcher, SkillsMatcher>();
            services.AddScoped<IEducationEvaluator, EducationEvaluator>();
            services.AddScoped<IBonusEvaluator, BonusEvaluator>();
            services.AddScoped<ISummaryScorer, SummaryScorer>();
            services.AddScoped<IScoreAggregator, ScoreAggregator>();
            services.AddScoped<IResumeScoringOrchestrator, ResumeEmbeddingScoringOrchestrator>();
            services.AddScoped<IResumeUploadService, ResumeUploadService>();
            services.AddScoped<IResumeProcessingService, ResumeProcessingService>();
            services.AddScoped<IResumeScoringService, ResumeScoringService>();
            services.AddScoped<IResumeReadService, ResumeReadService>();
            services.AddScoped<IJobService, JobService>();
            services.AddScoped<IRecruiterService, RecruiterService>();
            services.AddScoped<IJobSeekerService, JobSeekerService>();
            services.AddSingleton<IAppCacheService, AppCacheService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddSingleton<IInputSanitizer, InputSanitizer>();

            return services;
        }
    }
}
