using SkillSense.Application.Contracts.Company;
using SkillSense.Domain.Entities;
using SkillSense.Domain.Enums;
using SkillSense.Domain.Subscriptions;

namespace SkillSense.Application.Services.Company;

internal static class CompanySubscriptionMapping
{
    public static CompanyAccountRequestDetailsDto ToDetailsDto(CompanyAccountRequestEntity request)
    {
        return new CompanyAccountRequestDetailsDto
        {
            Id = request.Id,
            CompanyName = request.CompanyName,
            BusinessName = request.BusinessName,
            Industry = request.Industry,
            CompanySize = request.CompanySize,
            WebsiteUrl = request.WebsiteUrl,
            Description = request.Description,
            Country = request.Country,
            CityProvince = request.CityProvince,
            FullAddress = request.FullAddress,
            PrimaryAdminFullName = request.PrimaryAdminFullName,
            PrimaryAdminEmail = request.PrimaryAdminEmail,
            PrimaryAdminPhone = request.PrimaryAdminPhone,
            PrimaryAdminRole = request.PrimaryAdminRole,
            RequestedPlanId = string.IsNullOrWhiteSpace(request.RequestedPlanId) ? null : request.RequestedPlanId,
            RequestedPlanName = ResolveRequestedPlanName(request.RequestedPlanId),
            BillingCycle = string.IsNullOrWhiteSpace(request.RequestedPlanId) ? null : request.BillingCycle?.ToString(),
            Status = request.Status.ToString(),
            ReviewNotes = request.ReviewNotes,
            SubmittedAtUtc = request.SubmittedAtUtc,
            ReviewedAtUtc = request.ReviewedAtUtc,
            Documents = request.Documents
                .OrderBy(x => x.UploadedAtUtc)
                .Select(x => new CompanyRequestDocumentDto
                {
                    Id = x.Id,
                    DocumentType = x.DocumentType.ToString(),
                    OriginalFileName = x.OriginalFileName,
                    ContentType = x.ContentType,
                    CanInlinePreview = RequestDocumentValidation.CanInlinePreview(x.ContentType),
                })
                .ToArray(),
        };
    }

    public static CompanyAccountRequestListItemDto ToListItemDto(CompanyAccountRequestEntity request)
    {
        return new CompanyAccountRequestListItemDto
        {
            Id = request.Id,
            CompanyName = request.CompanyName,
            PrimaryAdminEmail = request.PrimaryAdminEmail,
            RequestedPlanId = string.IsNullOrWhiteSpace(request.RequestedPlanId) ? null : request.RequestedPlanId,
            RequestedPlanName = ResolveRequestedPlanName(request.RequestedPlanId),
            BillingCycle = string.IsNullOrWhiteSpace(request.RequestedPlanId) ? null : request.BillingCycle?.ToString(),
            Status = request.Status.ToString(),
            SubmittedAtUtc = request.SubmittedAtUtc,
        };
    }

    private static string? ResolveRequestedPlanName(string? requestedPlanId)
    {
        if (string.IsNullOrWhiteSpace(requestedPlanId))
        {
            return null;
        }

        return SubscriptionPlanCatalog.GetRequired(requestedPlanId).Name;
    }

    public static CompanyBillingCycle? ParseBillingCycle(string? billingCycle)
    {
        if (string.IsNullOrWhiteSpace(billingCycle))
        {
            return null;
        }

        return Enum.TryParse<CompanyBillingCycle>(billingCycle, true, out var parsed)
            ? parsed
            : throw new ArgumentException("Billing cycle must be Monthly or Annual.");
    }
}
