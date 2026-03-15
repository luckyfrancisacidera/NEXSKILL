using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SkillSense.Application.Interfaces;
using SkillSense.Infrastructure.Options;

namespace SkillSense.Infrastructure.Services;

public sealed class LocalObjectStorageService(
    IOptions<StorageOptions> options,
    ILogger<LocalObjectStorageService> logger) : IObjectStorageService
{
    private readonly string _rootPath = ResolveRootPath(options.Value.LocalRootPath);

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default)
    {
        var safeFileName = SanitizeFileName(fileName);
        var extension = Path.GetExtension(safeFileName);
        var objectKey = Path.Combine(
                "resumes",
                DateTime.UtcNow.ToString("yyyy"),
                DateTime.UtcNow.ToString("MM"),
                $"{Guid.NewGuid():N}{extension}")
            .Replace('\\', '/');

        var fullPath = GetFullPath(objectKey);
        var directoryPath = Path.GetDirectoryName(fullPath);
        if (!string.IsNullOrWhiteSpace(directoryPath))
        {
            Directory.CreateDirectory(directoryPath);
        }

        await using var outputStream = new FileStream(fullPath, FileMode.CreateNew, FileAccess.Write, FileShare.None);
        await fileStream.CopyToAsync(outputStream, ct);

        logger.LogInformation("Stored resume locally at {ObjectKey}", objectKey);
        return objectKey;
    }

    public Task<Stream> DownloadAsync(string objectKey, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        var fullPath = GetFullPath(objectKey);
        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException("Stored file was not found.", objectKey);
        }

        Stream stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return Task.FromResult(stream);
    }

    public Task DeleteAsync(string objectKey, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        var fullPath = GetFullPath(objectKey);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(string objectKey, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        return Task.FromResult(File.Exists(GetFullPath(objectKey)));
    }

    public Task<string?> GetDownloadUrlAsync(string objectKey, string downloadFileName, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        return Task.FromResult<string?>(null);
    }

    private string GetFullPath(string objectKey)
    {
        var normalizedKey = objectKey.Replace('/', Path.DirectorySeparatorChar).Replace('\\', Path.DirectorySeparatorChar);
        var combinedPath = Path.GetFullPath(Path.Combine(_rootPath, normalizedKey));
        if (!combinedPath.StartsWith(_rootPath, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Invalid storage path.");
        }

        return combinedPath;
    }

    private static string ResolveRootPath(string configuredRootPath)
    {
        var basePath = string.IsNullOrWhiteSpace(configuredRootPath)
            ? Path.Combine(AppContext.BaseDirectory, "storage")
            : configuredRootPath;

        var fullPath = Path.GetFullPath(basePath);
        Directory.CreateDirectory(fullPath);
        return fullPath;
    }

    private static string SanitizeFileName(string fileName)
    {
        var baseName = Path.GetFileName(string.IsNullOrWhiteSpace(fileName) ? "resume" : fileName.Trim());
        var invalidCharacters = Path.GetInvalidFileNameChars();
        var sanitized = new string(baseName.Select(character => invalidCharacters.Contains(character) ? '_' : character).ToArray());
        return string.IsNullOrWhiteSpace(sanitized) ? "resume" : sanitized;
    }
}
