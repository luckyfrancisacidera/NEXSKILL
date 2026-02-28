namespace SkillSense.Application.Interfaces.Auth;

public interface IInputSanitizer
{
    string Sanitize(string? value);
    string SanitizeEmail(string? value);
}
