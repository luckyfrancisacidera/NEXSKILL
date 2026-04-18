namespace SkillSense.Application.Options;

public sealed class ResumeProcessingOptions
{
    public const string SectionName = "ResumeProcessing";

    public int MaxRetryAttempts { get; set; } = 5;
    public TimeSpan BaseRetryDelay { get; set; } = TimeSpan.FromMinutes(1);
    public TimeSpan MaxRetryDelay { get; set; } = TimeSpan.FromMinutes(30);

    public void Validate()
    {
        if (MaxRetryAttempts <= 0)
        {
            throw new InvalidOperationException($"{SectionName}:MaxRetryAttempts must be greater than 0.");
        }

        if (BaseRetryDelay <= TimeSpan.Zero)
        {
            throw new InvalidOperationException($"{SectionName}:BaseRetryDelay must be greater than 0.");
        }

        if (MaxRetryDelay < BaseRetryDelay)
        {
            throw new InvalidOperationException($"{SectionName}:MaxRetryDelay cannot be less than BaseRetryDelay.");
        }
    }
}
