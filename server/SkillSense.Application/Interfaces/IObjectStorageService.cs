namespace SkillSense.Application.Interfaces
{
    public interface IObjectStorageService
    {
        Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default);
        Task<Stream> DownloadAsync(string objectKey, CancellationToken ct = default);
    }
}
