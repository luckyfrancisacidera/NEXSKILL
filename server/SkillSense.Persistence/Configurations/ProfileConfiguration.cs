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
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.HasIndex(x => x.UserId).IsUnique();
    }
}

internal sealed class RecruiterProfileConfiguration : IEntityTypeConfiguration<RecruiterProfileEntity>
{
    public void Configure(EntityTypeBuilder<RecruiterProfileEntity> builder)
    {
        builder.ToTable("recruiter_profiles");
        builder.HasKey(x => x.Id);
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
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.HasIndex(x => x.UserId).IsUnique();
    }
}
