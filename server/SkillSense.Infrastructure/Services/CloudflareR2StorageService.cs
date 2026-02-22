using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using SkillSense.Application.Interfaces;
using SkillSense.Infrastructure.Options;

namespace SkillSense.Infrastructure.Services;

public sealed class CloudflareR2StorageService : IObjectStorageService
{
    private readonly IAmazonS3 _s3;
    private readonly CloudflareR2Options _options;

    public CloudflareR2StorageService(IOptions<CloudflareR2Options> options)
    {
        _options = options.Value;
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
}
