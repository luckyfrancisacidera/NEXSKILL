using System.Globalization;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Contracts.Scoring.Response;
using SkillSense.Application.Interfaces.Scoring;

namespace SkillSense.Application.Services.Scoring;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}

public sealed class SystemDateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}

public sealed class ExperienceYearsCalculator(
    IDateTimeProvider clock,
    IOptions<AtsScoringOptions> options) : IExperienceYearsCalculator
{
    public ExperienceYearsResult Calculate(ResumeParseResult resume, int? requiredYears)
    {
        var totalMonths = resume.WorkExperience.Sum(EstimateMonths);
        var totalYears = Math.Clamp(totalMonths / 12f, 0f, 50f);

        var yearsScore = requiredYears is null || requiredYears <= 0
            ? Math.Clamp(options.Value.NeutralYearsScoreWhenMissingRequirement, 0f, 1f)
            : Math.Clamp(totalYears / requiredYears.Value, 0f, 1f);

        return new ExperienceYearsResult(totalYears, yearsScore);
    }

    private int EstimateMonths(WorkExperienceItem item)
    {
        var start = ParseDate(item.StartDate);
        if (start is null) return 0;

        var end = IsPresent(item.EndDate)
            ? clock.UtcNow
            : (ParseDate(item.EndDate) ?? clock.UtcNow);

        if (end < start.Value) return 0;

        var months = ((end.Year - start.Value.Year) * 12) + end.Month - start.Value.Month;
        return Math.Max(1, months);
    }

    private static bool IsPresent(string? value)
        => !string.IsNullOrWhiteSpace(value)
           && (value.Contains("present", StringComparison.OrdinalIgnoreCase)
               || value.Contains("current", StringComparison.OrdinalIgnoreCase)
               || value.Contains("now", StringComparison.OrdinalIgnoreCase));

    private static DateTime? ParseDate(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return null;

        if (DateTime.TryParse(text, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var direct))
        {
            return direct;
        }

        var cleaned = text.Trim();
        string[] formats = { "MMM yyyy", "MMMM yyyy", "yyyy-MM", "yyyy" };
        foreach (var format in formats)
        {
            if (DateTime.TryParseExact(cleaned, format, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var parsed))
            {
                return parsed;
            }
        }

        var yearMatch = Regex.Match(cleaned, @"\b(19|20)\d{2}\b");
        if (yearMatch.Success && int.TryParse(yearMatch.Value, out var y))
        {
            return new DateTime(y, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        }

        return null;
    }
}
