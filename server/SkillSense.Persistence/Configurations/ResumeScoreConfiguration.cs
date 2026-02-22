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
            builder.Property(x => x.SectionSimilaritiesJson).HasColumnType("jsonb");
            builder.Property(x => x.JobId);
            builder.Property(x => x.ResumeSubmissionId);
        }
    }
}
