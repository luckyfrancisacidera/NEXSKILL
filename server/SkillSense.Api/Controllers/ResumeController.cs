using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;

namespace SkillSense.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResumeController : ControllerBase
    {
        private readonly IResumeParserClient _parser;

        public ResumeController(IResumeParserClient parser) => _parser = parser;

        [HttpPost("parse")]
        public async Task<ActionResult<ResumeParseResult>> Parse([FromForm] IFormFile file, CancellationToken ct)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");
            try
            {
                using var stream = file.OpenReadStream();
                var result = await _parser.ParseAsync(stream, file.FileName, file.ContentType, ct);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error parsing resume: {ex.Message}");
            }
        }
    }
}
