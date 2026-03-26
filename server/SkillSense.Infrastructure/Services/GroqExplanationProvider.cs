using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Infrastructure.Options;

namespace SkillSense.Infrastructure.Services;

public sealed class GroqExplanationProvider(
    HttpClient httpClient,
    IOptions<GroqOptions> options,
    ILogger<GroqExplanationProvider> logger,
    IHostEnvironment environment) : IGenerativeExplanationProvider
{
    private readonly GroqOptions _options = options.Value;

    public string ProviderName => "groq";
    public string ModelName => _options.Model;

    public async Task<CandidateExplanationGenerationResult> GenerateRecruiterExplanationAsync(CandidateEvaluationContext context, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            throw new InvalidOperationException("Groq API key is not configured.");
        }

        var prompt = GroqRequestOptimizer.BuildPrompt(context, _options.SafeInputTokenThreshold);

        string? content;
        var rawProviderResponse = string.Empty;

        try
        {
            content = await ExecuteCompletionAsync(prompt, ct);
        }
        catch (InvalidOperationException ex) when (IsPayloadTooLargeError(ex) && prompt.CompressionLevel != GroqPromptCompressionLevel.Minimal)
        {
            var retryPrompt = GroqRequestOptimizer.BuildPrompt(
                context,
                _options.RetryInputTokenThreshold,
                GroqPromptCompressionLevel.Minimal);
            content = await ExecuteCompletionAsync(retryPrompt, ct);
        }

        if (environment.IsDevelopment())
        {
            logger.LogDebug("Groq normalized candidate evaluation payload: {PayloadJson}", prompt.PayloadJson);
        }

        if (string.IsNullOrWhiteSpace(content))
        {
            throw new InvalidOperationException("Groq response was empty.");
        }

        rawProviderResponse = content.Trim();

        if (environment.IsDevelopment())
        {
            logger.LogDebug("Groq raw candidate analysis response: {RawResponse}", content);
        }

        var parseResult = GroqCandidateAnalysisParser.Parse(content);

        if (parseResult.FailureReason is not null)
        {
            logger.LogWarning("Groq candidate analysis normalization issue: {Reason}", parseResult.FailureReason);
        }

        if (parseResult.UsedFallback && prompt.CompressionLevel != GroqPromptCompressionLevel.Minimal)
        {
            var retryPrompt = GroqRequestOptimizer.BuildPrompt(
                context,
                _options.RetryInputTokenThreshold,
                GroqPromptCompressionLevel.Minimal);
            var retryContent = await ExecuteCompletionAsync(retryPrompt, ct);

            if (environment.IsDevelopment() && !string.IsNullOrWhiteSpace(retryContent))
            {
                logger.LogDebug("Groq retry candidate analysis response: {RawResponse}", retryContent);
            }

            var retryParseResult = GroqCandidateAnalysisParser.Parse(retryContent);
            if (!retryParseResult.UsedFallback || string.IsNullOrWhiteSpace(parseResult.Explanation.Summary))
            {
                parseResult = retryParseResult;
                rawProviderResponse = retryContent?.Trim() ?? rawProviderResponse;
            }
        }

        return new CandidateExplanationGenerationResult
        {
            Explanation = parseResult.Explanation,
            RawProviderResponse = rawProviderResponse
        };
    }

    private async Task<string?> ExecuteCompletionAsync(GroqPromptBuildResult prompt, CancellationToken ct)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "chat/completions");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);

        var payload = new
        {
            model = _options.Model,
            temperature = _options.Temperature,
            max_tokens = _options.MaxOutputTokens,
            response_format = new { type = "json_object" },
            messages = prompt.Messages.Select(message => new { role = message.Role, content = message.Content }).ToArray()
        };

        request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        using var response = await httpClient.SendAsync(request, ct);
        var body = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Groq generation failed with status {(int)response.StatusCode}: {body}");
        }

        using var doc = JsonDocument.Parse(body);
        return doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();
    }

    private static bool IsPayloadTooLargeError(Exception ex)
        => ex.Message.Contains("status 413", StringComparison.OrdinalIgnoreCase)
           || ex.Message.Contains("Request too large", StringComparison.OrdinalIgnoreCase)
           || ex.Message.Contains("TPM limit exceeded", StringComparison.OrdinalIgnoreCase);
}
