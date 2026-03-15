using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Auth;
using SkillSense.Infrastructure.Auth;
using SkillSense.Infrastructure.BackgroundJobs;
using SkillSense.Infrastructure.Options;
using SkillSense.Infrastructure.Services;

namespace SkillSense.Infrastructure
{
public static class ConfigureInfrastructureService
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
    {
        var baseUrl = configuration["ResumeParser:BaseUrl"];
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            throw new InvalidOperationException("Missing config: ResumeParser:BaseUrl");
        }

        services.AddHttpClient<IResumeParserClient, ResumeParserClient>(http =>
        {
            http.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");
            http.Timeout = TimeSpan.FromSeconds(60);
        });

        services.Configure<SbertOptions>(configuration.GetSection(SbertOptions.SectionName));
        services.AddSingleton<ITextEmbeddingService, SbertOnnxEmbeddingService>();

        services.Configure<GroqOptions>(configuration.GetSection(GroqOptions.SectionName));
        services.AddHttpClient<IGenerativeExplanationProvider, GroqExplanationProvider>(http =>
        {
            http.BaseAddress = new Uri("https://api.groq.com/openai/v1/");
            http.Timeout = TimeSpan.FromSeconds(20);
        });

        var storageOptions = BuildStorageOptions(configuration, environment);
        var cloudflareOptions = BuildCloudflareOptions(configuration);

        services.AddSingleton(Microsoft.Extensions.Options.Options.Create(storageOptions));
        services.AddSingleton(Microsoft.Extensions.Options.Options.Create(cloudflareOptions));
        if (storageOptions.Driver.Equals("cloud", StringComparison.OrdinalIgnoreCase))
        {
            services.AddSingleton<IObjectStorageService, CloudflareR2StorageService>();
        }
        else
        {
            services.AddSingleton<IObjectStorageService, LocalObjectStorageService>();
        }

        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddScoped<IInterviewCalendarService, InterviewCalendarService>();
        services.AddHttpClient<IInterviewInviteEmailSender, MyMailInterviewInviteEmailSender>();
        services.AddHttpClient<IResetPinEmailSender, MyMailResetPinEmailSender>();

        services
            .AddOptions<ResumeProcessingWorkerOptions>()
            .Bind(configuration.GetSection(ResumeProcessingWorkerOptions.SectionName))
            .ValidateOnStart();
        services.AddHostedService<ResumeProcessingWorker>();

        return services;
    }

    private static StorageOptions BuildStorageOptions(IConfiguration configuration, IHostEnvironment environment)
    {
        var requestedDriver = GetSetting(configuration, "Storage:Driver", "STORAGE_DRIVER");
        var normalizedDriver = string.IsNullOrWhiteSpace(requestedDriver)
            ? "local"
            : requestedDriver.Trim().Equals("cloud", StringComparison.OrdinalIgnoreCase) ? "cloud" : "local";

        var localRootPath = GetSetting(configuration, "Storage:LocalRootPath", "LOCAL_STORAGE_ROOT_PATH");
        if (string.IsNullOrWhiteSpace(localRootPath))
        {
            localRootPath = Path.Combine(environment.ContentRootPath, "storage");
        }

        var expiryValue = GetSetting(configuration, "Storage:ResumeDownloadUrlExpirySeconds", "RESUME_DOWNLOAD_URL_EXPIRY_SECONDS");
        var expirySeconds = int.TryParse(expiryValue, out var parsedExpiry)
            ? Math.Clamp(parsedExpiry, 60, 300)
            : 120;

        var cloudflareOptions = BuildCloudflareOptions(configuration);
        if (normalizedDriver == "cloud" && !IsCloudflareConfigured(cloudflareOptions))
        {
            if (!environment.IsDevelopment())
            {
                throw new InvalidOperationException("Cloud storage is enabled but Cloudflare R2 configuration is incomplete.");
            }

            Console.WriteLine("Warning: STORAGE_DRIVER=cloud was requested but Cloudflare R2 configuration is incomplete. Falling back to local storage.");
            normalizedDriver = "local";
        }

        return new StorageOptions
        {
            Driver = normalizedDriver,
            LocalRootPath = localRootPath,
            ResumeDownloadUrlExpirySeconds = expirySeconds,
        };
    }

    private static CloudflareR2Options BuildCloudflareOptions(IConfiguration configuration)
        => new()
        {
            AccountId = GetSetting(configuration, "CloudflareR2:AccountId", "CLOUDFLARE_R2_ACCOUNT_ID") ?? string.Empty,
            AccessKeyId = GetSetting(configuration, "CloudflareR2:AccessKeyId", "CLOUDFLARE_R2_ACCESS_KEY_ID") ?? string.Empty,
            SecretAccessKey = GetSetting(configuration, "CloudflareR2:SecretAccessKey", "CLOUDFLARE_R2_SECRET_ACCESS_KEY") ?? string.Empty,
            BucketName = GetSetting(configuration, "CloudflareR2:BucketName", "CLOUDFLARE_R2_BUCKET_NAME") ?? string.Empty,
            PublicBaseUrl = GetSetting(configuration, "CloudflareR2:PublicBaseUrl", "CLOUDFLARE_R2_PUBLIC_BASE_URL") ?? string.Empty,
        };

    private static bool IsCloudflareConfigured(CloudflareR2Options options)
        => !string.IsNullOrWhiteSpace(options.AccountId)
            && !string.IsNullOrWhiteSpace(options.AccessKeyId)
            && !string.IsNullOrWhiteSpace(options.SecretAccessKey)
            && !string.IsNullOrWhiteSpace(options.BucketName);

    private static string? GetSetting(IConfiguration configuration, string sectionKey, string environmentKey)
        => configuration[sectionKey] ?? configuration[environmentKey];
}
}
