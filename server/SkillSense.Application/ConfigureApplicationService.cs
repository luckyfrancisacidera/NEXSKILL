using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SkillSense.Application.Options;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Admin;
using SkillSense.Application.Interfaces.Auth;
using SkillSense.Application.Interfaces.Company;
using SkillSense.Application.Interfaces.Jobseeker;
using SkillSense.Application.Interfaces.Recruiter;
using SkillSense.Application.Services.Admin;
using SkillSense.Application.Services.Auth;
using SkillSense.Application.Services.Company;
using SkillSense.Application.Services.Interviews;
using SkillSense.Application.Services.Jobseeker;
using SkillSense.Application.Services.Jobs;
using SkillSense.Application.Services.Notifications;
using SkillSense.Application.Services.Recruiter;
using SkillSense.Application.Services.Resume;
using SkillSense.Application.Services.Scoring;
using SkillSense.Application.Services.System;

namespace SkillSense.Application;

public static class ApplicationServiceRegistration
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAutoMapper(_ => { }, typeof(ApplicationServiceRegistration).Assembly);
        services.AddOptions<PasswordResetOptions>()
            .Bind(configuration.GetSection(PasswordResetOptions.SectionName))
            .Validate(options => !string.IsNullOrWhiteSpace(options.FrontendBaseUrl), "PasswordReset:FrontendBaseUrl is required.")
            .Validate(options => Uri.TryCreate(options.FrontendBaseUrl, UriKind.Absolute, out var uri)
                && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps), "PasswordReset:FrontendBaseUrl must be a valid absolute URL.")
            .ValidateOnStart();
        services.AddSingleton<IDateTimeProvider, SystemDateTimeProvider>();
        services.AddScoped<IResumeScoringOrchestrator, ResumeEmbeddingScoringOrchestrator>();
        services.AddScoped<IResumeUploadService, ResumeUploadService>();
        services.AddScoped<IResumeProcessingService, ResumeProcessingService>();
        services.AddScoped<IResumeScoringService, ResumeScoringService>();
        services.AddScoped<IResumeReadService, ResumeReadService>();
        services.AddScoped<IJobService, JobService>();
        services.AddScoped<ICompanyAccountRequestService, CompanyAccountRequestService>();
        services.AddScoped<ICompanyRequestReviewService, CompanyRequestReviewService>();
        services.AddScoped<ICompanyInvitationService, CompanyInvitationService>();
        services.AddScoped<ICompanySubscriptionUsageService, CompanySubscriptionUsageService>();
        services.AddScoped<ICompanySubscriptionAccessService, CompanySubscriptionAccessService>();
        services.AddScoped<IAdminManagementService, AdminManagementService>();
        services.AddScoped<IRecruiterService, RecruiterService>();
        services.AddScoped<ICandidateExplanationService, CandidateExplanationService>();
        services.AddScoped<IJobSeekerService, JobSeekerService>();
        services.AddScoped<IInterviewService, InterviewService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddSingleton<IAppCacheService, AppCacheService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddSingleton<IInputSanitizer, InputSanitizer>();

        return services;
    }
}
