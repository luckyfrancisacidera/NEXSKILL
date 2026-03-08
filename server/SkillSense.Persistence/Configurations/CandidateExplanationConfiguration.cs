using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Configurations;

internal sealed class CandidateExplanationConfiguration : IEntityTypeConfiguration<CandidateExplanationEntity>
{
    public void Configure(EntityTypeBuilder<CandidateExplanationEntity> builder)
    {
        builder.ToTable("candidate_explanations");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Provider)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(x => x.Model)
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(x => x.ExplanationText)
            .HasColumnType("text")
            .IsRequired();

        builder.Property(x => x.Summary)
            .HasMaxLength(500);

        builder.Property(x => x.StrengthsJson)
            .HasColumnType("jsonb")
            .HasDefaultValueSql("'[]'::jsonb")
            .IsRequired();

        builder.Property(x => x.GapsJson)
            .HasColumnType("jsonb")
            .HasDefaultValueSql("'[]'::jsonb")
            .IsRequired();

        builder.Property(x => x.RawProviderResponse)
            .HasColumnType("text");

        builder.Property(x => x.StructuredDataJson)
            .HasColumnType("jsonb")
            .HasDefaultValueSql("'{}'::jsonb");

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(x => x.FailureReason)
            .HasMaxLength(400);

        builder.HasIndex(x => x.ResumeSubmissionId).IsUnique();
        builder.HasIndex(x => x.JobId);
        builder.HasIndex(x => x.Status);
    }
}
