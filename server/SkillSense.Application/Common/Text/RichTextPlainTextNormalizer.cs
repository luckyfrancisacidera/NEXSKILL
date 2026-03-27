using System.Net;
using System.Text.RegularExpressions;

namespace SkillSense.Application.Common.Text;

internal static partial class RichTextPlainTextNormalizer
{
    public static string Normalize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var normalized = value
            .Replace("<br>", "\n", StringComparison.OrdinalIgnoreCase)
            .Replace("<br/>", "\n", StringComparison.OrdinalIgnoreCase)
            .Replace("<br />", "\n", StringComparison.OrdinalIgnoreCase);

        normalized = BlockTagRegex().Replace(normalized, "\n");
        normalized = HtmlTagRegex().Replace(normalized, string.Empty);
        normalized = WebUtility.HtmlDecode(normalized);

        var lines = normalized
            .Replace("\u00a0", " ", StringComparison.Ordinal)
            .Split(['\r', '\n'], StringSplitOptions.RemoveEmptyEntries)
            .Select(line => Regex.Replace(line.Trim(), @"\s+", " "))
            .Where(line => !string.IsNullOrWhiteSpace(line))
            .Distinct(StringComparer.OrdinalIgnoreCase);

        return string.Join(Environment.NewLine, lines);
    }

    [GeneratedRegex(@"</?(p|div|ul|ol|li|h[1-6]|blockquote)[^>]*>", RegexOptions.IgnoreCase | RegexOptions.Compiled)]
    private static partial Regex BlockTagRegex();

    [GeneratedRegex(@"<[^>]+>", RegexOptions.Compiled)]
    private static partial Regex HtmlTagRegex();
}
