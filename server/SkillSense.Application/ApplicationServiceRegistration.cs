using Microsoft.Extensions.DependencyInjection;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Auth;
using SkillSense.Application.Services;
using SkillSense.Application.Services.Auth;

namespace SkillSense.Application
{
    public static class ApplicationServiceRegistration
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IJobService, JobService>();
            services.AddScoped<IResumeQueueService, ResumeQueueService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddSingleton<IInputSanitizer, InputSanitizer>();

            return services;
        }
    }
}
