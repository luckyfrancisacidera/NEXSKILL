using System.Text.RegularExpressions;
using SkillSense.Application.Interfaces.Auth;

namespace SkillSense.Application.Services.Auth;

public sealed partial class InputSanitizer : IInputSanitizer
{
    [GeneratedRegex("[\\r\\n\\t\\0]", RegexOptions.Compiled)]
    private static partial Regex ControlCharsRegex();

    public string Sanitize(string? value)
    {
        var trimmed = (value ?? string.Empty).Trim();
        return ControlCharsRegex().Replace(trimmed, string.Empty);
    }

    public string SanitizeEmail(string? value) => Sanitize(value).ToLowerInvariant();
}
