using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Infrastructure.Options;

namespace SkillSense.Infrastructure.Services;

public sealed class GroqExplanationProvider(HttpClient httpClient, IOptions<GroqOptions> options) : IGenerativeExplanationProvider
{
    private readonly GroqOptions _options = options.Value;

    public string ProviderName => "groq";
    public string ModelName => _options.Model;

    public async Task<CandidateExplanationGenerationResult> GenerateRecruiterExplanationAsync(CandidateExplanationFacts facts, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            throw new InvalidOperationException("Groq API key is not configured.");
        }

        var systemPrompt = """
        You generate recruiter-facing candidate fit explanations for an ATS.

        Return valid JSON only.
        Do not return markdown, headings, bullet formatting, code fences, comments, or prose outside JSON.
        Use exactly these top-level keys:
        - summary
        - strengths
        - gaps

        Required schema:
        {
          "summary": string | null,
          "strengths": string[],
          "gaps": string[]
        }

        Behavior rules:
        - Be factual, concise, and evidence-based.
        - Use only the provided structured facts.
        - Do not invent facts, infer unsupported claims, or guess missing details.
        - If evidence is insufficient for a point, omit that point.
        - Do not repeat the same evidence across summary, strengths, and gaps.
        - Each strength or gap should reflect a distinct evidence point.
        - Prefer concrete role-fit evidence over generic praise.
        - Do not mention internal field names, JSON paths, implementation details, or scoring mechanics unless naturally expressed in recruiter-friendly language.
        """;

        var userPrompt = $"""
        Create a recruiter-facing fit explanation JSON for a shortlisted candidate.

        Strict rules:
        - Return valid JSON only.
        - No markdown.
        - No headings.
        - No bullets inside text.
        - JSON schema keys and types: summary (string|null), strengths (string[]), gaps (string[]).
        - strengths must contain 2 to 4 concise items.
        - gaps must contain 0 to 2 concise items.
        - Use only provided facts.

        Reasoning priority:
        1) required skill alignment
        2) responsibility and description alignment
        3) role-relevant experience evidence
        4) hard requirement checks (minimum years and education)
        5) preferred skills as supporting context
        6) possible gaps last

        Evidence interpretation:
        - Treat `jd_item` as the job requirement, responsibility, or JD expectation being evaluated.
        - Treat `best_resume_evidence` as the strongest candidate proof supporting that specific requirement.
        - Reason from requirement to evidence.
        - Prefer structured evidence pairs over generic summary language when available.
        - Do not collapse requirement and evidence into one ambiguous statement before reasoning.
        - Do not overstate alignment if the evidence appears partial or limited.

        Strength rules:
        - strengths must be job-fit specific, not generic candidate praise.
        - Prefer strengths grounded in matched required skills, matched responsibilities, strong description alignment, or role-relevant work experience evidence.
        - Preferred skills should only be used as supporting context, not as the main basis of fit.

        Gap rules:
        - gaps must represent real, evidence-supported missing alignment or unmet requirements.
        - Prefer missing required skills or missing responsibilities over vague uncertainty.
        - Do not create a gap when the evidence shows the requirement is met.
        - If there are no meaningful evidence-supported gaps, return an empty array.

        Hard requirement rules:
        - If `scoring.minimum_years_met` is true, do not frame years-of-experience as a likely gap, concern, or verification item.
        - If `scoring.minimum_education_met` is true, do not frame education as a likely gap, concern, or verification item.
        - Avoid generic phrases like "experience not explicitly stated" when minimum years are already met.
        - Phrase missing info as neutral verification points only when supported by unmet or missing fit evidence.

        Summary rules:
        - summary should be concise and recruiter-friendly.
        - summary should reflect the strongest overall fit evidence.
        - do not repeat the exact same point already covered in strengths unless needed for coherence.

        Do not invent facts.
        Do not repeat facts.

        Structured facts JSON:
        {JsonSerializer.Serialize(facts)}
        """;

        using var request = new HttpRequestMessage(HttpMethod.Post, "chat/completions");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);

        var payload = new
        {
            model = _options.Model,
            temperature = _options.Temperature,
            response_format = new { type = "json_object" },
            messages = new object[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userPrompt }
            }
        };

        request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        using var response = await httpClient.SendAsync(request, ct);
        var body = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Groq generation failed with status {(int)response.StatusCode}: {body}");
        }

        using var doc = JsonDocument.Parse(body);
        var content = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        if (string.IsNullOrWhiteSpace(content))
        {
            throw new InvalidOperationException("Groq response was empty.");
        }

        var normalized = NormalizeStructuredResponse(content);

        return new CandidateExplanationGenerationResult
        {
            Explanation = normalized,
            RawProviderResponse = content.Trim()
        };
    }

    private static CandidateStructuredExplanation NormalizeStructuredResponse(string content)
    {
        var parsed = ParseJson(content) ?? throw new InvalidOperationException("Groq response was not valid JSON.");

        var strengths = NormalizeStringList(parsed, "strengths", 4);
        if (strengths.Count == 0)
        {
            throw new InvalidOperationException("Groq response did not contain any strengths.");
        }

        var gaps = NormalizeStringList(parsed, "gaps", 2);
        var summary = NormalizeText(GetJsonString(parsed, "summary"), 300);

        return new CandidateStructuredExplanation
        {
            Summary = summary,
            Strengths = strengths,
            Gaps = gaps,
        };
    }

    private static JsonElement? ParseJson(string content)
    {
        try
        {
            using var doc = JsonDocument.Parse(content);
            return doc.RootElement.Clone();
        }
        catch (JsonException)
        {
            var start = content.IndexOf('{');
            var end = content.LastIndexOf('}');
            if (start < 0 || end <= start)
            {
                return null;
            }

            var segment = content[start..(end + 1)];
            try
            {
                using var doc = JsonDocument.Parse(segment);
                return doc.RootElement.Clone();
            }
            catch (JsonException)
            {
                return null;
            }
        }
    }

    private static List<string> NormalizeStringList(JsonElement root, string propertyName, int maxCount)
    {
        var result = new List<string>();
        if (!root.TryGetProperty(propertyName, out var element))
        {
            return result;
        }

        if (element.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in element.EnumerateArray())
            {
                var normalized = item.ValueKind == JsonValueKind.String ? NormalizeText(item.GetString(), 180) : null;
                if (!string.IsNullOrWhiteSpace(normalized))
                {
                    result.Add(normalized);
                }
            }
        }
        else if (element.ValueKind == JsonValueKind.String)
        {
            var combined = element.GetString();
            if (!string.IsNullOrWhiteSpace(combined))
            {
                var pieces = combined.Split(['\n', ';'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                foreach (var piece in pieces)
                {
                    var normalized = NormalizeText(piece, 180);
                    if (!string.IsNullOrWhiteSpace(normalized))
                    {
                        result.Add(normalized);
                    }
                }
            }
        }

        return result
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(maxCount)
            .ToList();
    }

    private static string? GetJsonString(JsonElement root, string propertyName)
    {
        if (!root.TryGetProperty(propertyName, out var element) || element.ValueKind != JsonValueKind.String)
        {
            return null;
        }

        return element.GetString();
    }

    private static string? NormalizeText(string? value, int maxLen)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var cleaned = value.Trim().TrimStart('-', '*', '•').Trim();
        if (cleaned.Length > maxLen)
        {
            cleaned = cleaned[..maxLen].Trim();
        }

        return string.IsNullOrWhiteSpace(cleaned) ? null : cleaned;
    }
}
