using Microsoft.AspNetCore.Identity;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Seed;

public static class IdentitySeeder
{
    private const string DefaultPassword = "P@ssword123";

    private static readonly SeedRole[] Roles =
    [
        new("SuperAdmin"),
        new("CompanyAdmin"),
        new("Recruiter"),
    ];

    private static readonly SeedUser[] Users =
    [
        new(
            Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            "superadmin@nexskill.local",
            "SuperAdmin"),
        new(
            Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            "companyadmin@nexskill.local",
            "CompanyAdmin"),
        new(
            Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            "recruiter@nexskill.local",
            "Recruiter"),
    ];

    public static async Task SeedAsync(
        UserManager<AppUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager)
    {
        ArgumentNullException.ThrowIfNull(userManager);
        ArgumentNullException.ThrowIfNull(roleManager);

        foreach (var role in Roles)
        {
            await EnsureRoleAsync(roleManager, role);
        }

        foreach (var user in Users)
        {
            var appUser = await EnsureUserAsync(userManager, user);
            await EnsureRoleAssignmentAsync(userManager, appUser, user.RoleName);
        }
    }

    private static async Task EnsureRoleAsync(
        RoleManager<IdentityRole<Guid>> roleManager,
        SeedRole seedRole)
    {
        if (await roleManager.RoleExistsAsync(seedRole.Name))
        {
            return;
        }

        var result = await roleManager.CreateAsync(new IdentityRole<Guid>
        {
            Name = seedRole.Name,
            NormalizedName = seedRole.Name.ToUpperInvariant(),
        });

        EnsureSuccess(result, $"seed role '{seedRole.Name}'");
    }

    private static async Task<AppUser> EnsureUserAsync(
        UserManager<AppUser> userManager,
        SeedUser seedUser)
    {
        var existingUser = await userManager.FindByEmailAsync(seedUser.Email);
        if (existingUser is not null)
        {
            return existingUser;
        }

        var user = new AppUser
        {
            Id = seedUser.Id,
            UserName = seedUser.Email,
            NormalizedUserName = seedUser.Email.ToUpperInvariant(),
            Email = seedUser.Email,
            NormalizedEmail = seedUser.Email.ToUpperInvariant(),
            EmailConfirmed = true,
        };

        var result = await userManager.CreateAsync(user, DefaultPassword);
        EnsureSuccess(result, $"seed user '{seedUser.Email}'");

        return user;
    }

    private static async Task EnsureRoleAssignmentAsync(
        UserManager<AppUser> userManager,
        AppUser user,
        string roleName)
    {
        if (await userManager.IsInRoleAsync(user, roleName))
        {
            return;
        }

        var result = await userManager.AddToRoleAsync(user, roleName);
        EnsureSuccess(result, $"assign role '{roleName}' to '{user.Email}'");
    }

    private static void EnsureSuccess(IdentityResult result, string action)
    {
        if (result.Succeeded)
        {
            return;
        }

        throw new InvalidOperationException(
            $"Failed to {action}: {string.Join("; ", result.Errors.Select(error => error.Description))}");
    }

    private sealed record SeedRole(string Name);

    private sealed record SeedUser(Guid Id, string Email, string RoleName);
}
