using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using SkillSense.Api;
using SkillSense.Api.Health;
using SkillSense.Application.Common;
using SkillSense.Application;
using SkillSense.Application.Exceptions;
using SkillSense.Application.Interfaces.Auth;
using SkillSense.Infrastructure;
using SkillSense.Infrastructure.Options;
using SkillSense.Persistence;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory,
});
var configuration = builder.Configuration;
var environment = builder.Environment;

var jwtKey = GetRequiredConfigurationValue(configuration, "Jwt:Key");
var jwtIssuer = GetRequiredConfigurationValue(configuration, "Jwt:Issuer");
var jwtAudience = GetRequiredConfigurationValue(configuration, "Jwt:Audience");
var allowedOrigins = GetAllowedOrigins(configuration);

builder.Services.AddControllers();
builder.Services.AddMemoryCache();
builder.Services.Configure<ApiBehaviorOptions>(options =>
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

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue("access_token", out var token))
                {
                    context.Token = token;
                }

                return Task.CompletedTask;
            },
            OnTokenValidated = async context =>
            {
                var userIdValue = context.Principal?.FindFirst(SkillSenseClaimTypes.UserId)?.Value
                    ?? context.Principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdValue, out var userId))
                {
                    context.Fail("Authenticated user is missing a valid identifier.");
                    return;
                }

                var authService = context.HttpContext.RequestServices.GetRequiredService<IAuthService>();
                var isActive = await authService.IsSessionActiveAsync(userId, context.HttpContext.RequestAborted);
                if (!isActive)
                {
                    context.Fail("Authenticated session is no longer active.");
                }
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddHttpClient("resume-parser-health", http =>
{
    http.BaseAddress = new Uri(GetRequiredConfigurationValue(configuration, "ResumeParser:BaseUrl").TrimEnd('/') + "/");
    http.Timeout = TimeSpan.FromSeconds(10);
});
builder.Services
    .AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("database", failureStatus: HealthStatus.Unhealthy, tags: ["ready"])
    .AddCheck<ResumeParserHealthCheck>("resume_parser", failureStatus: HealthStatus.Degraded, tags: ["ready"])
    .AddCheck<ResumeProcessingHealthCheck>("resume_processing", failureStatus: HealthStatus.Unhealthy, tags: ["ready"]);

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                AutoReplenishment = true,
            }));

    options.AddPolicy("password-reset-request", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 3,
                Window = TimeSpan.FromMinutes(5),
                QueueLimit = 0,
                AutoReplenishment = true,
            }));

    options.AddPolicy("password-reset-verify", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(5),
                QueueLimit = 0,
                AutoReplenishment = true,
            }));

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();
        }

        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            message = "Too many requests.",
            errors = new[] { "Please try again later." }
        }, token);
    };
});

builder.Services.AddOpenApi();

builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddPersistenceServices(builder.Configuration);
builder.Services.AddInfrastructureServices(builder.Configuration, builder.Environment);
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartHeadersLengthLimit = 1024 * 1024;
    options.MultipartBodyLengthLimit = 10 * 1024 * 1024;
    options.ValueLengthLimit = 1024 * 1024;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("client", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

LogEmailConfigurationStatus(app);

await app.ApplyMigrationsSafelyAsync();

if (ShouldRunMigrationsOnly(configuration))
{
    app.Logger.LogInformation("RUN_MIGRATIONS_ONLY is enabled. Exiting after startup migration phase.");
    return;
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseExceptionHandler(errApp => errApp.Run(async ctx =>
{
    ctx.Response.ContentType = "application/json";
    var error = ctx.Features.Get<IExceptionHandlerFeature>();
    var logger = ctx.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("GlobalExceptionHandler");
    if (error is null)
    {
        ctx.Response.StatusCode = 500;
        await ctx.Response.WriteAsJsonAsync(new { message = "An unexpected error occurred." });
        return;
    }

    var (statusCode, message) = error.Error switch
    {
        ArgumentException ex => (StatusCodes.Status400BadRequest, ex.Message),
        UnauthorizedAccessException ex => (StatusCodes.Status403Forbidden, ex.Message),
        InvalidOperationException ex => (StatusCodes.Status409Conflict, ex.Message),
        InvalidStageTransitionException ex => (StatusCodes.Status409Conflict, ex.Message),
        KeyNotFoundException ex => (StatusCodes.Status404NotFound, ex.Message),
        _ => (StatusCodes.Status500InternalServerError, error.Error.Message),
    };

    if (statusCode >= 500)
    {
        logger.LogError(error.Error, "Unhandled server exception. Inner exception: {InnerMessage}", error.Error.InnerException?.Message);
        message = "Something went wrong while processing your request. Please try again.";
    }

    ctx.Response.StatusCode = statusCode;
    await ctx.Response.WriteAsJsonAsync(new { message });

}));

app.UseForwardedHeaders();
app.UseHttpsRedirection();
app.UseCors("client");

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false,
    ResponseWriter = WriteHealthResponseAsync,
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = WriteHealthResponseAsync,
});
app.MapControllers();
app.Run();

static string GetRequiredConfigurationValue(IConfiguration configuration, string key)
{
    var value = configuration[key]?.Trim();
    if (string.IsNullOrWhiteSpace(value))
    {
        throw new InvalidOperationException($"Missing required configuration value: {key}");
    }

    return value;
}

static string[] GetAllowedOrigins(IConfiguration configuration)
{
    var configuredOrigins = configuration.GetSection("Client:AllowedOrigins").Get<string[]>()?
        .Where(origin => !string.IsNullOrWhiteSpace(origin))
        .Select(origin => origin.Trim().TrimEnd('/'))
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToArray();

    if (configuredOrigins is { Length: > 0 })
    {
        return configuredOrigins;
    }

    var envOrigins = configuration["CLIENT_ALLOWED_ORIGINS"]?
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        .Select(origin => origin.TrimEnd('/'))
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToArray();

    if (envOrigins is { Length: > 0 })
    {
        return envOrigins;
    }

    throw new InvalidOperationException("At least one client origin must be configured under Client:AllowedOrigins or CLIENT_ALLOWED_ORIGINS.");
}

static bool ShouldRunMigrationsOnly(IConfiguration configuration)
    => bool.TryParse(configuration["RUN_MIGRATIONS_ONLY"], out var enabled) && enabled;

static void LogEmailConfigurationStatus(WebApplication app)
{
    var smtpOptions = app.Services.GetRequiredService<IOptions<GmailSmtpOptions>>().Value;
    if (!smtpOptions.Enabled)
    {
        app.Logger.LogWarning("SMTP delivery is disabled for this environment. Password resets, interview invites, and email notifications will not be delivered.");
        return;
    }

    if (!smtpOptions.IsConfigured())
    {
        app.Logger.LogWarning("SMTP delivery is enabled but incomplete. Email-sending flows will log warnings and skip delivery until configuration is fixed.");
        return;
    }

    app.Logger.LogInformation("SMTP delivery is enabled and configured for host {Host}:{Port}.", smtpOptions.Host, smtpOptions.Port);
}

static Task WriteHealthResponseAsync(HttpContext context, HealthReport report)
{
    context.Response.ContentType = "application/json";
    return context.Response.WriteAsJsonAsync(new
    {
        status = report.Status.ToString(),
        totalDuration = report.TotalDuration,
        checks = report.Entries.ToDictionary(
            entry => entry.Key,
            entry => new
            {
                status = entry.Value.Status.ToString(),
                description = entry.Value.Description,
                duration = entry.Value.Duration,
                error = entry.Value.Exception?.Message,
            }),
    });
}
