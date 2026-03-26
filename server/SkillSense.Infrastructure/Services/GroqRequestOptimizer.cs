using System.Text.Json;
using SkillSense.Application.Contracts.Recruiter.Response;

namespace SkillSense.Infrastructure.Services;

internal enum GroqPromptCompressionLevel
{
    Standard = 0,
    Reduced = 1,
    Minimal = 2,
}

internal sealed record GroqChatMessage(string Role, string Content);

internal sealed record GroqPromptBuildResult(
    GroqChatMessage[] Messages,
    int EstimatedTokens,
    GroqPromptCompressionLevel CompressionLevel,
    int PayloadJsonLength,
    string PayloadJson);

internal static class GroqRequestOptimizer
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
    };

    public static int EstimateTokenSize(IEnumerable<GroqChatMessage> messages)
    {
        var totalCharacters = 0;
        var messageCount = 0;

        foreach (var message in messages)
        {
            messageCount += 1;
            totalCharacters += message.Role.Length + message.Content.Length;
        }

        return (int)Math.Ceiling(totalCharacters / 4d) + (messageCount * 12);
    }

    public static GroqPromptBuildResult BuildPrompt(
        CandidateEvaluationContext context,
        int safeThreshold,
        GroqPromptCompressionLevel minimumLevel = GroqPromptCompressionLevel.Standard)
    {
        foreach (var level in Enum.GetValues<GroqPromptCompressionLevel>().Where(level => level >= minimumLevel))
        {
            var payload = CreatePromptPayload(context, level);
            var payloadJson = JsonSerializer.Serialize(payload, SerializerOptions);
            var messages = new[]
            {
                new GroqChatMessage("system", BuildSystemPrompt()),
                new GroqChatMessage("user", BuildUserPrompt(payloadJson)),
            };

            var estimatedTokens = EstimateTokenSize(messages);
            if (estimatedTokens <= safeThreshold || level == GroqPromptCompressionLevel.Minimal)
            {
                return new GroqPromptBuildResult(messages, estimatedTokens, level, payloadJson.Length, payloadJson);
            }
        }

        throw new InvalidOperationException("Unable to build a Groq prompt within the configured token budget.");
    }

    private static string BuildSystemPrompt() =>
        """
        You write concise recruiter insights for ATS reviewers.
        Return ONLY valid JSON with keys summary, strengths, risks, and recommendation.
        Write like a human HR recruiter, not an AI system.
        Use only the normalized evaluation data provided.
        Do not copy or quote resume text.
        Paraphrase capabilities into recruiter language.
        strengths and risks must always be arrays, even when empty.
        If no strengths are found, return "strengths": [].
        If no risks are found, return "risks": [].
        Do not repeat phrases or restate the same reasoning.
        Do not use ellipsis.
        Keep each bullet short and clear.
        Use at most 4 strengths and 3 risks.
        Never mention internal scores, match reasons, or source paths.
        """;

    private static string BuildUserPrompt(string payloadJson) =>
        $$"""
        Create a recruiter-friendly fit explanation for a shortlisted candidate.
        Keep the full response under about 120 to 180 words.
        Summary: 1 to 2 short sentences.
        Strengths: 2 to 4 concise bullets.
        Risks: 0 to 3 concise bullets.
        Recommendation: 1 short recruiter-facing note.
        Focus on the strongest required-skill evidence first.
        Use weak_signals and missing_skills for gaps.
        Do not copy candidate wording.
        Facts JSON:
        {{payloadJson}}
        """;

    private static object CreatePromptPayload(CandidateEvaluationContext context, GroqPromptCompressionLevel level)
    {
        var signalLimit = level switch
        {
            GroqPromptCompressionLevel.Standard => 6,
            GroqPromptCompressionLevel.Reduced => 4,
            _ => 3,
        };

        var phraseLimit = level switch
        {
            GroqPromptCompressionLevel.Standard => 80,
            GroqPromptCompressionLevel.Reduced => 60,
            _ => 45,
        };

        var skillLimit = level switch
        {
            GroqPromptCompressionLevel.Standard => 8,
            GroqPromptCompressionLevel.Reduced => 6,
            _ => 4,
        };

        return new
        {
            job = new
            {
                title = TrimText(context.Job.Title, 72),
                required_skills = TrimStrings(context.Job.RequiredSkills, skillLimit, 32),
                preferred_skills = TrimStrings(context.Job.PreferredSkills, Math.Max(0, skillLimit - 2), 32),
                minimum_years = context.Job.MinimumYears,
                education = TrimText(context.Job.Education, 40),
                location = TrimText(context.Job.Location, 40),
                work_setup = TrimText(context.Job.WorkSetup, 20),
                employment_type = TrimText(context.Job.EmploymentType, 20),
            },
            candidate = new
            {
                total_experience_months = context.Candidate.TotalExperienceMonths,
                education_max_level = TrimText(context.Candidate.EducationMaxLevel, 30),
                location = TrimText(context.Candidate.Location, 40),
                normalized_skills = TrimStrings(context.Candidate.NormalizedSkills, skillLimit, 28),
            },
            compatibility = new
            {
                location_compatibility = context.Compatibility.LocationCompatibility,
                work_setup_compatibility = context.Compatibility.WorkSetupCompatibility,
                employment_type_compatibility = context.Compatibility.EmploymentTypeCompatibility,
            },
            evaluation = new
            {
                required_skills = CompactSkillSignals(context.Evaluation.RequiredSkills, signalLimit, phraseLimit),
                preferred_skills = CompactSkillSignals(context.Evaluation.PreferredSkills, Math.Max(0, signalLimit - 2), phraseLimit),
                strengths = TrimStrings(context.Evaluation.Strengths, 4, phraseLimit),
                weak_signals = TrimStrings(context.Evaluation.WeakSignals, 3, phraseLimit),
                missing_skills = TrimStrings(context.Evaluation.MissingSkills, 3, 28),
                highlights = TrimStrings(context.Evaluation.Highlights, 4, phraseLimit),
                experience_assessment = context.Evaluation.ExperienceAssessment,
                education_assessment = context.Evaluation.EducationAssessment,
            },
        };
    }

    private static IReadOnlyList<object> CompactSkillSignals(
        IEnumerable<CandidateEvaluationSkillSignal> signals,
        int limit,
        int phraseLimit)
    {
        if (limit <= 0)
        {
            return [];
        }

        return signals
            .Take(limit)
            .Select(signal => new
            {
                name = TrimText(signal.Name, 32),
                level = signal.Level,
                signal = TrimText(signal.Signal, phraseLimit),
            })
            .ToList();
    }

    private static List<string> TrimStrings(IEnumerable<string> values, int limit, int perValueLimit)
    {
        if (limit <= 0)
        {
            return [];
        }

        return values
            .Select(value => TrimText(value, perValueLimit))
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(limit)
            .Cast<string>()
            .ToList();
    }

    private static string? TrimText(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var compact = value.Trim()
            .Replace('\n', ' ')
            .Replace('\r', ' ');
        compact = string.Join(' ', compact.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));

        if (compact.Length <= maxLength)
        {
            return compact;
        }

        var shortened = compact[..maxLength].Trim();
        var lastSpace = shortened.LastIndexOf(' ');
        if (lastSpace > maxLength / 2)
        {
            shortened = shortened[..lastSpace].Trim();
        }

        return shortened;
    }
}
