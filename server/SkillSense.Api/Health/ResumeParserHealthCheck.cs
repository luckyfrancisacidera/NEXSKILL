using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace SkillSense.Api.Health;

public sealed class ResumeParserHealthCheck(IHttpClientFactory httpClientFactory) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            using var client = httpClientFactory.CreateClient("resume-parser-health");
            using var response = await client.GetAsync("health", cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                return HealthCheckResult.Healthy("Resume parser is reachable.");
            }

            return HealthCheckResult.Degraded($"Resume parser returned {(int)response.StatusCode}.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Degraded("Resume parser health probe failed.", ex);
        }
    }
}
