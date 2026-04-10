using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Configurations;

internal sealed class CompanyAccountRequestConfiguration : IEntityTypeConfiguration<CompanyAccountRequestEntity>
{
    public void Configure(EntityTypeBuilder<CompanyAccountRequestEntity> builder)
    {
        builder.ToTable("company_account_requests");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.BusinessName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Industry).HasMaxLength(120).IsRequired();
        builder.Property(x => x.CompanySize).HasMaxLength(80).IsRequired();
        builder.Property(x => x.WebsiteUrl).HasMaxLength(500);
        builder.Property(x => x.Description).HasMaxLength(4000).IsRequired();
        builder.Property(x => x.Country).HasMaxLength(120).IsRequired();
        builder.Property(x => x.CityProvince).HasMaxLength(120).IsRequired();
        builder.Property(x => x.FullAddress).HasMaxLength(500).IsRequired();
        builder.Property(x => x.PrimaryAdminFullName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.PrimaryAdminEmail).HasMaxLength(320).IsRequired();
        builder.Property(x => x.PrimaryAdminPhone).HasMaxLength(64).IsRequired();
        builder.Property(x => x.PrimaryAdminRole).HasMaxLength(120).IsRequired();
        builder.Property(x => x.RequestedPlanId).HasMaxLength(50).IsRequired();
        builder.Property(x => x.BusinessRegistrationNumber).HasMaxLength(120);
        builder.Property(x => x.TaxId).HasMaxLength(120);
        builder.Property(x => x.ReviewNotes).HasMaxLength(2000);
        builder.Property(x => x.SubmittedAtUtc).IsRequired();

        builder.HasMany(x => x.Documents)
            .WithOne(x => x.CompanyAccountRequest)
            .HasForeignKey(x => x.CompanyAccountRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.SubmittedAtUtc);
    }
}
