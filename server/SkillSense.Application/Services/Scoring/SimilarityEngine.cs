using Microsoft.Extensions.Options;
using SkillSense.Application.Contracts.Scoring.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Scoring;

namespace SkillSense.Application.Services.Scoring;

public sealed class SimilarityEngine(
    ITextEmbeddingService embeddingService,
    IOptions<AtsScoringOptions> options) : ISimilarityEngine
{
    private readonly KeywordExtractor _keywordExtractor = new();

    public async Task<SimilarityResult> CompareAsync(string sourceText, string targetText, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(sourceText) || string.IsNullOrWhiteSpace(targetText))
        {
            return new SimilarityResult(0f, 0f, 0f, 0f);
        }

        var sourceVector = await embeddingService.EmbedAsync(sourceText, ct);
        var targetVector = await embeddingService.EmbedAsync(targetText, ct);
        var semantic = SimilarityMath.CosineSimilarity(sourceVector, targetVector);

        var lexical = _keywordExtractor.Jaccard(
            _keywordExtractor.Extract(sourceText),
            _keywordExtractor.Extract(targetText));

        var alpha = ResolveSemanticAlpha(sourceText + " " + targetText);
        var combined = (alpha * semantic) + ((1 - alpha) * lexical);
        return new SimilarityResult(semantic, lexical, combined, alpha);
    }

    private float ResolveSemanticAlpha(string text)
    {
        var count = string.IsNullOrWhiteSpace(text)
            ? 0
            : text.Split([' ', '\n', '\r', '\t', ',', '.', ';', ':', '/', '\\', '-', '|', '(', ')'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).Length;

        if (count < options.Value.AdaptiveLexicalMinTokenCount)
        {
            return Math.Clamp(options.Value.AdaptiveSparseSemanticAlpha, 0f, 1f);
        }

        return Math.Clamp(options.Value.SemanticAlpha, 0f, 1f);
    }
}
