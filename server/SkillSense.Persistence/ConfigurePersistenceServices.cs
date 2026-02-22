using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Repositories;

namespace SkillSense.Persistence;

public static class ConfigurePersistenceServices
{
    public static IServiceCollection AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PostgreSql")
            ?? throw new InvalidOperationException("Missing connection string: PostgreSql");

        services.AddDbContext<SkillSenseDbContext>(options => options.UseNpgsql(connectionString));

        services.AddScoped<IJobRepository, JobRepository>();
        services.AddScoped<IResumeSubmissionRepository, ResumeSubmissionRepository>();
        services.AddScoped<IResumeScoreRepository, ResumeScoreRepository>();

        return services;
    }
}
