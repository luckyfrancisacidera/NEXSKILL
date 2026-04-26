using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Exceptions;
using SkillSense.Application.Interfaces;

namespace SkillSense.Infrastructure.Services;

public sealed class ResumeParserClient : IResumeParserClient
{
    private static readonly SemaphoreSlim GlobalRequestGate = new(1, 1);
    private static readonly TimeSpan GlobalRequestInterval = TimeSpan.FromSeconds(3);
    private static DateTimeOffset _nextAllowedRequestAtUtc = DateTimeOffset.MinValue;

    private readonly HttpClient _http;
    private readonly ILogger<ResumeParserClient> _logger;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public ResumeParserClient(HttpClient http, ILogger<ResumeParserClient> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<ResumeParseEnvelope> ParseAsync(
       Stream fileStream,
       string fileName,
       string contentType,
       string? parserVersion = null,
       CancellationToken ct = default)
    {
        await WaitForGlobalRateLimitSlotAsync(ct);

        using var form = new MultipartFormDataContent();
        using var fileContent = new StreamContent(fileStream);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue(string.IsNullOrWhiteSpace(contentType) ? "application/octet-stream" : contentType);
        form.Add(fileContent, "file", fileName);

        var suffix = string.IsNullOrWhiteSpace(parserVersion) ? string.Empty : $"?parser_version={Uri.EscapeDataString(parserVersion)}";
        using var resp = await _http.PostAsync($"parse{suffix}", form, ct);
        var body = await resp.Content.ReadAsStringAsync(ct);
        if (!resp.IsSuccessStatusCode)
        {
            if ((int)resp.StatusCode == 400)
                throw new ArgumentException($"Invalid parser version or parse request: {body}");
            if ((int)resp.StatusCode == 429)
            {
                var retryAfter = TryGetRetryAfter(resp.Headers.RetryAfter);
                _logger.LogWarning(
                    "Resume parser returned 429 for {FileName}. RetryAfter={RetryAfterSeconds}s",
                    fileName,
                    retryAfter?.TotalSeconds);
                throw new ResumeParserRateLimitException($"Resume parser rate limited the request: {body}", retryAfter);
            }
            throw new Exception($"Resume parser failed ({(int)resp.StatusCode}): {body}");
        }

        return JsonSerializer.Deserialize<ResumeParseEnvelope>(body, JsonOpts)
              ?? throw new Exception("Failed to deserialize resume parser response.");
    }

    private async Task WaitForGlobalRateLimitSlotAsync(CancellationToken ct)
    {
        await GlobalRequestGate.WaitAsync(ct);
        try
        {
            var now = DateTimeOffset.UtcNow;
            if (_nextAllowedRequestAtUtc > now)
            {
                var wait = _nextAllowedRequestAtUtc - now;
                _logger.LogDebug("Applying global resume parser pacing delay of {DelayMs} ms.", wait.TotalMilliseconds);
                await Task.Delay(wait, ct);
            }

            _nextAllowedRequestAtUtc = DateTimeOffset.UtcNow.Add(GlobalRequestInterval);
        }
        finally
        {
            GlobalRequestGate.Release();
        }
    }

    private static TimeSpan? TryGetRetryAfter(RetryConditionHeaderValue? retryAfter)
    {
        if (retryAfter is null)
        {
            return null;
        }

        if (retryAfter.Delta.HasValue)
        {
            return retryAfter.Delta.Value > TimeSpan.Zero ? retryAfter.Delta.Value : TimeSpan.FromSeconds(1);
        }

        if (retryAfter.Date.HasValue)
        {
            var delay = retryAfter.Date.Value - DateTimeOffset.UtcNow;
            return delay > TimeSpan.Zero ? delay : TimeSpan.FromSeconds(1);
        }

        return null;
    }
}
