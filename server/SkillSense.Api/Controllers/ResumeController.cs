using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Validators;

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
           var (isValid, error) = ResumeFileValidator.Validate(file?.FileName ?? "", file?.ContentType ?? "", file?.Length ?? 0);
            if(!isValid) return BadRequest(error);

           using var stream = file!.OpenReadStream();
           var result = await _parser.ParseAsync(stream, file.FileName, file.ContentType, ct);
           return Ok(result);
        }
    }
}
