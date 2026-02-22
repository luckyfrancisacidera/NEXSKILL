using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;

namespace SkillSense.Application.Services;

internal sealed class EmbeddingScoringService(ITextEmbeddingService embeddingService)
{
    public async Task<ResumeEmbeddingResponse> BuildScoreAsync(string jobDescription, ResumeParseResult resume, string appliedJobPosition, CancellationToken ct)
    {
        var resumeText = ResumeEmbeddingComposer.ComposeFullText(resume);
        if (string.IsNullOrWhiteSpace(resumeText))
        {
            throw new InvalidOperationException("resume content is empty.");
        }

        var jobEmbedding = await embeddingService.EmbedAsync(jobDescription, ct);
        var resumeEmbedding = await embeddingService.EmbedAsync(resumeText, ct);

        var sectionSimilarities = new List<SectionSimilarity>();
        foreach (var section in ResumeEmbeddingComposer.ComposeSections(resume))
        {
            if (string.IsNullOrWhiteSpace(section.Value))
            {
                continue;
            }

            var sectionEmbedding = await embeddingService.EmbedAsync(section.Value, ct);
            sectionSimilarities.Add(new SectionSimilarity
            {
                Section = section.Key,
                Similarity = CosineSimilarity(jobEmbedding, sectionEmbedding)
            });
        }

        float? jobTargetSimilarity = null;
        if (!string.IsNullOrWhiteSpace(resume.PersonalInfo.JobTarget))
        {
            var jobTargetEmbedding = await embeddingService.EmbedAsync(resume.PersonalInfo.JobTarget, ct);
            jobTargetSimilarity = CosineSimilarity(jobEmbedding, jobTargetEmbedding);
        }

        float? appliedJobPositionSimilarity = null;
        if (!string.IsNullOrWhiteSpace(appliedJobPosition))
        {
            var appliedPositionEmbedding = await embeddingService.EmbedAsync(appliedJobPosition, ct);
            appliedJobPositionSimilarity = CosineSimilarity(jobEmbedding, appliedPositionEmbedding);
        }

        return new ResumeEmbeddingResponse
        {
            JobDescriptionEmbedding = jobEmbedding.ToList(),
            ResumeEmbedding = resumeEmbedding.ToList(),
            SectionSimilarities = sectionSimilarities,
            OverallSimilarity = CosineSimilarity(jobEmbedding, resumeEmbedding),
            JobTargetSimilarity = jobTargetSimilarity,
            AppliedJobPositionSimilarity = appliedJobPositionSimilarity
        };
    }

    private static float CosineSimilarity(IReadOnlyList<float> a, IReadOnlyList<float> b)
    {
        var length = Math.Min(a.Count, b.Count);
        if (length == 0)
        {
            return 0;
        }

        double dot = 0;
        double normA = 0;
        double normB = 0;

        for (var i = 0; i < length; i++)
        {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        var denom = Math.Sqrt(normA) * Math.Sqrt(normB);
        return denom <= 0 ? 0 : (float)(dot / denom);
    }
}
