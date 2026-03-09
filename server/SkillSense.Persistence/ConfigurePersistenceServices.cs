using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SkillSense.Domain.Entities;
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

        services.AddIdentityCore<AppUser>(options =>
        {
            options.Password.RequiredLength = 8;
            options.Password.RequireDigit = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.User.RequireUniqueEmail = true;
        })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<SkillSenseDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders();

        services.AddScoped<IAuthRepository, AuthRepository>();
        services.AddScoped<ICandidateExplanationRepository, CandidateExplanationRepository>();
        services.AddScoped<IJobRepository, JobRepository>();
        services.AddScoped<IJobSeekerRepository, JobSeekerRepository>();
        services.AddScoped<IRecruiterRepository, RecruiterRepository>();
        services.AddScoped<IResumeSubmissionRepository, ResumeSubmissionRepository>();
        services.AddScoped<IResumeScoreRepository, ResumeScoreRepository>();
        services.AddScoped<IResumeEmbeddingRepository, ResumeEmbeddingRepository>();

        return services;
    }
}
