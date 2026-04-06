using Microsoft.AspNetCore.HttpOverrides;

namespace SkillSense.Api.Extensions;

public static class ForwardedHeadersExtensions
{
    public static IServiceCollection AddAppForwardedHeaders(this IServiceCollection services)
    {
        services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost;

            // Preserve the current deployment behavior by accepting forwarded headers from non-IIS proxies
            // without pinning specific networks here. Tighten this with KnownProxies/KnownNetworks when infra allows.
            options.KnownIPNetworks.Clear();
            options.KnownProxies.Clear();
        });

        return services;
    }
}
