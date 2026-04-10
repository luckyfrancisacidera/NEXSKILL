using Microsoft.AspNetCore.Http;

namespace SkillSense.Application.Services.Company;

internal static class RequestDocumentValidation
{
    internal const long MaxFileSizeBytes = 10 * 1024 * 1024;

    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
    };

    public static void ValidateOrThrow(IFormFile? file, string label)
    {
        if (file is null)
        {
            return;
        }

        if (file.Length <= 0)
        {
            throw new ArgumentException($"{label} must not be empty.");
        }

        if (file.Length > MaxFileSizeBytes)
        {
            throw new ArgumentException($"{label} must be 10 MB or smaller.");
        }

        var contentType = file.ContentType?.Trim() ?? string.Empty;
        if (!AllowedContentTypes.Contains(contentType))
        {
            throw new ArgumentException($"{label} must be a PNG, JPG, JPEG, or PDF file.");
        }
    }

    public static bool CanInlinePreview(string? contentType)
    {
        if (string.IsNullOrWhiteSpace(contentType))
        {
            return false;
        }

        return contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)
            || string.Equals(contentType, "application/pdf", StringComparison.OrdinalIgnoreCase);
    }
}
