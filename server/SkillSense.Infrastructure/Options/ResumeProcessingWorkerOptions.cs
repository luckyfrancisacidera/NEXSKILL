namespace SkillSense.Infrastructure.Options;

public sealed class ResumeProcessingWorkerOptions
{
    public const string SectionName = "ResumeProcessingWorker";

    public int BatchSize { get; set; } = 5;
    public TimeSpan IdleTimeout { get; set; } = TimeSpan.FromMinutes(2);
    public TimeSpan InitialBackoff { get; set; } = TimeSpan.FromSeconds(1);
    public TimeSpan MaxBackoff { get; set; } = TimeSpan.FromSeconds(30);

    public void Validate()
    {
        if (BatchSize <= 0)
        {
            throw new InvalidOperationException($"{SectionName}:BatchSize must be greater than 0.");
        }

        if (IdleTimeout <= TimeSpan.Zero)
        {
            throw new InvalidOperationException($"{SectionName}:IdleTimeout must be greater than 0.");
        }

        if (InitialBackoff <= TimeSpan.Zero)
        {
            throw new InvalidOperationException($"{SectionName}:InitialBackoff must be greater than 0.");
        }

        if (MaxBackoff <= TimeSpan.Zero)
        {
            throw new InvalidOperationException($"{SectionName}:MaxBackoff must be greater than 0.");
        }

        if (InitialBackoff > MaxBackoff)
        {
            throw new InvalidOperationException($"{SectionName}:InitialBackoff cannot be greater than MaxBackoff.");
        }
    }
}
