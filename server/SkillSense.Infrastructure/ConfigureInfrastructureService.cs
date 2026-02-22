using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SkillSense.Application.Interfaces;
using SkillSense.Infrastructure.BackgroundJobs;
using SkillSense.Infrastructure.Options;
using SkillSense.Infrastructure.Services;

namespace SkillSense.Infrastructure
{
public static class ConfigureInfrastructureService
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var baseUrl = configuration["ResumeParser:BaseUrl"];
        if (string.IsNullOrWhiteSpace(baseUrl))
            throw new InvalidOperationException("Missing config: ResumeParser:BaseUrl");

        services.AddHttpClient<IResumeParserClient, ResumeParserClient>(http =>
        {
            http.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");
            http.Timeout = TimeSpan.FromSeconds(60);
        });

        services.Configure<SbertOptions>(configuration.GetSection(SbertOptions.SectionName));
        services.AddSingleton<ITextEmbeddingService, SbertOnnxEmbeddingService>();

         services
        .AddOptions<CloudflareR2Options>()
        .Bind(configuration.GetSection(CloudflareR2Options.SectionName))
        .Validate(o => !string.IsNullOrWhiteSpace(o.AccountId), "Missing Cloudflare R2 AccountId")
        .Validate(o => !string.IsNullOrWhiteSpace(o.AccessKeyId), "Missing Cloudflare R2 AccessKeyId")
        .Validate(o => !string.IsNullOrWhiteSpace(o.SecretAccessKey), "Missing Cloudflare R2 SecretAccessKey")
        .Validate(o => !string.IsNullOrWhiteSpace(o.BucketName), "Missing Cloudflare R2 BucketName")
        .ValidateOnStart();
            services.AddSingleton<IObjectStorageService, CloudflareR2StorageService>();

        services.AddHostedService<ResumeProcessingWorker>();

        return services;
    }
}
}
