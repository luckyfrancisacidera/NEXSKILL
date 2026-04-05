
namespace SkillSense.Application.Services.Scoring;

public static class SimilarityMath
{
    // Computes cosine similarity between two vectors.
    public static float CosineSimilarity(IReadOnlyList<float> a, IReadOnlyList<float> b)
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
