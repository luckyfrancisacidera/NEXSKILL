using Microsoft.AspNetCore.Identity;
using SkillSense.Application.Contracts.Company;
using SkillSense.Application.Interfaces.Company;
using SkillSense.Domain.Entities;
using SkillSense.Domain.Enums;
using SkillSense.Domain.Subscriptions;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services.Company;

public sealed class CompanyInvitationService(
    ICompanyLifecycleRepository repository,
    UserManager<AppUser> userManager) : ICompanyInvitationService
{
    private static readonly HashSet<string> AllowedPaymentMethods = new(StringComparer.OrdinalIgnoreCase)
    {
        "gcash",
        "maya",
        "card",
        "bank-transfer",
        "paypal",
        "cash",
    };

    public async Task<CompanyInvitationViewDto?> GetInvitationAsync(string token, CancellationToken ct = default)
    {
        var invitation = await FindInvitationAsync(token, ct);
        if (invitation is null)
        {
            return null;
        }

        var subscription = await repository.GetCurrentSubscriptionAsync(invitation.CompanyId, ct);
        if (subscription is null)
        {
            return null;
        }

        var plan = SubscriptionPlanCatalog.GetRequired(subscription.PlanId);
        var approvedRequest = await repository.GetLatestApprovedRequestByPrimaryAdminEmailAsync(invitation.Email, ct);
        var isExpired = invitation.ExpiresAtUtc <= DateTime.UtcNow;
        if (isExpired && invitation.Status == CompanyInvitationStatus.Pending)
        {
            invitation.Status = CompanyInvitationStatus.Expired;
            await repository.SaveChangesAsync(ct);
        }

        return new CompanyInvitationViewDto
        {
            CompanyName = approvedRequest?.CompanyName ?? invitation.Company.Name,
            BusinessName = approvedRequest?.BusinessName ?? invitation.Company.BusinessName,
            Industry = approvedRequest?.Industry ?? invitation.Company.Industry,
            CompanySize = approvedRequest?.CompanySize ?? invitation.Company.CompanySize,
            FullAddress = approvedRequest?.FullAddress ?? invitation.Company.FullAddress,
            PrimaryAdminFullName = approvedRequest?.PrimaryAdminFullName ?? invitation.Company.PrimaryAdminFullName ?? string.Empty,
            PrimaryAdminEmail = approvedRequest?.PrimaryAdminEmail ?? invitation.Company.PrimaryEmail ?? invitation.Email,
            Role = invitation.Role,
            Email = invitation.Email,
            PlanId = plan.Id,
            PlanName = plan.Name,
            BillingCycle = subscription.BillingCycle?.ToString().ToLowerInvariant(),
            BillingLabel = plan.IsTrial
                ? "Trial"
                : subscription.BillingCycle?.ToString() ?? "Subscription",
            MockPaymentMethod = subscription.MockPaymentMethod,
            ReviewNotes = approvedRequest?.ReviewNotes,
            IsTrial = plan.IsTrial,
            ExpiresAtUtc = invitation.ExpiresAtUtc,
            IsExpired = isExpired,
            IsAccepted = invitation.AcceptedAtUtc.HasValue,
        };
    }

    public async Task AcceptAsync(string token, AcceptCompanyInvitationDto request, CancellationToken ct = default)
    {
        var password = request.Password?.Trim() ?? string.Empty;
        var confirmPassword = request.ConfirmPassword?.Trim() ?? string.Empty;
        var planId = request.PlanId?.Trim() ?? string.Empty;
        var paymentMethod = request.PaymentMethod?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(password) || password != confirmPassword)
        {
            throw new ArgumentException("Password confirmation does not match.");
        }

        var invitation = await FindInvitationAsync(token, ct)
            ?? throw new ArgumentException("Invitation is invalid.");

        if (invitation.AcceptedAtUtc.HasValue || invitation.Status == CompanyInvitationStatus.Accepted)
        {
            throw new InvalidOperationException("Invitation has already been accepted.");
        }

        if (invitation.ExpiresAtUtc <= DateTime.UtcNow)
        {
            invitation.Status = CompanyInvitationStatus.Expired;
            await repository.SaveChangesAsync(ct);
            throw new InvalidOperationException("Invitation has expired.");
        }

        var user = await userManager.FindByIdAsync(invitation.UserId?.ToString() ?? string.Empty)
            ?? throw new InvalidOperationException("The invited account could not be found.");

        if (await userManager.HasPasswordAsync(user))
        {
            throw new InvalidOperationException("This invited account already has a password. Proceed to login instead.");
        }

        var subscription = await repository.GetCurrentSubscriptionForUpdateAsync(invitation.CompanyId, ct)
            ?? throw new InvalidOperationException("The company subscription was not found.");

        ApplyMockSubscriptionSelection(
            subscription,
            planId,
            request.BillingCycle,
            paymentMethod,
            request.PaymentDetails);

        var addPasswordResult = await userManager.AddPasswordAsync(user, password);
        if (!addPasswordResult.Succeeded)
        {
            throw new ArgumentException(addPasswordResult.Errors.FirstOrDefault()?.Description ?? "Unable to set password.");
        }

        invitation.AcceptedAtUtc = DateTime.UtcNow;
        invitation.Status = CompanyInvitationStatus.Accepted;

        ActivateSubscription(subscription);
        await repository.SaveChangesAsync(ct);
    }

    private async Task<CompanyInvitationEntity?> FindInvitationAsync(string token, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return null;
        }

        return await repository.GetInvitationByTokenHashAsync(CompanyRequestReviewService.HashToken(token), ct);
    }

    private static void ActivateSubscription(CompanySubscriptionEntity subscription)
    {
        var nowUtc = DateTime.UtcNow;
        var plan = SubscriptionPlanCatalog.GetRequired(subscription.PlanId);
        subscription.StartsAtUtc = nowUtc;
        subscription.Status = CompanySubscriptionStatus.Active;
        subscription.LastEnforcedAtUtc = nowUtc;
        subscription.UpdatedAtUtc = nowUtc;

        if (plan.IsTrial)
        {
            subscription.TrialEndsAtUtc = nowUtc.AddDays(plan.TrialDurationDays ?? 14);
            subscription.EndsAtUtc = subscription.TrialEndsAtUtc;
            return;
        }

        subscription.EndsAtUtc = subscription.BillingCycle == CompanyBillingCycle.Annual
            ? nowUtc.AddYears(1)
            : nowUtc.AddMonths(1);
    }

    private static void ApplyMockSubscriptionSelection(
        CompanySubscriptionEntity subscription,
        string planId,
        string? billingCycle,
        string paymentMethod,
        PaymentDetailsDto paymentDetails)
    {
        if (string.IsNullOrWhiteSpace(planId))
        {
            throw new ArgumentException("Select a subscription plan to continue.");
        }

        if (string.IsNullOrWhiteSpace(paymentMethod))
        {
            throw new ArgumentException("Select a payment method to continue.");
        }

        if (!AllowedPaymentMethods.Contains(paymentMethod))
        {
            throw new ArgumentException("Select a valid payment method to continue.");
        }

        ValidatePaymentDetails(paymentMethod, paymentDetails);

        var plan = SubscriptionPlanCatalog.GetRequired(planId);
        var normalizedBillingCycle = NormalizeBillingCycle(plan, billingCycle);

        subscription.PlanId = plan.Id;
        subscription.BillingCycle = normalizedBillingCycle;
        subscription.MockPaymentMethod = paymentMethod.ToLowerInvariant();
        subscription.AutoRenews = !plan.IsTrial;
        subscription.UpdatedAtUtc = DateTime.UtcNow;
    }

    private static CompanyBillingCycle? NormalizeBillingCycle(SubscriptionPlanDefinition plan, string? billingCycle)
    {
        if (plan.IsTrial)
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(billingCycle))
        {
            throw new ArgumentException("Select a billing cycle to continue.");
        }

        if (!Enum.TryParse<CompanyBillingCycle>(billingCycle, true, out var parsedBillingCycle))
        {
            throw new ArgumentException("Select a valid billing cycle to continue.");
        }

        if (parsedBillingCycle == CompanyBillingCycle.Annual && !plan.SupportsAnnual)
        {
            throw new ArgumentException("Select a valid billing cycle to continue.");
        }

        return parsedBillingCycle;
    }

    private static void ValidatePaymentDetails(string paymentMethod, PaymentDetailsDto details)
    {
        if (details is null)
        {
            throw new ArgumentException("Payment details are required.");
        }

        switch (paymentMethod.ToLowerInvariant())
        {
            case "card":
                if (details.Card is null ||
                    string.IsNullOrWhiteSpace(details.Card.CardName) ||
                    string.IsNullOrWhiteSpace(details.Card.CardNumber) ||
                    string.IsNullOrWhiteSpace(details.Card.CardExpiry) ||
                    string.IsNullOrWhiteSpace(details.Card.CardCvv))
                {
                    throw new ArgumentException("Complete card details are required.");
                }
                break;

            case "gcash":
                if (details.Gcash is null ||
                    string.IsNullOrWhiteSpace(details.Gcash.Phone) ||
                    string.IsNullOrWhiteSpace(details.Gcash.AccountName))
                {
                    throw new ArgumentException("Complete GCash details are required.");
                }
                break;

            case "maya":
                if (details.Maya is null ||
                    string.IsNullOrWhiteSpace(details.Maya.Phone) ||
                    string.IsNullOrWhiteSpace(details.Maya.AccountName))
                {
                    throw new ArgumentException("Complete Maya details are required.");
                }
                break;

            case "bank-transfer":
                if (details.Bank is null ||
                    string.IsNullOrWhiteSpace(details.Bank.AccountName) ||
                    string.IsNullOrWhiteSpace(details.Bank.BankName) ||
                    string.IsNullOrWhiteSpace(details.Bank.AccountNumber))
                {
                    throw new ArgumentException("Complete bank transfer details are required.");
                }
                break;

            case "paypal":
                if (details.Paypal is null ||
                    string.IsNullOrWhiteSpace(details.Paypal.Email))
                {
                    throw new ArgumentException("Valid PayPal details are required.");
                }
                break;

            case "cash":
                break;

            default:
                throw new ArgumentException("Unsupported payment method.");
        }
    }
}