using Microsoft.Extensions.Diagnostics.HealthChecks;
using SkillSense.Api.Health;

namespace SkillSense.Api.Extensions;

public static class HealthChecksExtensions
{
    public static IServiceCollection AddAppHealthChecks(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpClient("resume-parser-health", http =>
        {
            http.BaseAddress = new Uri(configuration.GetRequiredConfigurationValue("ResumeParser:BaseUrl").TrimEnd('/') + "/");
            http.Timeout = TimeSpan.FromSeconds(10);
        });

        services
            .AddHealthChecks()
            .AddCheck<DatabaseHealthCheck>("database", failureStatus: HealthStatus.Unhealthy, tags: ["ready"])
            .AddCheck<ResumeParserHealthCheck>("resume_parser", failureStatus: HealthStatus.Unhealthy, tags: ["diagnostic"])
            .AddCheck<ResumeProcessingHealthCheck>("resume_processing", failureStatus: HealthStatus.Unhealthy, tags: ["ready"]);

        return services;
    }
}
