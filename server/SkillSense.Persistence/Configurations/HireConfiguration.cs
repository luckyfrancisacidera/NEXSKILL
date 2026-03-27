using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Configurations;

internal sealed class HireConfiguration : IEntityTypeConfiguration<HireEntity>
{
    public void Configure(EntityTypeBuilder<HireEntity> builder)
    {
        builder.ToTable("hires");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(32)
            .IsRequired();

        builder.HasOne(x => x.Company)
            .WithMany()
            .HasForeignKey(x => x.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Recruiter)
            .WithMany()
            .HasForeignKey(x => x.RecruiterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.JobSeeker)
            .WithMany()
            .HasForeignKey(x => x.JobSeekerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Job)
            .WithMany()
            .HasForeignKey(x => x.JobId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Offer)
            .WithOne(x => x.Hire)
            .HasForeignKey<HireEntity>(x => x.OfferId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Application)
            .WithOne(x => x.Hire)
            .HasForeignKey<HireEntity>(x => x.ApplicationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.CompanyId);
        builder.HasIndex(x => x.RecruiterId);
        builder.HasIndex(x => x.JobSeekerId);
        builder.HasIndex(x => x.JobId);
        builder.HasIndex(x => x.OfferId).IsUnique();
        builder.HasIndex(x => x.ApplicationId).IsUnique();
        builder.HasIndex(x => new { x.CompanyId, x.Status, x.HiredAtUtc });
        builder.HasIndex(x => new { x.RecruiterId, x.Status, x.HiredAtUtc });
    }
}
