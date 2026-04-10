using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Jobseeker;
using SkillSense.Persistence.Data;
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
        private readonly SkillSenseDbContext _dbContext;

        public ResumeController(
          IResumeUploadService uploadService,
          IResumeReadService readService,
          IResumeScoringService scoringService,
          IResumeParserClient parserClient,
          SkillSenseDbContext dbContext)
        {
            _uploadService = uploadService;
            _readService = readService;
            _scoringService = scoringService;
            _parserClient = parserClient;
            _dbContext = dbContext;
        }

        // Uploads the requested file payload.
        [HttpPost("upload")]
        public async Task<ActionResult<ResumeUploadResponse>> Upload([FromForm] IFormFile file, [FromForm] Guid jobId, [FromForm] string appliedJobPosition, CancellationToken ct)
        {
            var (isValid, error) = ResumeFileValidator.Validate(file?.FileName ?? "", file?.ContentType ?? "", file?.Length ?? 0);
            if (!isValid) return BadRequest(error);

            var companyId = await _dbContext.Jobs
                .AsNoTracking()
                .Where(x => x.Id == jobId)
                .Select(x => x.CompanyId)
                .FirstOrDefaultAsync(ct);
            if (companyId == Guid.Empty)
            {
                return NotFound("Job was not found.");
            }

            await using var stream = file!.OpenReadStream();
            var result = await _uploadService.EnqueueUploadAsync(stream, file.FileName, file.ContentType, jobId, appliedJobPosition, companyId, ct: ct);
            return Accepted(result);
        }

        // Parses resume.
        [HttpPost("parse")]
        public async Task<ActionResult<ResumeParseEnvelope>> ParseResume([FromForm, Required] IFormFile file, [FromQuery(Name = "parser_version")] string parserVersion = "v2", CancellationToken ct = default)
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

        // Loads embeddings summary.
        [HttpGet("{submissionId:guid}/embeddings-summary")]
        public async Task<ActionResult<ResumeEmbeddingSummaryResponse>> GetEmbeddingsSummary(Guid submissionId, CancellationToken ct)
            => Ok(await _readService.GetEmbeddingSummaryAsync(submissionId, ct));

        // Scores resume.
        [HttpPost("score")]
        public async Task<ActionResult<FinalMatchScore>> ScoreResume([FromBody] ResumeScoreRequest request, CancellationToken ct)
            => Ok(await _scoringService.ScoreResumeAsync(request, ct));
    }
}
