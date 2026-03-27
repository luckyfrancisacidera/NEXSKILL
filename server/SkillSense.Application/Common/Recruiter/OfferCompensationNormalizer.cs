namespace SkillSense.Application.Common.Recruiter;

internal static class OfferCompensationNormalizer
{
    public const string AnnualUnit = "year";
    public const string PhpCurrency = "PHP";

    public static decimal? NormalizeToAnnual(decimal amount, string? salaryType, string? currency)
    {
        if (amount <= 0 || !string.Equals(currency?.Trim(), PhpCurrency, StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var normalizedSalaryType = salaryType?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedSalaryType))
        {
            return null;
        }

        if (normalizedSalaryType.Equals("Annual", StringComparison.OrdinalIgnoreCase))
        {
            return amount;
        }

        if (normalizedSalaryType.Equals("Monthly", StringComparison.OrdinalIgnoreCase))
        {
            return amount * 12m;
        }

        return null;
    }
}
