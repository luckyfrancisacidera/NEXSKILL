namespace SkillSense.Infrastructure.Options;

public sealed class SbertOptions
{
    public const string SectionName = "Sbert";

    public string ModelPath { get; set; } = string.Empty;

    public string VocabularyPath { get; set; } = string.Empty;

    public int MaxSequenceLength { get; set; } = 256;
}
