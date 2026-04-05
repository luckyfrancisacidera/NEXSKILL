namespace SkillSense.Application.Contracts.Auth;

/* =========================================
   ACCOUNT SETUP REQUESTS
========================================= */

public sealed record CompleteRecruiterSetupRequest(
    string CompanyName,
    string CompanyEmail,
    string? Location);

public sealed record CompleteCompanyAdminSetupRequest(
    string CompanyName,
    string CompanyEmail,
    string? Location,
    string AdminName,
    string AdminEmail);
