using SkillSense.Application.Contracts.Response;

namespace SkillSense.Application.Interfaces
{
    public interface IResumeParserClient
    {
        Task<ResumeParseResult> ParseAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default);
    }
}
