using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SkillSense.Application.Interfaces;
using SkillSense.Infrastructure.Services;

namespace SkillSense.Infrastructure
{
    public static class ConfigureInfrastructureService
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            var baseUrl = configuration["ResumeParser:BaseUrl"];
            if (string.IsNullOrWhiteSpace(baseUrl))
                throw new InvalidOperationException("Missing config: ResumeParser:BaseUrl");

            services.AddHttpClient<IResumeParserClient, ResumeParserClient>(http =>
            {
                http.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");
                http.Timeout = TimeSpan.FromSeconds(60);
            });

            return services;
        }
    }
}
