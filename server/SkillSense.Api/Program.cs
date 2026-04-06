using SkillSense.Api;
using SkillSense.Api.Extensions;
using SkillSense.Application;
using SkillSense.Infrastructure;
using SkillSense.Persistence;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory,
});

builder.ConfigureAppHosting();

builder.Services.AddAppPlatformInfrastructure(builder.Configuration);
builder.Services.AddAppApiFrameworkServices();
builder.Services.AddAppAuthentication(builder.Configuration);
builder.Services.AddAppCors(builder.Configuration);
builder.Services.AddAppForwardedHeaders();
builder.Services.AddAppHealthChecks(builder.Configuration);
builder.Services.AddAppRateLimiting();

builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddPersistenceServices(builder.Configuration);
builder.Services.AddInfrastructureServices(builder.Configuration, builder.Environment);

var app = builder.Build();

app.LogEmailConfigurationStatus();

await app.ApplyMigrationsSafelyAsync();

if (builder.Configuration.ShouldRunMigrationsOnly())
{
    app.Logger.LogInformation("RUN_MIGRATIONS_ONLY is enabled. Exiting after startup migration phase.");
    return;
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAppExceptionHandling();
app.UseAppInfrastructurePipeline(builder.Configuration);

app.MapAppHealthEndpoints();
app.MapControllers();

app.Run();
