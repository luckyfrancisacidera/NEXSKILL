namespace SkillSense.Api.Extensions;

public static class CorsExtensions
{
    public const string ClientPolicyName = "client";

    public static IServiceCollection AddAppCors(this IServiceCollection services, IConfiguration configuration)
    {
        var allowedOrigins = configuration.GetAllowedOrigins();

        services.AddCors(options =>
        {
            options.AddPolicy(ClientPolicyName, policy =>
            {
                policy.WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        return services;
    }
}
