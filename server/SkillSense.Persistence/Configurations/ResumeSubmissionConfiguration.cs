
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Configurations
{
    internal class ResumeSubmissionConfiguration : IEntityTypeConfiguration<ResumeSubmissionEntity>
    {
        public void Configure(EntityTypeBuilder<ResumeSubmissionEntity> builder)
        {
            builder.ToTable("resume_submissions");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.FileName)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(x => x.ContentType)
                .HasMaxLength(120)
                .IsRequired();

            builder.Property(x => x.BlobObjectKey)
                .HasMaxLength(512)
                .IsRequired();

            builder.Property(x => x.AppliedJobPosition).HasMaxLength(200);
            builder.Property(x => x.FullName).HasMaxLength(200);
            builder.Property(x => x.Email).HasMaxLength(320);
            builder.Property(x => x.PostalCode).HasMaxLength(40);
            builder.Property(x => x.Location).HasMaxLength(200);

            builder.Property(x => x.Status)
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            builder.Property(x => x.ParsedResumeJson)
                .HasColumnType("jsonb")
                .HasDefaultValueSql("'{}'::jsonb");

            builder.Property(x => x.IsHiddenFromJobSeekerHistory)
                .HasDefaultValue(false);

            builder.Property(x => x.JobSeekerHistoryArchivedAtUtc);
            builder.Property(x => x.JobSeekerHistoryDeletedAtUtc);

            builder.Property(x => x.HireDateUtc);

            builder.HasIndex(x => x.HiredByRecruiterId);
            builder.HasIndex(x => x.AcceptedOfferId);

            builder.HasOne(x => x.JobSeekerUser)
                .WithMany()
                .HasForeignKey(x => x.JobSeekerUserId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(x => x.Status);
            builder.HasIndex(x => x.JobId);
            builder.HasIndex(x => x.JobSeekerUserId);
        }
    }
}
