using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Configurations;

internal sealed class ResumeEmbeddingConfiguration : IEntityTypeConfiguration<ResumeEmbeddingEntity>
{
    public void Configure(EntityTypeBuilder<ResumeEmbeddingEntity> builder)
    {
        builder.ToTable("resume_embeddings");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.SectionType).HasMaxLength(100).IsRequired();
        builder.Property(x => x.SubSectionKey).HasMaxLength(250);
        builder.Property(x => x.EmbeddingJson).HasColumnType("jsonb").IsRequired();
        builder.Property(x => x.SourceText).HasColumnType("text").IsRequired();
        builder.HasIndex(x => x.ResumeSubmissionId);
        builder.HasIndex(x => new { x.ResumeSubmissionId, x.SectionType });
    }
}
