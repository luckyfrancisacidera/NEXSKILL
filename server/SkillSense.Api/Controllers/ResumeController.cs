using Microsoft.AspNetCore.Mvc;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Jobseeker;
using System.ComponentModel.DataAnnotations;
using SkillSense.Application.Validators;

namespace SkillSense.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResumeController : ControllerBase
    {
        private readonly IResumeUploadService _uploadService;
        private readonly IResumeReadService _readService;
        private readonly IResumeScoringService _scoringService;
        private readonly IResumeParserClient _parserClient;

        public ResumeController(
          IResumeUploadService uploadService,
          IResumeReadService readService,
          IResumeScoringService scoringService,
          IResumeParserClient parserClient)
        {
            _uploadService = uploadService;
            _readService = readService;
            _scoringService = scoringService;
            _parserClient = parserClient;
        }

        [HttpPost("upload")]
        public async Task<ActionResult<ResumeUploadResponse>> Upload([FromForm] IFormFile file, [FromForm] Guid jobId, [FromForm] string appliedJobPosition, CancellationToken ct)
        {
            var (isValid, error) = ResumeFileValidator.Validate(file?.FileName ?? "", file?.ContentType ?? "", file?.Length ?? 0);
            if (!isValid) return BadRequest(error);

            await using var stream = file!.OpenReadStream();
            var result = await _uploadService.EnqueueUploadAsync(stream, file.FileName, file.ContentType, jobId, appliedJobPosition, ct: ct);
            return Accepted(result);
        }

        [HttpPost("parse")]
        public async Task<ActionResult<ResumeParseEnvelope>> ParseResume([FromForm, Required] IFormFile file, [FromQuery(Name = "parser_version")] string parserVersion = "v1", CancellationToken ct = default)
        {
            var (isValid, error) = ResumeFileValidator.Validate(file?.FileName ?? "", file?.ContentType ?? "", file?.Length ?? 0);
            if (!isValid) return BadRequest(error);

            await using var stream = file!.OpenReadStream();
            try
            {
                var result = await _parserClient.ParseAsync(stream, file.FileName, file.ContentType, parserVersion, ct);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{submissionId:guid}/embeddings-summary")]
        public async Task<ActionResult<ResumeEmbeddingSummaryResponse>> GetEmbeddingsSummary(Guid submissionId, CancellationToken ct)
            => Ok(await _readService.GetEmbeddingSummaryAsync(submissionId, ct));

        [HttpPost("score")]
        public async Task<ActionResult<FinalMatchScore>> ScoreResume([FromBody] ResumeScoreRequest request, CancellationToken ct)
            => Ok(await _scoringService.ScoreResumeAsync(request, ct));
    }
}
