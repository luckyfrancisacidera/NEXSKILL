using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Configurations
{
    internal class ResumeScoreConfiguration : IEntityTypeConfiguration<ResumeScoreEntity>
    {
        public void Configure(EntityTypeBuilder<ResumeScoreEntity> builder)
        {
            builder.ToTable("resume_scores");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.JobDescriptionText).HasColumnType("text");
            builder.Property(x => x.ScoreBreakdownJson).HasColumnType("jsonb");
            builder.HasIndex(x => x.ResumeSubmissionId);
            builder.HasIndex(x => x.JobId);
        }
    }
}
