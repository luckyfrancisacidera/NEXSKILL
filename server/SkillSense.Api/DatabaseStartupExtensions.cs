using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using SkillSense.Persistence.Data;

namespace SkillSense.Api;

public static class DatabaseStartupExtensions
{
    public static async Task ApplyMigrationsSafelyAsync(this WebApplication app)
    {
        await using var scope = app.Services.CreateAsyncScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseStartup");
        var dbContext = scope.ServiceProvider.GetRequiredService<SkillSenseDbContext>();

        try
        {
            var pendingMigrations = (await dbContext.Database.GetPendingMigrationsAsync()).ToArray();
            if (pendingMigrations.Length > 0)
            {
                var hasAspNetRoles = await RelationExistsAsync(dbContext, "\"AspNetRoles\"");
                var hasMigrationHistory = await RelationExistsAsync(dbContext, "\"__EFMigrationsHistory\"");

                if (hasAspNetRoles && !hasMigrationHistory)
                {
                    logger.LogWarning(
                        "Skipping automatic EF migration because AspNetRoles exists but __EFMigrationsHistory is missing. " +
                        "Create a baseline migration history entry or reset the schema before applying migrations.");
                }
                else
                {
                    await dbContext.Database.MigrateAsync();
                }
            }

            await EnsureCoreRolesAsync(scope.ServiceProvider, logger);
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.DuplicateTable)
        {
            logger.LogWarning(ex,
                "Skipping automatic EF migration due to duplicate-table conflict. " +
                "This usually means the schema already contains Identity tables without matching migration history.");

            await EnsureCoreRolesAsync(scope.ServiceProvider, logger);
        }
    }

    private static async Task EnsureCoreRolesAsync(IServiceProvider services, ILogger logger)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var requiredRoles = new[] { "Admin", "Recruiter", "JobSeeker" };

        foreach (var role in requiredRoles)
        {
            if (await roleManager.RoleExistsAsync(role))
            {
                continue;
            }

            var result = await roleManager.CreateAsync(new IdentityRole<Guid>(role));
            if (!result.Succeeded)
            {
                logger.LogWarning("Failed to seed role {Role}. Errors: {Errors}",
                    role,
                    string.Join("; ", result.Errors.Select(e => e.Description)));
            }
        }
    }

    private static async Task<bool> RelationExistsAsync(DbContext dbContext, string relationName)
    {
        var exists = await dbContext.Database
            .SqlQuery<string?>($"SELECT to_regclass('{relationName}')")
            .SingleAsync();

        return !string.IsNullOrWhiteSpace(exists);
    }
}
