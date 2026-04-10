using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Configurations;

internal sealed class CompanySubscriptionConfiguration : IEntityTypeConfiguration<CompanySubscriptionEntity>
{
    public void Configure(EntityTypeBuilder<CompanySubscriptionEntity> builder)
    {
        builder.ToTable("company_subscriptions");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.PlanId).HasMaxLength(50).IsRequired();
        builder.Property(x => x.MockPaymentMethod).HasMaxLength(40);
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc).IsRequired();

        builder.HasOne(x => x.Company)
            .WithMany()
            .HasForeignKey(x => x.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.CompanyId, x.CreatedAtUtc });
    }
}
