using System.Net;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace SkillSense.Api.Health;

public sealed class ResumeParserHealthCheck(IHttpClientFactory httpClientFactory) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            using var client = httpClientFactory.CreateClient("resume-parser-health");
            using var response = await client.GetAsync("ready", cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                return HealthCheckResult.Healthy("Resume parser is fully ready.");
            }

            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                return HealthCheckResult.Healthy("Resume parser readiness is being rate limited, but the service is reachable.");
            }

            return HealthCheckResult.Unhealthy($"Resume parser readiness returned {(int)response.StatusCode}.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Resume parser readiness probe failed.", ex);
        }
    }
}
