using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Configurations;

internal sealed class SavedJobConfiguration : IEntityTypeConfiguration<SavedJobEntity>
{
    public void Configure(EntityTypeBuilder<SavedJobEntity> builder)
    {
        builder.ToTable("saved_jobs");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CreatedAtUtc).IsRequired();

        builder.HasIndex(x => new { x.UserId, x.JobId }).IsUnique();

        builder.HasOne(x => x.User)
            .WithMany(x => x.SavedJobs)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Job)
            .WithMany()
            .HasForeignKey(x => x.JobId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
