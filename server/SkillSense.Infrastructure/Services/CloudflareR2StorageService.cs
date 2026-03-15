using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using SkillSense.Application.Interfaces;
using SkillSense.Infrastructure.Options;
using System.Net.Mime;

namespace SkillSense.Infrastructure.Services;

public sealed class CloudflareR2StorageService : IObjectStorageService
{
    private readonly IAmazonS3 _s3;
    private readonly CloudflareR2Options _options;
    private readonly StorageOptions _storageOptions;

    public CloudflareR2StorageService(IOptions<CloudflareR2Options> options, IOptions<StorageOptions> storageOptions)
    {
        _options = options.Value;
        _storageOptions = storageOptions.Value;
        var config = new AmazonS3Config
        {
            ServiceURL = $"https://{_options.AccountId}.r2.cloudflarestorage.com",
            ForcePathStyle = true,
            AuthenticationRegion = "auto"
        };

        _s3 = new AmazonS3Client(_options.AccessKeyId, _options.SecretAccessKey, config);
    }

    public async Task<string> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken ct = default)
    {
        var objectKey = $"resumes/{Guid.NewGuid()}-{Path.GetFileName(fileName)}";
        var request = new PutObjectRequest
        {
            BucketName = _options.BucketName,
            Key = objectKey,
            InputStream = stream,
            ContentType = contentType,
            UseChunkEncoding = false,
            DisablePayloadSigning = true,
            DisableDefaultChecksumValidation = true
        };

        await _s3.PutObjectAsync(request, ct);
        return objectKey;
    }

    public async Task<Stream> DownloadAsync(string objectKey, CancellationToken ct = default)
    {
        var response = await _s3.GetObjectAsync(_options.BucketName, objectKey, ct);
        var memory = new MemoryStream();
        await response.ResponseStream.CopyToAsync(memory, ct);
        memory.Position = 0;
        return memory;
    }

    public Task DeleteAsync(string objectKey, CancellationToken ct = default)
        => _s3.DeleteObjectAsync(_options.BucketName, objectKey, ct);

    public async Task<bool> ExistsAsync(string objectKey, CancellationToken ct = default)
    {
        try
        {
            var metadata = await _s3.GetObjectMetadataAsync(_options.BucketName, objectKey, ct);
            return metadata.HttpStatusCode == System.Net.HttpStatusCode.OK;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
    }

    public Task<string?> GetDownloadUrlAsync(string objectKey, string downloadFileName, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var request = new GetPreSignedUrlRequest
        {
            BucketName = _options.BucketName,
            Key = objectKey,
            Verb = HttpVerb.GET,
            Expires = DateTime.UtcNow.AddSeconds(Math.Clamp(_storageOptions.ResumeDownloadUrlExpirySeconds, 60, 300)),
            ResponseHeaderOverrides =
            {
                ContentDisposition = BuildAttachmentDisposition(downloadFileName),
            },
        };

        return Task.FromResult<string?>(_s3.GetPreSignedURL(request));
    }

    private static string BuildAttachmentDisposition(string downloadFileName)
    {
        var safeFileName = string.IsNullOrWhiteSpace(downloadFileName) ? "resume" : downloadFileName;
        var encodedFileName = Uri.EscapeDataString(safeFileName);
        return $"{DispositionTypeNames.Attachment}; filename=\"{safeFileName}\"; filename*=UTF-8''{encodedFileName}";
    }
}
