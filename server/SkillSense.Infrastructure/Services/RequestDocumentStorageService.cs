using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using SkillSense.Application.Interfaces.Company;
using SkillSense.Infrastructure.Options;

namespace SkillSense.Infrastructure.Services;

public sealed class RequestDocumentStorageService : IRequestDocumentStorageService
{
    private readonly StorageOptions _storageOptions;
    private readonly CloudflareR2Options _cloudflareOptions;
    private readonly string _rootPath;
    private readonly IAmazonS3? _s3;

    public RequestDocumentStorageService(
        IOptions<StorageOptions> storageOptions,
        IOptions<CloudflareR2Options> cloudflareOptions,
        IHostEnvironment environment)
    {
        _storageOptions = storageOptions.Value;
        _cloudflareOptions = cloudflareOptions.Value;
        _rootPath = ResolveRootPath(_storageOptions.LocalRootPath, environment);

        if (_storageOptions.Driver.Equals("cloud", StringComparison.OrdinalIgnoreCase))
        {
            var config = new AmazonS3Config
            {
                ServiceURL = $"https://{_cloudflareOptions.AccountId}.r2.cloudflarestorage.com",
                ForcePathStyle = true,
                AuthenticationRegion = "auto",
            };

            _s3 = new AmazonS3Client(_cloudflareOptions.AccessKeyId, _cloudflareOptions.SecretAccessKey, config);
        }
    }

    public async Task<RequestDocumentStorageResult> SaveAsync(
        Stream stream,
        string fileName,
        string contentType,
        CancellationToken ct = default)
    {
        var safeName = SanitizeFileName(fileName);
        var extension = Path.GetExtension(safeName);
        var objectKey = $"company-requests/{DateTime.UtcNow:yyyy/MM}/{Guid.NewGuid():N}{extension}";

        if (_s3 is not null)
        {
            var request = new PutObjectRequest
            {
                BucketName = _cloudflareOptions.BucketName,
                Key = objectKey,
                InputStream = stream,
                ContentType = contentType,
                UseChunkEncoding = false,
                DisablePayloadSigning = true,
                DisableDefaultChecksumValidation = true,
            };

            await _s3.PutObjectAsync(request, ct);
            return new RequestDocumentStorageResult(objectKey, "cloudflare-r2");
        }

        var fullPath = GetFullPath(objectKey);
        var directory = Path.GetDirectoryName(fullPath);
        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        await using var outputStream = new FileStream(fullPath, FileMode.CreateNew, FileAccess.Write, FileShare.None);
        await stream.CopyToAsync(outputStream, ct);
        return new RequestDocumentStorageResult(objectKey, "local");
    }

    public async Task<RequestDocumentDownloadResult> OpenReadAsync(string storageKey, CancellationToken ct = default)
    {
        if (_s3 is not null)
        {
            var response = await _s3.GetObjectAsync(_cloudflareOptions.BucketName, storageKey, ct);
            var memory = new MemoryStream();
            await response.ResponseStream.CopyToAsync(memory, ct);
            memory.Position = 0;
            return new RequestDocumentDownloadResult(memory, response.Headers.ContentType ?? "application/octet-stream");
        }

        var fullPath = GetFullPath(storageKey);
        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException("Stored request document was not found.", storageKey);
        }

        var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return new RequestDocumentDownloadResult(stream, MimeTypes.GetMimeType(fullPath));
    }

    private string GetFullPath(string objectKey)
    {
        var normalizedKey = objectKey.Replace('/', Path.DirectorySeparatorChar).Replace('\\', Path.DirectorySeparatorChar);
        var combinedPath = Path.GetFullPath(Path.Combine(_rootPath, normalizedKey));
        if (!combinedPath.StartsWith(_rootPath, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Invalid document storage path.");
        }

        return combinedPath;
    }

    private static string ResolveRootPath(string configuredRootPath, IHostEnvironment environment)
    {
        var basePath = string.IsNullOrWhiteSpace(configuredRootPath)
            ? Path.Combine(environment.ContentRootPath, "storage")
            : configuredRootPath;

        var fullPath = Path.GetFullPath(basePath);
        Directory.CreateDirectory(fullPath);
        return fullPath;
    }

    private static string SanitizeFileName(string fileName)
    {
        var baseName = Path.GetFileName(string.IsNullOrWhiteSpace(fileName) ? "document" : fileName.Trim());
        var invalidCharacters = Path.GetInvalidFileNameChars();
        var sanitized = new string(baseName.Select(character => invalidCharacters.Contains(character) ? '_' : character).ToArray());
        return string.IsNullOrWhiteSpace(sanitized) ? "document" : sanitized;
    }

    private static class MimeTypes
    {
        public static string GetMimeType(string path)
        {
            var extension = Path.GetExtension(path).ToLowerInvariant();
            return extension switch
            {
                ".pdf" => "application/pdf",
                ".png" => "image/png",
                ".jpg" or ".jpeg" => "image/jpeg",
                _ => "application/octet-stream",
            };
        }
    }
}
