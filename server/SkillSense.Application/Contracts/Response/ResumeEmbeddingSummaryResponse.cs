namespace SkillSense.Application.Contracts.Response;

public sealed class ResumeEmbeddingSummaryResponse
{
    public Guid ResumeSubmissionId { get; set; }
    public List<EmbeddingSectionSummary> Sections { get; set; } = new();
}

public sealed class EmbeddingSectionSummary
{
    public string SectionType { get; set; } = string.Empty;
    public string? SubSectionKey { get; set; }
    public int VectorLength { get; set; }
}
