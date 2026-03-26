namespace SkillSense.Infrastructure.Options;

public sealed class GroqOptions
{
    public const string SectionName = "Groq";

    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "llama-3.1-8b-instant";
    public double Temperature { get; set; } = 0.1;
    public int SafeInputTokenThreshold { get; set; } = 5000;
    public int RetryInputTokenThreshold { get; set; } = 3800;
    public int MaxOutputTokens { get; set; } = 500;
}
