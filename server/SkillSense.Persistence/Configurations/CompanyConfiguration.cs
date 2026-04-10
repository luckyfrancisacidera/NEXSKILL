using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Configurations;

internal sealed class CompanyConfiguration : IEntityTypeConfiguration<CompanyEntity>
{
    public void Configure(EntityTypeBuilder<CompanyEntity> builder)
    {
        builder.ToTable("companies");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.BusinessName).HasMaxLength(200);
        builder.Property(x => x.Industry).HasMaxLength(120);
        builder.Property(x => x.CompanySize).HasMaxLength(80);
        builder.Property(x => x.WebsiteUrl).HasMaxLength(500);
        builder.Property(x => x.Description).HasMaxLength(4000);
        builder.Property(x => x.Country).HasMaxLength(120);
        builder.Property(x => x.CityProvince).HasMaxLength(120);
        builder.Property(x => x.FullAddress).HasMaxLength(500);
        builder.Property(x => x.PrimaryAdminFullName).HasMaxLength(200);
        builder.Property(x => x.PrimaryAdminPhone).HasMaxLength(64);
        builder.Property(x => x.PrimaryAdminRole).HasMaxLength(120);

        builder.Property(x => x.PrimaryEmail)
            .HasMaxLength(320);

        builder.Property(x => x.Location)
            .HasMaxLength(200);

        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc).IsRequired();

        builder.HasIndex(x => x.Name);
        builder.HasIndex(x => x.IsActive);
    }
}
