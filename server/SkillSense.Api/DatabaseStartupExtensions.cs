using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Seed;

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

            await SeedIdentityAsync(scope.ServiceProvider, logger);
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.DuplicateTable)
        {
            logger.LogWarning(ex,
                "Skipping automatic EF migration due to duplicate-table conflict. " +
                "This usually means the schema already contains Identity tables without matching migration history.");

            await SeedIdentityAsync(scope.ServiceProvider, logger);
        }
    }

    private static async Task SeedIdentityAsync(IServiceProvider services, ILogger logger)
    {
        try
        {
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
            var userManager = services.GetRequiredService<UserManager<AppUser>>();
            await IdentitySeeder.SeedAsync(userManager, roleManager);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to seed Identity roles and users.");
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
