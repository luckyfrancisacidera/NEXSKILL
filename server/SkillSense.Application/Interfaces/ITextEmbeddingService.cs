using System;
using System.Collections.Generic;
using System.Text;

namespace SkillSense.Application.Interfaces
{
    public interface ITextEmbeddingService
    {
        Task<IReadOnlyList<float>> EmbedAsync(string text, CancellationToken ct = default);
    }
}
