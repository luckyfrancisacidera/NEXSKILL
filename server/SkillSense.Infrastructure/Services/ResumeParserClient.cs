using System.Net.Http.Headers;
using System.Text.Json;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;

namespace SkillSense.Infrastructure.Services
{
    public sealed class ResumeParserClient : IResumeParserClient
    {
        private readonly HttpClient _http;
        private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

        public ResumeParserClient(HttpClient http) => _http = http;

        public async Task<ResumeParseResult> ParseAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default)
        {
            using var form = new MultipartFormDataContent();

            using var fileContent = new StreamContent(fileStream);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(
                string.IsNullOrWhiteSpace(contentType) ? "application/octet-stream" : contentType
            );

            form.Add(fileContent, "file", fileName);
            
            using var resp = await _http.PostAsync("parse", form, ct);
            var body = await resp.Content.ReadAsStringAsync(ct);

            if (!resp.IsSuccessStatusCode)
                throw new Exception($"Resume parser failed ({(int)resp.StatusCode}): {body}");

            return JsonSerializer.Deserialize<ResumeParseResult>(body, JsonOpts)
                   ?? throw new Exception("Failed to deserialize resume parser response.");
        }
    }
}