using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Configurations;

internal sealed class JobOfferConfiguration : IEntityTypeConfiguration<JobOfferEntity>
{
    public void Configure(EntityTypeBuilder<JobOfferEntity> builder)
    {
        builder.ToTable("job_offers");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Message)
            .HasMaxLength(4000);

        builder.Property(x => x.Benefits)
            .HasMaxLength(4000);

        builder.Property(x => x.SalaryText)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.SalaryAmount)
            .HasPrecision(18, 2);

        builder.Property(x => x.SalaryType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Currency)
            .IsRequired()
            .HasMaxLength(8);

        builder.Property(x => x.EmploymentType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.WorkSetup)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(32)
            .IsRequired();

        builder.HasOne(x => x.Application)
            .WithMany(x => x.Offers)
            .HasForeignKey(x => x.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.SentByUser)
            .WithMany()
            .HasForeignKey(x => x.SentByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.ApplicationId);
        builder.HasIndex(x => new { x.ApplicationId, x.Status });
    }
}
