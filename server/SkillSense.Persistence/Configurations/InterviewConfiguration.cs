using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Configurations;

internal sealed class InterviewConfiguration : IEntityTypeConfiguration<InterviewEntity>
{
    public void Configure(EntityTypeBuilder<InterviewEntity> builder)
    {
        builder.ToTable("interviews");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).IsRequired();
        builder.Property(x => x.ScheduledDateTimeUtc).IsRequired();
        builder.Property(x => x.InterviewType).IsRequired();
        builder.Property(x => x.LocationOrMeetingLink).HasMaxLength(500).IsRequired();
        builder.Property(x => x.Message).HasMaxLength(2000);
        builder.Property(x => x.CancelReason).HasMaxLength(2000);
        builder.Property(x => x.CreatedAtUtc).IsRequired();

        builder.HasOne(x => x.Job)
            .WithMany()
            .HasForeignKey(x => x.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Recruiter)
            .WithMany()
            .HasForeignKey(x => x.RecruiterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.JobSeeker)
            .WithMany()
            .HasForeignKey(x => x.JobSeekerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.RecruiterId, x.ScheduledDateTimeUtc });
        builder.HasIndex(x => new { x.JobSeekerId, x.ScheduledDateTimeUtc });
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.CompanyId);
        builder.HasIndex(x => x.IsArchived);
    }
}

internal sealed class InterviewRescheduleRequestConfiguration : IEntityTypeConfiguration<InterviewRescheduleRequestEntity>
{
    public void Configure(EntityTypeBuilder<InterviewRescheduleRequestEntity> builder)
    {
        builder.ToTable("interview_reschedule_requests");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Message).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.AttachmentUrl).HasMaxLength(500);
        builder.Property(x => x.CreatedAtUtc).IsRequired();

        builder.HasOne(x => x.Interview)
            .WithMany(x => x.RescheduleRequests)
            .HasForeignKey(x => x.InterviewId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.JobSeeker)
            .WithMany()
            .HasForeignKey(x => x.JobSeekerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.JobSeekerId);
    }
}

internal sealed class NotificationConfiguration : IEntityTypeConfiguration<NotificationEntity>
{
    public void Configure(EntityTypeBuilder<NotificationEntity> builder)
    {
        builder.ToTable("notifications");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Message).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.IsRead);
    }
}
