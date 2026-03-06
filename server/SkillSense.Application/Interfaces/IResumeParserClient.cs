using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces
{
    public interface IResumeParserClient
    {
        Task<ResumeParseEnvelope> ParseAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string? parserVersion = null,
        CancellationToken ct = default);
    }
}
