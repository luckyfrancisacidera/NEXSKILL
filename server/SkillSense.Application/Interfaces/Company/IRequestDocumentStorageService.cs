namespace SkillSense.Application.Interfaces.Company;

public interface IRequestDocumentStorageService
{
    Task<RequestDocumentStorageResult> SaveAsync(
        Stream stream,
        string fileName,
        string contentType,
        CancellationToken ct = default);

    Task<RequestDocumentDownloadResult> OpenReadAsync(string storageKey, CancellationToken ct = default);
}

public sealed record RequestDocumentStorageResult(string StorageKey, string StorageProvider);

public sealed record RequestDocumentDownloadResult(Stream Stream, string ContentType);
