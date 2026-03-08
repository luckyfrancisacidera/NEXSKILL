using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SkillSense.Application.Interfaces.Auth;

namespace SkillSense.Infrastructure.Services;

public sealed class MyMailResetPinEmailSender(HttpClient httpClient, IConfiguration configuration, ILogger<MyMailResetPinEmailSender> logger) : IResetPinEmailSender
{
    public async Task SendResetPinAsync(string toEmail, string pin, CancellationToken ct = default)
    {
        var apiUrl = configuration["MyMail:BaseUrl"];
        var apiKey = configuration["MyMail:ApiKey"];
        var fromEmail = configuration["MyMail:FromEmail"] ?? "no-reply@nexskill.local";

        if (string.IsNullOrWhiteSpace(apiUrl) || string.IsNullOrWhiteSpace(apiKey))
        {
            logger.LogInformation("MyMail not configured. Password reset PIN for {Email}: {Pin}", toEmail, pin);
            return;
        }

        using var req = new HttpRequestMessage(HttpMethod.Post, apiUrl.TrimEnd('/') + "/send")
        {
            Content = JsonContent.Create(new
            {
                from = fromEmail,
                to = toEmail,
                subject = "Your Nexskill password reset PIN",
                text = $"Use this 6-digit PIN to reset your password: {pin}. It expires in 15 minutes."
            })
        };
        req.Headers.Add("X-API-Key", apiKey);

        var response = await httpClient.SendAsync(req, ct);
        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("Failed to send reset PIN email. Status: {Status}", response.StatusCode);
        }
    }
}
