namespace SkillSense.Application.Interfaces
{
    public interface IObjectStorageService
    {
        Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default);
        Task<Stream> DownloadAsync(string objectKey, CancellationToken ct = default);
        Task DeleteAsync(string objectKey, CancellationToken ct = default);
        Task<bool> ExistsAsync(string objectKey, CancellationToken ct = default);
        Task<string?> GetDownloadUrlAsync(string objectKey, string downloadFileName, CancellationToken ct = default);
    }
}
