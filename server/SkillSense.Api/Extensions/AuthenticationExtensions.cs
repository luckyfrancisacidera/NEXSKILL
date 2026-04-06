using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SkillSense.Application.Common;
using SkillSense.Application.Interfaces.Auth;

namespace SkillSense.Api.Extensions;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddAppAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtKey = configuration.GetRequiredConfigurationValue("Jwt:Key");
        var jwtIssuer = configuration.GetRequiredConfigurationValue("Jwt:Issuer");
        var jwtAudience = configuration.GetRequiredConfigurationValue("Jwt:Audience");

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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

        services.AddAuthorization();

        return services;
    }
}
