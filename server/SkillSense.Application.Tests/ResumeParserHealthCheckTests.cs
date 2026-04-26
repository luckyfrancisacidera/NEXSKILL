using System.Net;
using System.Net.Http;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using SkillSense.Api.Health;

namespace SkillSense.Application.Tests;

public sealed class ResumeParserHealthCheckTests
{
    [Fact]
    public async Task TooManyRequests_IsReportedAsDegraded()
    {
        var healthCheck = new ResumeParserHealthCheck(new StubHttpClientFactory(_ => new HttpResponseMessage(HttpStatusCode.TooManyRequests)));

        var result = await healthCheck.CheckHealthAsync(new HealthCheckContext(), CancellationToken.None);

        Assert.Equal(HealthStatus.Degraded, result.Status);
    }

    [Fact]
    public async Task SuccessStatus_IsHealthy()
    {
        var healthCheck = new ResumeParserHealthCheck(new StubHttpClientFactory(_ => new HttpResponseMessage(HttpStatusCode.OK)));

        var result = await healthCheck.CheckHealthAsync(new HealthCheckContext(), CancellationToken.None);

        Assert.Equal(HealthStatus.Healthy, result.Status);
    }

    private sealed class StubHttpClientFactory(Func<HttpRequestMessage, HttpResponseMessage> responder) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name)
            => new(new StubHttpMessageHandler(responder)) { BaseAddress = new Uri("https://example.test/") };
    }

    private sealed class StubHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> responder) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            => Task.FromResult(responder(request));
    }
}
