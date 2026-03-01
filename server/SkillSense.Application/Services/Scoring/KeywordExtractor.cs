using System.Text.RegularExpressions;

namespace SkillSense.Application.Services.Scoring;

public sealed class KeywordExtractor
{
    private static readonly HashSet<string> StopWords =
    [
        "and", "the", "or", "to", "with", "for", "of", "a", "in", "on", "an", "at", "by", "is", "are"
    ];

    private static readonly string[] DegreeKeywords = ["bachelor", "master", "phd", "bs", "ms", "mba", "degree"];

    public HashSet<string> Extract(string text, IEnumerable<string>? strongEntities = null)
    {
        var set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        if (!string.IsNullOrWhiteSpace(text))
        {
            foreach (Match match in Regex.Matches(text.ToLowerInvariant(), "[a-z0-9\\+\\#\\.]{2,}"))
            {
                var token = match.Value.Trim();
                if (StopWords.Contains(token))
                {
                    continue;
                }

                set.Add(token);
            }

            foreach (Match year in Regex.Matches(text, "\\b(19|20)\\d{2}\\b"))
            {
                set.Add(year.Value);
            }

            foreach (var degree in DegreeKeywords)
            {
                if (text.Contains(degree, StringComparison.OrdinalIgnoreCase))
                {
                    set.Add(degree);
                }
            }
        }

        if (strongEntities is not null)
        {
            foreach (var entity in strongEntities.Where(x => !string.IsNullOrWhiteSpace(x)))
            {
                set.Add(entity.Trim().ToLowerInvariant());
            }
        }

        return set;
    }

    public float Jaccard(HashSet<string> left, HashSet<string> right)
    {
        if (left.Count == 0 || right.Count == 0)
        {
            return 0;
        }

        var intersection = left.Intersect(right, StringComparer.OrdinalIgnoreCase).Count();
        var union = left.Union(right, StringComparer.OrdinalIgnoreCase).Count();
        return union == 0 ? 0 : (float)intersection / union;
    }
}
