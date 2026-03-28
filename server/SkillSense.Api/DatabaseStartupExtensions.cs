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
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var environment = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();

        try
        {
            if (ShouldApplyMigrations(configuration, environment))
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
            }
            else
            {
                logger.LogInformation("Automatic database migrations are disabled for this environment.");
            }

            await SeedIdentityAsync(scope.ServiceProvider, logger, configuration, environment);
            await RemediateLegacySeedAccountsAsync(scope.ServiceProvider, logger, configuration, environment);
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.DuplicateTable || ex.SqlState == PostgresErrorCodes.DuplicateColumn)
        {
            logger.LogWarning(ex,
                "Skipping automatic EF migration due to duplicate schema conflict. " +
                "This usually means the schema already contains objects without matching migration history.");

            await SeedIdentityAsync(scope.ServiceProvider, logger, configuration, environment);
            await RemediateLegacySeedAccountsAsync(scope.ServiceProvider, logger, configuration, environment);
        }
    }

    private static async Task SeedIdentityAsync(IServiceProvider services, ILogger logger, IConfiguration configuration, IHostEnvironment environment)
    {
        if (!ShouldSeedIdentity(configuration, environment))
        {
            logger.LogInformation("Identity seeding is disabled for this environment.");
            return;
        }

        try
        {
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
            var userManager = services.GetRequiredService<UserManager<AppUser>>();
            var seedConfiguration = services.GetRequiredService<IConfiguration>();
            await IdentitySeeder.SeedAsync(userManager, roleManager, environment, seedConfiguration);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to seed Identity roles and users.");
        }
    }

    private static async Task RemediateLegacySeedAccountsAsync(IServiceProvider services, ILogger logger, IConfiguration configuration, IHostEnvironment environment)
    {
        if (environment.IsDevelopment())
        {
            return;
        }

        try
        {
            var userManager = services.GetRequiredService<UserManager<AppUser>>();
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
            var dbContext = services.GetRequiredService<SkillSenseDbContext>();
            var passwordHasher = new PasswordHasher<AppUser>();

            var hasUsersTable = await RelationExistsAsync(dbContext, "users");
            if (!hasUsersTable)
            {
                logger.LogInformation("Skipping legacy account remediation because the users table does not exist yet.");
                return;
            }

            var users = await userManager.Users
                .Where(user => !string.IsNullOrWhiteSpace(user.PasswordHash))
                .ToListAsync();

            foreach (var user in users)
            {
                var verificationResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash!, IdentitySeeder.LegacyDefaultPassword);
                if (verificationResult == PasswordVerificationResult.Failed)
                {
                    continue;
                }

                user.LockoutEnabled = true;
                user.LockoutEnd = DateTimeOffset.MaxValue;
                await userManager.UpdateSecurityStampAsync(user);

                var updateResult = await userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                {
                    logger.LogWarning(
                        "Failed to lock account {Email} using the legacy default password: {Errors}",
                        user.Email,
                        string.Join("; ", updateResult.Errors.Select(error => error.Description)));
                    continue;
                }

                logger.LogWarning("Locked account {Email} because it still used the legacy default password.", user.Email);
            }

            var bootstrapSuperAdmin = await EnsureBootstrapUserAsync(
                userManager,
                roleManager,
                roleName: "SuperAdmin",
                email: configuration["Bootstrap:SuperAdminEmail"] ?? configuration["BOOTSTRAP_SUPERADMIN_EMAIL"],
                password: configuration["Bootstrap:SuperAdminPassword"] ?? configuration["BOOTSTRAP_SUPERADMIN_PASSWORD"],
                firstName: configuration["Bootstrap:SuperAdminFirstName"] ?? configuration["BOOTSTRAP_SUPERADMIN_FIRST_NAME"] ?? "Bootstrap",
                lastName: configuration["Bootstrap:SuperAdminLastName"] ?? configuration["BOOTSTRAP_SUPERADMIN_LAST_NAME"] ?? "Admin",
                logger: logger,
                logLabel: "bootstrap super admin");

            if (bootstrapSuperAdmin is not null)
            {
                logger.LogInformation("Bootstrap super admin account is ready for {Email}.", bootstrapSuperAdmin.Email);
            }

            var bootstrapRecruiter = await EnsureBootstrapUserAsync(
                userManager,
                roleManager,
                roleName: "Recruiter",
                email: configuration["Bootstrap:RecruiterEmail"] ?? configuration["BOOTSTRAP_RECRUITER_EMAIL"],
                password: configuration["Bootstrap:RecruiterPassword"] ?? configuration["BOOTSTRAP_RECRUITER_PASSWORD"],
                firstName: configuration["Bootstrap:RecruiterFirstName"] ?? configuration["BOOTSTRAP_RECRUITER_FIRST_NAME"] ?? "Bootstrap",
                lastName: configuration["Bootstrap:RecruiterLastName"] ?? configuration["BOOTSTRAP_RECRUITER_LAST_NAME"] ?? "Recruiter",
                logger: logger,
                logLabel: "bootstrap recruiter");

            var bootstrapRecruiterCompanyIdValue = configuration["Bootstrap:RecruiterCompanyId"] ?? configuration["BOOTSTRAP_RECRUITER_COMPANY_ID"];
            if (bootstrapRecruiter is not null && Guid.TryParse(bootstrapRecruiterCompanyIdValue, out var bootstrapRecruiterCompanyId))
            {
                var recruiterProfile = await dbContext.RecruiterProfiles
                    .FirstOrDefaultAsync(profile => profile.UserId == bootstrapRecruiter.Id);
                if (recruiterProfile is null)
                {
                    recruiterProfile = new RecruiterProfileEntity
                    {
                        Id = Guid.NewGuid(),
                        UserId = bootstrapRecruiter.Id,
                        CompanyId = bootstrapRecruiterCompanyId,
                        CreatedAtUtc = DateTime.UtcNow,
                    };
                    dbContext.RecruiterProfiles.Add(recruiterProfile);
                    await dbContext.SaveChangesAsync();
                }

                logger.LogInformation(
                    "Bootstrap recruiter account is ready for {Email} in company {CompanyId}.",
                    bootstrapRecruiter.Email,
                    bootstrapRecruiterCompanyId);
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to remediate legacy seeded accounts.");
        }
    }

    private static async Task<AppUser?> EnsureBootstrapUserAsync(
        UserManager<AppUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        string roleName,
        string? email,
        string? password,
        string firstName,
        string lastName,
        ILogger logger,
        string logLabel)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return null;
        }

        await EnsureRoleExistsAsync(roleManager, roleName);

        var passwordHasher = new PasswordHasher<AppUser>();
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var bootstrapUser = await userManager.FindByEmailAsync(normalizedEmail);
        if (bootstrapUser is null)
        {
            bootstrapUser = new AppUser
            {
                UserName = normalizedEmail,
                Email = normalizedEmail,
                NormalizedEmail = normalizedEmail.ToUpperInvariant(),
                NormalizedUserName = normalizedEmail.ToUpperInvariant(),
                EmailConfirmed = true,
                FirstName = firstName,
                LastName = lastName,
                LockoutEnabled = false,
                LockoutEnd = null,
            };

            var createResult = await userManager.CreateAsync(bootstrapUser, password);
            if (!createResult.Succeeded)
            {
                logger.LogWarning("Failed to create {Label} {Email}: {Errors}", logLabel, normalizedEmail, string.Join("; ", createResult.Errors.Select(error => error.Description)));
                return null;
            }
        }
        else
        {
            var passwordVerification = string.IsNullOrWhiteSpace(bootstrapUser.PasswordHash)
                ? PasswordVerificationResult.Failed
                : passwordHasher.VerifyHashedPassword(bootstrapUser, bootstrapUser.PasswordHash, password);

            if (passwordVerification == PasswordVerificationResult.Failed)
            {
                IdentityResult passwordResult;
                if (await userManager.HasPasswordAsync(bootstrapUser))
                {
                    var resetToken = await userManager.GeneratePasswordResetTokenAsync(bootstrapUser);
                    passwordResult = await userManager.ResetPasswordAsync(bootstrapUser, resetToken, password);
                }
                else
                {
                    passwordResult = await userManager.AddPasswordAsync(bootstrapUser, password);
                }

                if (!passwordResult.Succeeded)
                {
                    logger.LogWarning("Failed to set password for {Label} {Email}: {Errors}", logLabel, normalizedEmail, string.Join("; ", passwordResult.Errors.Select(error => error.Description)));
                    return null;
                }
            }

            bootstrapUser.EmailConfirmed = true;
            bootstrapUser.LockoutEnabled = false;
            bootstrapUser.LockoutEnd = null;
            bootstrapUser.FirstName = firstName;
            bootstrapUser.LastName = lastName;

            var updateResult = await userManager.UpdateAsync(bootstrapUser);
            if (!updateResult.Succeeded)
            {
                logger.LogWarning("Failed to update {Label} {Email}: {Errors}", logLabel, normalizedEmail, string.Join("; ", updateResult.Errors.Select(error => error.Description)));
                return null;
            }
        }

        if (!await userManager.IsInRoleAsync(bootstrapUser, roleName))
        {
            var roleAssignment = await userManager.AddToRoleAsync(bootstrapUser, roleName);
            if (!roleAssignment.Succeeded)
            {
                logger.LogWarning("Failed to assign role {RoleName} to {Email}: {Errors}", roleName, normalizedEmail, string.Join("; ", roleAssignment.Errors.Select(error => error.Description)));
                return null;
            }
        }

        return bootstrapUser;
    }

    private static async Task EnsureRoleExistsAsync(RoleManager<IdentityRole<Guid>> roleManager, string roleName)
    {
        if (await roleManager.RoleExistsAsync(roleName))
        {
            return;
        }

        await roleManager.CreateAsync(new IdentityRole<Guid>
        {
            Name = roleName,
            NormalizedName = roleName.ToUpperInvariant(),
        });
    }

    private static async Task<bool> RelationExistsAsync(DbContext dbContext, string relationName)
    {
        var exists = await dbContext.Database
            .SqlQuery<string?>($"SELECT to_regclass({relationName})::text AS \"Value\"")
            .SingleAsync();

        return !string.IsNullOrWhiteSpace(exists);
    }

    private static bool ShouldApplyMigrations(IConfiguration configuration, IHostEnvironment environment)
    {
        var configuredValue = configuration["APPLY_MIGRATIONS_ON_STARTUP"] ?? configuration["Database:ApplyMigrationsOnStartup"];
        return bool.TryParse(configuredValue, out var enabled)
            ? enabled
            : environment.IsDevelopment();
    }

    private static bool ShouldSeedIdentity(IConfiguration configuration, IHostEnvironment environment)
    {
        var configuredValue = configuration["ENABLE_IDENTITY_SEEDING"] ?? configuration["Seed:EnableIdentitySeeding"];
        return bool.TryParse(configuredValue, out var enabled)
            ? enabled
            : environment.IsDevelopment();
    }
}
