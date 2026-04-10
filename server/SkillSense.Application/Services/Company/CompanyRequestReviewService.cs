using System.Net;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Npgsql;
using SkillSense.Application.Contracts.Company;
using SkillSense.Application.Contracts.Email;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Company;
using SkillSense.Application.Options;
using SkillSense.Domain.Entities;
using SkillSense.Domain.Enums;
using SkillSense.Domain.Subscriptions;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services.Company;

public sealed class CompanyRequestReviewService(
    ICompanyLifecycleRepository repository,
    UserManager<AppUser> userManager,
    RoleManager<IdentityRole<Guid>> roleManager,
    IEmailService emailService,
    IOptions<PasswordResetOptions> passwordResetOptions,
    ILogger<CompanyRequestReviewService> logger) : ICompanyRequestReviewService
{
    public async Task<CompanyAccountRequestDetailsDto> ReviewAsync(
        Guid requestId,
        Guid reviewerUserId,
        ReviewCompanyAccountRequestDto request,
        CancellationToken ct = default)
    {
        logger.LogInformation(
            "Starting company request review for {RequestId} by reviewer {ReviewerUserId}. Approve={Approve}.",
            requestId,
            reviewerUserId,
            request.Approve);

        try
        {
            await using var transaction = await repository.BeginSerializableTransactionAsync(ct);

            var entity = await repository.GetRequestByIdForUpdateAsync(requestId, ct)
                ?? throw new KeyNotFoundException("Company account request was not found.");

            EnsurePendingReview(entity);

            ApprovalEmailPayload? approvalEmail = null;
            if (request.Approve)
            {
                approvalEmail = await ApproveAsync(entity, reviewerUserId, request.ReviewNotes, ct);
            }
            else
            {
                Reject(entity, reviewerUserId, request.ReviewNotes);
            }

            await repository.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            logger.LogInformation(
                "Completed company request review for {RequestId}. Final status: {Status}.",
                entity.Id,
                entity.Status);

            if (approvalEmail is not null)
            {
                await TrySendApprovalEmailAsync(approvalEmail, ct);
            }
            else
            {
                await TrySendRejectionEmailAsync(entity, ct);
            }

            return CompanySubscriptionMapping.ToDetailsDto(entity);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            logger.LogWarning(
                ex,
                "Concurrency conflict while reviewing company request {RequestId} by reviewer {ReviewerUserId}.",
                requestId,
                reviewerUserId);
            throw new InvalidOperationException("This company account request was already reviewed or changed by another admin. Refresh and try again.");
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.SerializationFailure)
        {
            logger.LogWarning(
                ex,
                "Serialization conflict while reviewing company request {RequestId} by reviewer {ReviewerUserId}.",
                requestId,
                reviewerUserId);
            throw new InvalidOperationException("This company account request was already reviewed or changed by another admin. Refresh and try again.");
        }
    }

    private async Task<ApprovalEmailPayload> ApproveAsync(
        CompanyAccountRequestEntity request,
        Guid reviewerUserId,
        string? reviewNotes,
        CancellationToken ct)
    {
        var nowUtc = DateTime.UtcNow;

        if (await repository.EmailExistsAsync(request.PrimaryAdminEmail, ct))
        {
            throw new InvalidOperationException("The primary admin email already belongs to an existing account.");
        }

        var company = new CompanyEntity
        {
            Id = Guid.NewGuid(),
            Name = request.CompanyName,
            BusinessName = request.BusinessName,
            Industry = request.Industry,
            CompanySize = request.CompanySize,
            WebsiteUrl = request.WebsiteUrl,
            Description = request.Description,
            Country = request.Country,
            CityProvince = request.CityProvince,
            FullAddress = request.FullAddress,
            PrimaryAdminFullName = request.PrimaryAdminFullName,
            PrimaryAdminPhone = request.PrimaryAdminPhone,
            PrimaryAdminRole = request.PrimaryAdminRole,
            PrimaryEmail = request.PrimaryAdminEmail,
            Location = $"{request.CityProvince}, {request.Country}",
            IsActive = true,
            CreatedAtUtc = nowUtc,
            UpdatedAtUtc = nowUtc,
        };

        await repository.AddCompanyAsync(company, ct);

        var userId = Guid.NewGuid();
        var user = new AppUser
        {
            Id = userId,
            Email = request.PrimaryAdminEmail,
            UserName = request.PrimaryAdminEmail,
            NormalizedEmail = request.PrimaryAdminEmail.ToUpperInvariant(),
            NormalizedUserName = request.PrimaryAdminEmail.ToUpperInvariant(),
            FirstName = FirstNameFromFullName(request.PrimaryAdminFullName),
            LastName = LastNameFromFullName(request.PrimaryAdminFullName),
            EmailConfirmed = true,
            IsActive = true,
            LockoutEnabled = false,
            AdminProfile = new AdminProfileEntity
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CompanyId = company.Id,
                CreatedAtUtc = nowUtc,
            },
        };

        var createUserResult = await userManager.CreateAsync(user);
        if (!createUserResult.Succeeded)
        {
            throw new InvalidOperationException(createUserResult.Errors.FirstOrDefault()?.Description ?? "Unable to create the company admin account.");
        }

        if (!await roleManager.RoleExistsAsync("CompanyAdmin"))
        {
            var createRoleResult = await roleManager.CreateAsync(new IdentityRole<Guid>("CompanyAdmin"));
            if (!createRoleResult.Succeeded)
            {
                throw new InvalidOperationException(createRoleResult.Errors.FirstOrDefault()?.Description ?? "Unable to create CompanyAdmin role.");
            }
        }

        var addRoleResult = await userManager.AddToRoleAsync(user, "CompanyAdmin");
        if (!addRoleResult.Succeeded)
        {
            throw new InvalidOperationException(addRoleResult.Errors.FirstOrDefault()?.Description ?? "Unable to assign CompanyAdmin role.");
        }

        var subscription = new CompanySubscriptionEntity
        {
            Id = Guid.NewGuid(),
            CompanyId = company.Id,
            PlanId = SubscriptionPlanCatalog.FreeTrialPlanId,
            BillingCycle = null,
            Status = CompanySubscriptionStatus.PendingActivation,
            AutoRenews = false,
            CreatedAtUtc = nowUtc,
            UpdatedAtUtc = nowUtc,
        };
        await repository.AddSubscriptionAsync(subscription, ct);

        var rawToken = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(48));
        var invitation = new CompanyInvitationEntity
        {
            Id = Guid.NewGuid(),
            CompanyId = company.Id,
            UserId = user.Id,
            Email = request.PrimaryAdminEmail,
            Role = "CompanyAdmin",
            TokenHash = HashToken(rawToken),
            ExpiresAtUtc = nowUtc.AddDays(7),
            Status = CompanyInvitationStatus.Pending,
            CreatedAtUtc = nowUtc,
        };

        await repository.AddInvitationAsync(invitation, ct);

        var invitationLink = BuildInvitationLink(rawToken);
        request.ReviewedByUserId = reviewerUserId;
        request.ReviewedAtUtc = nowUtc;
        request.ReviewNotes = NormalizeReviewNotes(reviewNotes);
        request.Status = CompanyAccountRequestStatus.Approved;

        logger.LogInformation(
            "Prepared approval for company request {RequestId} for company {CompanyName}. Invitation created for {Email}.",
            request.Id,
            company.Name,
            request.PrimaryAdminEmail);

        return new ApprovalEmailPayload(
            request.PrimaryAdminEmail,
            "Your SkillSense company admin invitation",
            BuildEmailHtml(company.Name, invitationLink, invitation.ExpiresAtUtc));
    }

    private static void EnsurePendingReview(CompanyAccountRequestEntity request)
    {
        if (request.Status != CompanyAccountRequestStatus.PendingReview)
        {
            throw new InvalidOperationException("This company account request has already been reviewed.");
        }
    }

    private static void Reject(CompanyAccountRequestEntity request, Guid reviewerUserId, string? reviewNotes)
    {
        request.ReviewedByUserId = reviewerUserId;
        request.ReviewedAtUtc = DateTime.UtcNow;
        request.ReviewNotes = NormalizeReviewNotes(reviewNotes);
        request.Status = CompanyAccountRequestStatus.Rejected;
    }

    private static string? NormalizeReviewNotes(string? reviewNotes)
        => string.IsNullOrWhiteSpace(reviewNotes) ? null : reviewNotes.Trim();

    private string BuildInvitationLink(string token)
    {
        var frontendBaseUrl = passwordResetOptions.Value.FrontendBaseUrl.Trim().TrimEnd('/');
        return $"{frontendBaseUrl}/company-invitation?token={WebUtility.UrlEncode(token)}";
    }

    private static string BuildEmailHtml(string companyName, string invitationLink, DateTime expiresAtUtc)
    {
        return $"""
            <p>Your company request for <strong>{WebUtility.HtmlEncode(companyName)}</strong> has been approved.</p>
            <p>Invited role: <strong>CompanyAdmin</strong></p>
            <p>Your subscription setup will be finalized when this invitation is accepted.</p>
            <p><a href="{WebUtility.HtmlEncode(invitationLink)}">Activate your SkillSense account</a></p>
            <p>This invitation expires on {expiresAtUtc:yyyy-MM-dd HH:mm} UTC.</p>
            """;
    }

    private async Task TrySendApprovalEmailAsync(ApprovalEmailPayload payload, CancellationToken ct)
    {
        try
        {
            await emailService.SendEmailAsync(new EmailMessage
            {
                ToEmail = payload.ToEmail,
                Subject = payload.Subject,
                Html = payload.Html,
            }, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send company approval invitation email to {Email}.", payload.ToEmail);
        }
    }

    private async Task TrySendRejectionEmailAsync(CompanyAccountRequestEntity request, CancellationToken ct)
    {
        try
        {
            await emailService.SendEmailAsync(new EmailMessage
            {
                ToEmail = request.PrimaryAdminEmail,
                Subject = "Your SkillSense company request update",
                Html = BuildRejectionEmailHtml(request.CompanyName, request.ReviewNotes),
            }, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send company request rejection email to {Email}.", request.PrimaryAdminEmail);
        }
    }

    private static string BuildRejectionEmailHtml(string companyName, string? reviewNotes)
    {
        var notesSection = string.IsNullOrWhiteSpace(reviewNotes)
            ? string.Empty
            : $"""
                <p><strong>Review notes:</strong></p>
                <p>{WebUtility.HtmlEncode(reviewNotes).Replace("\n", "<br />")}</p>
                """;

        return $"""
            <p>Your company account request for <strong>{WebUtility.HtmlEncode(companyName)}</strong> was not approved at this time.</p>
            <p>You may submit a new request after addressing the review feedback below.</p>
            {notesSection}
            <p>If you need help, please contact the SkillSense support team.</p>
            """;
    }

    internal static string HashToken(string token)
        => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token.Trim())));

    private static string? FirstNameFromFullName(string fullName)
        => fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).FirstOrDefault();

    private static string? LastNameFromFullName(string fullName)
    {
        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        return parts.Length <= 1 ? null : string.Join(' ', parts.Skip(1));
    }

    private sealed record ApprovalEmailPayload(string ToEmail, string Subject, string Html);
}
