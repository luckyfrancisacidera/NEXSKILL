using SkillSense.Application.Contracts.Company;
using SkillSense.Application.Interfaces.Company;
using SkillSense.Domain.Entities;
using SkillSense.Domain.Enums;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services.Company;

public sealed class CompanyAccountRequestService(
    ICompanyLifecycleRepository repository,
    IRequestDocumentStorageService documentStorageService) : ICompanyAccountRequestService
{
    public async Task<CompanyAccountRequestSubmissionResultDto> SubmitAsync(CreateCompanyAccountRequestDto request, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        ValidateSubmission(request);
        RequestDocumentValidation.ValidateOrThrow(request.BusinessPermitFile, "Business permit");
        RequestDocumentValidation.ValidateOrThrow(request.CertificateOfRegistrationFile, "Certificate of registration");

        var entity = new CompanyAccountRequestEntity
        {
            Id = Guid.NewGuid(),
            CompanyName = request.CompanyName.Trim(),
            BusinessName = request.BusinessName.Trim(),
            Industry = request.Industry.Trim(),
            CompanySize = request.CompanySize.Trim(),
            WebsiteUrl = NormalizeOptional(request.WebsiteUrl),
            Description = request.Description.Trim(),
            Country = request.Country.Trim(),
            CityProvince = request.CityProvince.Trim(),
            FullAddress = request.FullAddress.Trim(),
            PrimaryAdminFullName = request.PrimaryAdminFullName.Trim(),
            PrimaryAdminEmail = request.PrimaryAdminEmail.Trim(),
            PrimaryAdminPhone = request.PrimaryAdminPhone.Trim(),
            PrimaryAdminRole = request.PrimaryAdminRole.Trim(),
            RequestedPlanId = string.Empty,
            BillingCycle = null,
            BusinessRegistrationNumber = NormalizeOptional(request.BusinessRegistrationNumber),
            TaxId = NormalizeOptional(request.TaxId),
            Status = CompanyAccountRequestStatus.PendingReview,
            SubmittedAtUtc = DateTime.UtcNow,
        };

        await repository.AddRequestAsync(entity, ct);

        await SaveDocumentAsync(entity, request.BusinessPermitFile, CompanyDocumentType.BusinessPermit, ct);
        await SaveDocumentAsync(entity, request.CertificateOfRegistrationFile, CompanyDocumentType.CertificateOfRegistration, ct);

        await repository.SaveChangesAsync(ct);

        return new CompanyAccountRequestSubmissionResultDto
        {
            RequestId = entity.Id,
            Status = entity.Status.ToString(),
        };
    }

    public async Task<IReadOnlyList<CompanyAccountRequestListItemDto>> GetRequestsAsync(string? status, CancellationToken ct = default)
    {
        var parsedStatus = string.IsNullOrWhiteSpace(status)
            ? (CompanyAccountRequestStatus?)null
            : Enum.TryParse<CompanyAccountRequestStatus>(status, true, out var parsed)
                ? parsed
                : throw new ArgumentException("Invalid request status filter.");

        var items = await repository.GetRequestsAsync(parsedStatus, ct);
        return items.Select(CompanySubscriptionMapping.ToListItemDto).ToArray();
    }

    public async Task<CompanyAccountRequestDetailsDto?> GetDetailsAsync(Guid requestId, CancellationToken ct = default)
    {
        var entity = await repository.GetRequestByIdAsync(requestId, ct);
        return entity is null ? null : CompanySubscriptionMapping.ToDetailsDto(entity);
    }

    public async Task<CompanyAdminEmailAvailabilityDto> CheckPrimaryAdminEmailAvailabilityAsync(string email, CancellationToken ct = default)
    {
        var normalizedEmail = email?.Trim() ?? string.Empty;
        var isAvailable = !string.IsNullOrWhiteSpace(normalizedEmail)
            && !await repository.EmailExistsAsync(normalizedEmail, ct);

        return new CompanyAdminEmailAvailabilityDto
        {
            Email = normalizedEmail,
            IsAvailable = isAvailable,
            Message = isAvailable
                ? null
                : "The primary admin email already belongs to an existing account.",
        };
    }

    private async Task SaveDocumentAsync(
        CompanyAccountRequestEntity request,
        Microsoft.AspNetCore.Http.IFormFile? file,
        CompanyDocumentType documentType,
        CancellationToken ct)
    {
        if (file is null || file.Length <= 0)
        {
            return;
        }

        await using var stream = file.OpenReadStream();
        var stored = await documentStorageService.SaveAsync(stream, file.FileName, file.ContentType, ct);

        request.Documents.Add(new CompanyRequestDocumentEntity
        {
            Id = Guid.NewGuid(),
            CompanyAccountRequestId = request.Id,
            DocumentType = documentType,
            OriginalFileName = file.FileName,
            ContentType = file.ContentType,
            StorageKey = stored.StorageKey,
            StorageProvider = stored.StorageProvider,
            UploadedAtUtc = DateTime.UtcNow,
        });
    }

    private static void ValidateSubmission(CreateCompanyAccountRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.CompanyName)
            || string.IsNullOrWhiteSpace(request.BusinessName)
            || string.IsNullOrWhiteSpace(request.PrimaryAdminEmail)
            || string.IsNullOrWhiteSpace(request.PrimaryAdminFullName))
        {
            throw new ArgumentException("Company and primary admin details are required.");
        }
    }

    private static string? NormalizeOptional(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
