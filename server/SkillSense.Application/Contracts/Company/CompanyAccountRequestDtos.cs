using Microsoft.AspNetCore.Http;

namespace SkillSense.Application.Contracts.Company;

public sealed class CreateCompanyAccountRequestDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public string CompanySize { get; set; } = string.Empty;
    public string? WebsiteUrl { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string CityProvince { get; set; } = string.Empty;
    public string FullAddress { get; set; } = string.Empty;
    public string PrimaryAdminFullName { get; set; } = string.Empty;
    public string PrimaryAdminEmail { get; set; } = string.Empty;
    public string PrimaryAdminPhone { get; set; } = string.Empty;
    public string PrimaryAdminRole { get; set; } = string.Empty;
    public string? BusinessRegistrationNumber { get; set; }
    public string? TaxId { get; set; }
    public IFormFile? BusinessPermitFile { get; set; }
    public IFormFile? CertificateOfRegistrationFile { get; set; }
}

public sealed class CompanyAccountRequestListItemDto
{
    public Guid Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string PrimaryAdminEmail { get; set; } = string.Empty;
    public string? RequestedPlanId { get; set; }
    public string? RequestedPlanName { get; set; }
    public string? BillingCycle { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime SubmittedAtUtc { get; set; }
}

public sealed class CompanyRequestDocumentDto
{
    public Guid Id { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public bool CanInlinePreview { get; set; }
}

public sealed class CompanyAccountRequestDetailsDto
{
    public Guid Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public string CompanySize { get; set; } = string.Empty;
    public string? WebsiteUrl { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string CityProvince { get; set; } = string.Empty;
    public string FullAddress { get; set; } = string.Empty;
    public string PrimaryAdminFullName { get; set; } = string.Empty;
    public string PrimaryAdminEmail { get; set; } = string.Empty;
    public string PrimaryAdminPhone { get; set; } = string.Empty;
    public string PrimaryAdminRole { get; set; } = string.Empty;
    public string? RequestedPlanId { get; set; }
    public string? RequestedPlanName { get; set; }
    public string? BillingCycle { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ReviewNotes { get; set; }
    public DateTime SubmittedAtUtc { get; set; }
    public DateTime? ReviewedAtUtc { get; set; }
    public IReadOnlyList<CompanyRequestDocumentDto> Documents { get; set; } = [];
}

public sealed class ReviewCompanyAccountRequestDto
{
    public bool Approve { get; set; }
    public string? ReviewNotes { get; set; }
}

public sealed class CompanyAccountRequestSubmissionResultDto
{
    public Guid RequestId { get; set; }
    public string Status { get; set; } = string.Empty;
}

public sealed class CompanyAdminEmailAvailabilityDto
{
    public string Email { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public string? Message { get; set; }
}
