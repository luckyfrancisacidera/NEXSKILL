using System.Net.Http.Json;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SkillSense.Application.Interfaces;

namespace SkillSense.Infrastructure.Services;

public sealed class MyMailInterviewInviteEmailSender(
    HttpClient httpClient,
    IConfiguration configuration,
    ILogger<MyMailInterviewInviteEmailSender> logger) : IInterviewInviteEmailSender
{
    public async Task SendCalendarInviteAsync(
        string toEmail,
        string subject,
        string body,
        string attachmentFileName,
        string calendarContent,
        CancellationToken ct = default)
    {
        var apiUrl = configuration["MyMail:BaseUrl"];
        var apiKey = configuration["MyMail:ApiKey"];
        var fromEmail = configuration["MyMail:FromEmail"] ?? "no-reply@nexskill.local";

        if (!TryBuildSendEndpoint(apiUrl, out var sendEndpoint) || string.IsNullOrWhiteSpace(apiKey))
        {
            logger.LogInformation(
                "MyMail not configured with a valid absolute BaseUrl. Interview invite for {Email} prepared with attachment {Attachment}.",
                toEmail,
                attachmentFileName);
            return;
        }

        using var req = new HttpRequestMessage(HttpMethod.Post, sendEndpoint)
        {
            Content = JsonContent.Create(new
            {
                from = new
                {
                    email = fromEmail,
                    name = "SkillSense",
                },
                to = new[]
                {
                    new
                    {
                        email = toEmail,
                    }
                },
                subject,
                text = body,
                attachments = new[]
                {
                    new
                    {
                        filename = attachmentFileName,
                        type = "text/calendar; charset=utf-8",
                        disposition = "attachment",
                        content = Convert.ToBase64String(Encoding.UTF8.GetBytes(calendarContent)),
                    }
                }
            })
        };
        req.Headers.Add("Api-Token", apiKey);

        var response = await httpClient.SendAsync(req, ct);
        if (!response.IsSuccessStatusCode)
        {
            var responseBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogWarning(
                "Failed to send interview invite email to {Email}. Status: {Status}. Response: {Response}",
                toEmail,
                response.StatusCode,
                responseBody);
        }
    }

    private static bool TryBuildSendEndpoint(string? apiUrl, out string endpoint)
    {
        endpoint = string.Empty;

        if (string.IsNullOrWhiteSpace(apiUrl))
        {
            return false;
        }

        if (!Uri.TryCreate(apiUrl.Trim(), UriKind.Absolute, out var baseUri)
            || (baseUri.Scheme != Uri.UriSchemeHttp && baseUri.Scheme != Uri.UriSchemeHttps))
        {
            return false;
        }

        endpoint = baseUri.AbsolutePath.EndsWith("/send", StringComparison.OrdinalIgnoreCase)
            ? baseUri.ToString()
            : new Uri(baseUri, "send").ToString();
        return true;
    }
}
