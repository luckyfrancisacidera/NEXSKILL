namespace SkillSense.Application.Contracts.Company;

public sealed class CompanyInvitationViewDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string? BusinessName { get; set; }
    public string? Industry { get; set; }
    public string? CompanySize { get; set; }
    public string? FullAddress { get; set; }
    public string PrimaryAdminFullName { get; set; } = string.Empty;
    public string PrimaryAdminEmail { get; set; } = string.Empty;
    public string Role { get; set; } = "CompanyAdmin";
    public string PlanId { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public string BillingLabel { get; set; } = string.Empty;
    public string? BillingCycle { get; set; }
    public string? MockPaymentMethod { get; set; }
    public string? ReviewNotes { get; set; }
    public bool IsTrial { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public bool IsExpired { get; set; }
    public bool IsAccepted { get; set; }
    public string Email { get; set; } = string.Empty;
}

public sealed class AcceptCompanyInvitationDto
{
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
    public string PlanId { get; set; } = string.Empty;
    public string? BillingCycle { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public PaymentDetailsDto PaymentDetails { get; set; } = new();
}

public sealed class PaymentDetailsDto
{
    public CardDetailsDto? Card { get; set; }
    public WalletDetailsDto? Gcash { get; set; }
    public WalletDetailsDto? Maya { get; set; }
    public BankDetailsDto? Bank { get; set; }
    public PaypalDetailsDto? Paypal { get; set; }
}

public sealed class CardDetailsDto
{
    public string? CardName { get; set; }
    public string? CardNumber { get; set; }
    public string? CardExpiry { get; set; }
    public string? CardCvv { get; set; }
}

public sealed class WalletDetailsDto
{
    public string? Phone { get; set; }
    public string? AccountName { get; set; }
}

public sealed class BankDetailsDto
{
    public string? AccountName { get; set; }
    public string? BankName { get; set; }
    public string? AccountNumber { get; set; }
    public string? ReferenceNumber { get; set; }
}

public sealed class PaypalDetailsDto
{
    public string? Email { get; set; }
}