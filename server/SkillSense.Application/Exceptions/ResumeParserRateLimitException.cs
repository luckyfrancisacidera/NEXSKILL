namespace SkillSense.Application.Exceptions;

public sealed class ResumeParserRateLimitException(string message) : Exception(message);
