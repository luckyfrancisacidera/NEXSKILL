using SkillSense.Application.Contracts.Auth;
using SkillSense.Domain.Entities;

namespace SkillSense.Application.Services.Auth;

public static class AuthUserProfileMapper
{
    // Handles to current user response.
    public static CurrentUserResponse ToCurrentUserResponse(AppUser user, IEnumerable<string> roles)
    {
        var roleArray = roles
            .Where(role => !string.IsNullOrWhiteSpace(role))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        var (firstName, lastName) = ResolveNameParts(user);

        return new CurrentUserResponse
        {
            IsAuthenticated = true,
            UserId = user.Id.ToString(),
            Email = user.Email,
            FirstName = firstName,
            LastName = lastName,
            Role = ResolvePrimaryRole(roleArray),
            Roles = roleArray,
        };
    }

    // Handles to account profile response.
    public static AccountProfileResponse ToAccountProfileResponse(AppUser user, IEnumerable<string> roles)
    {
        var roleArray = roles
            .Where(role => !string.IsNullOrWhiteSpace(role))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        var (firstName, lastName) = ResolveNameParts(user);

        return new AccountProfileResponse
        {
            FirstName = firstName,
            LastName = lastName,
            Email = user.Email ?? string.Empty,
            Role = ResolvePrimaryRole(roleArray),
        };
    }

    private static (string? FirstName, string? LastName) ResolveNameParts(AppUser user)
    {
        var storedFirstName = NullIfEmpty(user.FirstName);
        var storedLastName = NullIfEmpty(user.LastName);

        if (storedFirstName is not null || storedLastName is not null)
        {
            return (storedFirstName, storedLastName);
        }

        return SplitFullName(user.JobSeekerProfile?.FullName);
    }

    private static (string? FirstName, string? LastName) SplitFullName(string? fullName)
    {
        var normalizedFullName = NullIfEmpty(fullName);
        if (normalizedFullName is null)
        {
            return (null, null);
        }

        var parts = normalizedFullName
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        if (parts.Length == 0)
        {
            return (null, null);
        }

        if (parts.Length == 1)
        {
            return (parts[0], null);
        }

        return (parts[0], string.Join(' ', parts.Skip(1)));
    }

    // Resolves primary role.
    private static string ResolvePrimaryRole(IEnumerable<string> roles)
    {
        if (roles.Any(role => role.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase)))
        {
            return "Super Admin";
        }

        if (roles.Any(role => role.Equals("CompanyAdmin", StringComparison.OrdinalIgnoreCase)))
        {
            return "Company Admin";
        }

        if (roles.Any(role => role.Equals("Recruiter", StringComparison.OrdinalIgnoreCase)))
        {
            return "Recruiter";
        }

        if (roles.Any(role => role.Equals("Admin", StringComparison.OrdinalIgnoreCase)))
        {
            return "Admin";
        }

        return "Jobseeker";
    }

    // Handles null if empty.
    private static string? NullIfEmpty(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
