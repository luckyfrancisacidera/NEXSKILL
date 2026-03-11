using System.Security.Claims;
using SkillSense.Application.Common;

namespace SkillSense.Api.Security;

public static class CurrentUserContext
{
    public const string CompanyHeaderName = "X-Company-Id";
    public const string RecruiterProfileHeaderName = "X-Recruiter-Profile-Id";

    public static Guid GetUserId(ClaimsPrincipal user)
        => Guid.Parse(user.FindFirstValue(SkillSenseClaimTypes.UserId) ?? user.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException());

    public static string GetRole(ClaimsPrincipal user)
    {
        var roles = user.FindAll(ClaimTypes.Role)
            .Select(claim => claim.Value)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var role in new[] { "SuperAdmin", "CompanyAdmin", "Recruiter", "Admin", "JobSeeker" })
        {
            if (roles.Contains(role))
            {
                return role;
            }
        }

        throw new UnauthorizedAccessException("Role claim is missing.");
    }

    public static Guid? GetActiveCompanyId(HttpContext httpContext)
        => ResolveScopedGuid(httpContext, CompanyHeaderName, SkillSenseClaimTypes.ActiveCompanyId, SkillSenseClaimTypes.CompanyIds);

    public static Guid? GetActiveRecruiterProfileId(HttpContext httpContext)
        => ResolveScopedGuid(httpContext, RecruiterProfileHeaderName, SkillSenseClaimTypes.ActiveRecruiterProfileId, SkillSenseClaimTypes.RecruiterProfileIds);

    private static Guid? ResolveScopedGuid(
        HttpContext httpContext,
        string headerName,
        string activeClaimType,
        string accessibleClaimType)
    {
        var accessibleIds = httpContext.User.FindAll(accessibleClaimType)
            .Select(claim => Guid.TryParse(claim.Value, out var parsed) ? parsed : (Guid?)null)
            .Where(value => value.HasValue)
            .Select(value => value!.Value)
            .ToHashSet();

        if (httpContext.Request.Headers.TryGetValue(headerName, out var headerValues))
        {
            var requestedValue = headerValues.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(requestedValue))
            {
                if (!Guid.TryParse(requestedValue, out var requestedId))
                {
                    throw new UnauthorizedAccessException($"Invalid {headerName} header.");
                }

                if (accessibleIds.Count > 0 && !accessibleIds.Contains(requestedId))
                {
                    throw new UnauthorizedAccessException($"{headerName} is not accessible for the current user.");
                }

                return requestedId;
            }
        }

        var activeClaimValue = httpContext.User.FindFirstValue(activeClaimType);
        if (Guid.TryParse(activeClaimValue, out var activeId))
        {
            return activeId;
        }

        return accessibleIds.Count == 1 ? accessibleIds.First() : null;
    }
}
