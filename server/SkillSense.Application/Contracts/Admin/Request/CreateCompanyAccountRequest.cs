using System.ComponentModel.DataAnnotations;

namespace SkillSense.Application.Contracts.Admin.Request;

public sealed class CreateCompanyAccountRequest
{
    [Required, MinLength(2), MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [EmailAddress]
    public string? PrimaryEmail { get; set; }

    [MaxLength(200)]
    public string? Location { get; set; }

    [Required, EmailAddress]
    public string AdminEmail { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string AdminPassword { get; set; } = string.Empty;
}
