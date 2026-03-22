using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Configurations;

internal sealed class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> builder)
    {
        builder.ToTable("users");
        builder.Property(x => x.FirstName).HasMaxLength(120);
        builder.Property(x => x.LastName).HasMaxLength(120);
        builder.Property(x => x.Location).HasMaxLength(200);

        builder.HasOne(x => x.JobSeekerProfile)
            .WithOne(x => x.User)
            .HasForeignKey<JobSeekerProfileEntity>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.RecruiterProfile)
            .WithOne(x => x.User)
            .HasForeignKey<RecruiterProfileEntity>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.AdminProfile)
            .WithOne(x => x.User)
            .HasForeignKey<AdminProfileEntity>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
