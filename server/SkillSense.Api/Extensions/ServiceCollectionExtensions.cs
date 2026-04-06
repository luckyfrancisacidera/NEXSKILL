using System.IO;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;

namespace SkillSense.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddAppPlatformInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var dataProtectionBuilder = services.AddDataProtection()
            .SetApplicationName("SkillSense");

        if (AppConfigurationExtensions.IsRunningInContainer())
        {
            var keyRingDirectory = new DirectoryInfo("/var/app/dataprotection-keys");
            keyRingDirectory.Create();
            dataProtectionBuilder.PersistKeysToFileSystem(keyRingDirectory);
        }

        services.AddMemoryCache();

        return services;
    }

    public static IServiceCollection AddAppApiFrameworkServices(this IServiceCollection services)
    {
        services.AddControllers();
        services.AddOpenApi();

        services.Configure<ApiBehaviorOptions>(options =>
        {
            options.InvalidModelStateResponseFactory = context =>
            {
                var errors = context.ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToArray();

                return new BadRequestObjectResult(new { message = "Validation failed.", errors });
            };
        });

        services.Configure<FormOptions>(options =>
        {
            options.MultipartHeadersLengthLimit = 1024 * 1024;
            options.MultipartBodyLengthLimit = 10 * 1024 * 1024;
            options.ValueLengthLimit = 1024 * 1024;
        });

        return services;
    }
}
