namespace SkillSense.Application.Exceptions;

public sealed class ResumeParserRateLimitException : Exception
{
	public ResumeParserRateLimitException(string message, TimeSpan? retryAfter = null, Exception? innerException = null)
		: base(message, innerException)
	{
		RetryAfter = retryAfter;
	}

	public TimeSpan? RetryAfter { get; }
}
