namespace SkillSense.Api.Extensions;

public static class ApplicationBuilderExtensions
{
    public static WebApplication UseAppInfrastructurePipeline(this WebApplication app, IConfiguration configuration)
    {
        app.UseForwardedHeaders();

        if (configuration.ShouldUseHttpsRedirection(app.Environment))
        {
            app.UseHttpsRedirection();
        }

        app.UseCors(CorsExtensions.ClientPolicyName);
        app.UseRateLimiter();
        app.UseAuthentication();
        app.UseAuthorization();

        return app;
    }
}
