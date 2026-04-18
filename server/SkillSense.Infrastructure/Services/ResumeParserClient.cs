using System.Net.Http.Headers;
using System.Text.Json;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Exceptions;
using SkillSense.Application.Interfaces;

namespace SkillSense.Infrastructure.Services;

public sealed class ResumeParserClient : IResumeParserClient
{
    private readonly HttpClient _http;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public ResumeParserClient(HttpClient http) => _http = http;

    public async Task<ResumeParseEnvelope> ParseAsync(
       Stream fileStream,
       string fileName,
       string contentType,
       string? parserVersion = null,
       CancellationToken ct = default)
    {
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
                throw new ResumeParserRateLimitException($"Resume parser rate limited the request: {body}");
            throw new Exception($"Resume parser failed ({(int)resp.StatusCode}): {body}");
        }

        return JsonSerializer.Deserialize<ResumeParseEnvelope>(body, JsonOpts)
              ?? throw new Exception("Failed to deserialize resume parser response.");
    }
}
