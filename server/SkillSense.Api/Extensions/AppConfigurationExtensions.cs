using System.IO;

namespace SkillSense.Api.Extensions;

public static class AppConfigurationExtensions
{
    public static void ConfigureAppHosting(this WebApplicationBuilder builder)
    {
        var renderPort = builder.Configuration["PORT"]?.Trim();
        if (!string.IsNullOrWhiteSpace(renderPort))
        {
            builder.WebHost.UseUrls($"http://+:{renderPort}");
        }
    }

    public static string GetRequiredConfigurationValue(this IConfiguration configuration, string key)
    {
        var value = configuration[key]?.Trim();
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidOperationException($"Missing required configuration value: {key}");
        }

        return value;
    }

    public static string[] GetAllowedOrigins(this IConfiguration configuration)
    {
        var envOrigins = configuration["CLIENT_ALLOWED_ORIGINS"]?
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(origin => origin.TrimEnd('/'))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (envOrigins is { Length: > 0 })
        {
            return envOrigins;
        }

        var configuredOrigins = configuration.GetSection("Client:AllowedOrigins").Get<string[]>()?
            .Where(origin => !string.IsNullOrWhiteSpace(origin))
            .Select(origin => origin.Trim().TrimEnd('/'))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (configuredOrigins is { Length: > 0 })
        {
            return configuredOrigins;
        }

        throw new InvalidOperationException("At least one client origin must be configured under Client:AllowedOrigins or CLIENT_ALLOWED_ORIGINS.");
    }

    public static bool ShouldRunMigrationsOnly(this IConfiguration configuration)
        => bool.TryParse(configuration["RUN_MIGRATIONS_ONLY"], out var enabled) && enabled;

    public static bool IsRunningInContainer()
        => string.Equals(
            Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER"),
            "true",
            StringComparison.OrdinalIgnoreCase);

    public static bool ShouldUseHttpsRedirection(this IConfiguration configuration, IHostEnvironment environment)
    {
        var configuredValue =
            configuration["ENABLE_HTTPS_REDIRECTION"] ??
            configuration["HTTPS_REDIRECTION_ENABLED"] ??
            configuration["HttpsRedirection:Enabled"];

        if (bool.TryParse(configuredValue, out var enabled))
        {
            return enabled;
        }

        // Preserve local developer experience when HTTPS is configured but the flag has not been set yet.
        if (environment.IsDevelopment())
        {
            return true;
        }

        return false;
    }
}
