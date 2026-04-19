using System.Text.Json;
using SkillSense.Application.Contracts.Recruiter.Response;

namespace SkillSense.Infrastructure.Services;

internal sealed record GroqCandidateAnalysisParseResult(
    CandidateStructuredExplanation Explanation,
    bool UsedFallback,
    string? FailureReason);

internal static class GroqCandidateAnalysisParser
{
    public static GroqCandidateAnalysisParseResult Parse(string? content)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return Fallback("Groq response content was empty.");
        }

        var parsed = ParseJson(content);
        if (parsed is null)
        {
            return new GroqCandidateAnalysisParseResult(
                BuildFallbackFromPlainText(content),
                true,
                "Groq response was not valid JSON.");
        }

        var overallFit = NormalizeText(ReadString(parsed.Value, "overall_fit") ?? ReadString(parsed.Value, "summary"), 320) ?? string.Empty;
        var strengths = NormalizeStringList(parsed.Value, ["strengths"], 4);
        var areasToValidate = NormalizeStringList(parsed.Value, ["areas_to_validate", "validation_points"], 3);
        var potentialRisks = NormalizeStringList(parsed.Value, ["potential_risks", "risks", "gaps"], 3);
        var interviewFocus = NormalizeStringList(parsed.Value, ["recommended_interview_focus", "interview_focus"], 4);

        var recommendation = NormalizeText(ReadString(parsed.Value, "recommendation"), 240);
        if (!string.IsNullOrWhiteSpace(recommendation) && interviewFocus.Count == 0)
        {
            interviewFocus = [recommendation];
        }

        var explanation = new CandidateStructuredExplanation
        {
            OverallFit = overallFit,
            Strengths = strengths,
            AreasToValidate = areasToValidate,
            PotentialRisks = potentialRisks,
            RecommendedInterviewFocus = interviewFocus,
        };

        var usedFallback = false;
        var reasons = new List<string>();

        if (!parsed.Value.TryGetProperty("strengths", out _))
        {
            usedFallback = true;
            reasons.Add("Missing strengths.");
        }

        if (!parsed.Value.TryGetProperty("overall_fit", out _) && !parsed.Value.TryGetProperty("summary", out _) && string.IsNullOrWhiteSpace(overallFit))
        {
            usedFallback = true;
            reasons.Add("Missing overall fit.");
        }

        return new GroqCandidateAnalysisParseResult(
            explanation,
            usedFallback,
            reasons.Count > 0 ? string.Join(' ', reasons) : null);
    }

    private static GroqCandidateAnalysisParseResult Fallback(string reason)
        => new(new CandidateStructuredExplanation(), true, reason);

    private static CandidateStructuredExplanation BuildFallbackFromPlainText(string content)
    {
        var summary = NormalizeText(content, 300) ?? string.Empty;

        return new CandidateStructuredExplanation
        {
            OverallFit = summary,
            Strengths = [],
            AreasToValidate = [],
            PotentialRisks = [],
            RecommendedInterviewFocus = [],
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

            try
            {
                using var doc = JsonDocument.Parse(content[start..(end + 1)]);
                return doc.RootElement.Clone();
            }
            catch (JsonException)
            {
                return null;
            }
        }
    }

    private static string? ReadString(JsonElement root, string propertyName)
    {
        if (!root.TryGetProperty(propertyName, out var element))
        {
            return null;
        }

        return element.ValueKind switch
        {
            JsonValueKind.String => element.GetString(),
            JsonValueKind.Array => string.Join("; ", element.EnumerateArray()
                .Where(item => item.ValueKind == JsonValueKind.String)
                .Select(item => item.GetString())
                .Where(item => !string.IsNullOrWhiteSpace(item))),
            _ => null,
        };
    }

    private static List<string> NormalizeStringList(JsonElement root, string[] propertyNames, int maxCount)
    {
        foreach (var propertyName in propertyNames)
        {
            if (!root.TryGetProperty(propertyName, out var element))
            {
                continue;
            }

            return NormalizeStringList(element, maxCount);
        }

        return [];
    }

    private static List<string> NormalizeStringList(JsonElement element, int maxCount)
    {
        var result = new List<string>();

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
            var text = element.GetString();
            if (!string.IsNullOrWhiteSpace(text))
            {
                var pieces = text.Split(['\n', ';', '\u2022'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
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

    private static string? NormalizeText(string? value, int maxLen)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var cleaned = value.Trim().TrimStart('-', '*', '\u2022').Trim();
        cleaned = string.Join(' ', cleaned
            .Replace('\n', ' ')
            .Replace('\r', ' ')
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));

        if (cleaned.Length > maxLen)
        {
            cleaned = cleaned[..maxLen].Trim();
        }

        return string.IsNullOrWhiteSpace(cleaned) ? null : cleaned;
    }
}
