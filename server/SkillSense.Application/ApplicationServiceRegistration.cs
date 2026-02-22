using Microsoft.Extensions.DependencyInjection;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Services;

namespace SkillSense.Application
{
    public static class ApplicationServiceRegistration
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IJobService, JobService>();
            services.AddScoped<IResumeQueueService, ResumeQueueService>();

            return services;
        }
    }
}
