using SkillSense.Infrastructure.Options;

namespace SkillSense.Application.Tests;

public sealed class GmailSmtpOptionsTests
{
    [Fact]
    public void NormalizedAppPassword_RemovesWhitespaceFromDisplayedGmailAppPassword()
    {
        var options = new GmailSmtpOptions
        {
            AppPassword = "tpyg kblx wcli cpsr",
        };

        Assert.Equal("tpygkblxwclicpsr", options.NormalizedAppPassword);
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
            AppPassword = "tpyg kblx wcli cpsr",
            FromEmail = "nexskillsupport@gmail.com",
        };

        Assert.True(options.IsConfigured());
    }
}
