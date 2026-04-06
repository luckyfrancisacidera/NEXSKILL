using Microsoft.AspNetCore.Diagnostics;
using SkillSense.Application.Exceptions;

namespace SkillSense.Api.Extensions;

public static class ExceptionHandlingExtensions
{
    public static WebApplication UseAppExceptionHandling(this WebApplication app)
    {
        app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
        {
            context.Response.ContentType = "application/json";

            var error = context.Features.Get<IExceptionHandlerFeature>();
            var logger = context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("GlobalExceptionHandler");
            if (error is null)
            {
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await context.Response.WriteAsJsonAsync(new { message = "An unexpected error occurred." });
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

            context.Response.StatusCode = statusCode;
            await context.Response.WriteAsJsonAsync(new { message });
        }));

        return app;
    }
}
