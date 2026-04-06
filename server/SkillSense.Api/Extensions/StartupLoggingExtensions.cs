using Microsoft.Extensions.Options;
using SkillSense.Infrastructure.Options;

namespace SkillSense.Api.Extensions;

public static class StartupLoggingExtensions
{
    public static void LogEmailConfigurationStatus(this WebApplication app)
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
}
