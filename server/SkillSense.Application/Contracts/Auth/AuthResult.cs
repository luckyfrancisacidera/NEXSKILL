namespace SkillSense.Application.Contracts.Auth;

public sealed class AuthResult
{
    public bool Succeeded { get; init; }
    public string Message { get; init; } = string.Empty;
    public string? Token { get; init; }
    public string? RefreshToken { get; init; }
    public string? Email { get; init; }
    public string? UserId { get; init; }
    public IReadOnlyCollection<string> Roles { get; init; } = [];
    public IReadOnlyCollection<string> Errors { get; init; } = [];

    public static AuthResult Failure(string message, params string[] errors) => new()
    {
        Succeeded = false,
        Message = message,
        Errors = errors,
    };

    public static AuthResult Success(
        string message,
        string? token = null,
        string? refreshToken = null,
        string? email = null,
        string? userId = null,
        IReadOnlyCollection<string>? roles = null) => new()
     {
        Succeeded = true,
        Message = message,
        Token = token,
        RefreshToken = refreshToken,
        Email = email,
        UserId = userId,
        Roles = roles ?? [],
    };
}
