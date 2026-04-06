using SkillSense.Infrastructure.Options;

namespace SkillSense.Application.Tests;

public sealed class GmailSmtpOptionsTests
{
    [Fact]
    public void NormalizedAppPassword_RemovesWhitespaceFromDisplayedGmailAppPassword()
    {
        var options = new GmailSmtpOptions
        {
            AppPassword = "REDACTED_APP_PASSWORD",
        };

        Assert.Equal("REDACTED_APP_PASSWORD", options.NormalizedAppPassword);
    }

    [Fact]
    public void IsConfigured_UsesNormalizedAppPassword()
    {
        var options = new GmailSmtpOptions
        {
            Enabled = true,
            Host = "smtp.gmail.com",
            Port = 587,
            Email = "nexskillsupport@gmail.com",
            AppPassword = "REDACTED_APP_PASSWORD",
            FromEmail = "nexskillsupport@gmail.com",
        };

        Assert.True(options.IsConfigured());
    }
}
