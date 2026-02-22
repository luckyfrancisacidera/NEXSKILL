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
        private readonly IResumeQueueService _queue;

        public ResumeController(IResumeQueueService queue) => _queue = queue;

        [HttpPost("upload")]
        public async Task<ActionResult<ResumeUploadResponse>> Upload([FromForm] IFormFile file, [FromForm]Guid jobId, [FromForm] string appliedJobPosition, CancellationToken ct)
        {
            var (isValid, error) = ResumeFileValidator.Validate(file?.FileName ?? "", file?.ContentType ?? "", file?.Length ?? 0);
            if (!isValid) return BadRequest(error);

            await using var stream = file!.OpenReadStream();
            var result = await _queue.EnqueueUploadAsync(stream, file.FileName, file.ContentType, jobId, appliedJobPosition, ct);
            return Accepted(result);
        }
    }
}
