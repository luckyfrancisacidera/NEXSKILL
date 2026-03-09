namespace SkillSense.Application.Common.Text;

internal static class MultilineTextNormalizer
{
    public static string Normalize(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return string.Empty;
        }

        var lines = text
            .Split('\n', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
            .Select(line => line.Replace("\r", string.Empty).Trim());

        return string.Join(Environment.NewLine, lines);
    }
}
