using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Configurations;

internal sealed class JobSeekerProfileConfiguration : IEntityTypeConfiguration<JobSeekerProfileEntity>
{
    public void Configure(EntityTypeBuilder<JobSeekerProfileEntity> builder)
    {
        builder.ToTable("job_seeker_profiles");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.FullName).HasMaxLength(200);
        builder.Property(x => x.Phone).HasMaxLength(32);
        builder.Property(x => x.Location).HasMaxLength(200);
        builder.Property(x => x.ProfessionalTitle).HasMaxLength(120);
        builder.Property(x => x.Skills).HasMaxLength(2000);
        builder.Property(x => x.Bio).HasMaxLength(4000);
        builder.Property(x => x.ExperienceSummary).HasMaxLength(4000);
        builder.Property(x => x.ResumeUrl).HasMaxLength(500);
        builder.Property(x => x.AvatarUrl).HasMaxLength(500);
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc).IsRequired();
        builder.HasIndex(x => x.UserId).IsUnique();
    }
}

internal sealed class RecruiterProfileConfiguration : IEntityTypeConfiguration<RecruiterProfileEntity>
{
    public void Configure(EntityTypeBuilder<RecruiterProfileEntity> builder)
    {
        builder.ToTable("recruiter_profiles");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CompanyName).HasMaxLength(200);
        builder.Property(x => x.CompanyEmail).HasMaxLength(320);
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.HasIndex(x => x.UserId).IsUnique();
    }
}

internal sealed class AdminProfileConfiguration : IEntityTypeConfiguration<AdminProfileEntity>
{
    public void Configure(EntityTypeBuilder<AdminProfileEntity> builder)
    {
        builder.ToTable("admin_profiles");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.FullName).HasMaxLength(200);
        builder.Property(x => x.Phone).HasMaxLength(32);
        builder.Property(x => x.Location).HasMaxLength(200);
        builder.Property(x => x.ProfessionalTitle).HasMaxLength(120);
        builder.Property(x => x.Skills).HasMaxLength(2000);
        builder.Property(x => x.Bio).HasMaxLength(4000);
        builder.Property(x => x.ExperienceSummary).HasMaxLength(4000);
        builder.Property(x => x.ResumeUrl).HasMaxLength(500);
        builder.Property(x => x.AvatarUrl).HasMaxLength(500);
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc).IsRequired();
        builder.HasIndex(x => x.UserId).IsUnique();
    }
}
