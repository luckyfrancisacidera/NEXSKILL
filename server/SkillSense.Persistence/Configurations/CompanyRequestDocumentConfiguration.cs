using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Configurations;

internal sealed class CompanyRequestDocumentConfiguration : IEntityTypeConfiguration<CompanyRequestDocumentEntity>
{
    public void Configure(EntityTypeBuilder<CompanyRequestDocumentEntity> builder)
    {
        builder.ToTable("company_request_documents");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.OriginalFileName).HasMaxLength(255).IsRequired();
        builder.Property(x => x.ContentType).HasMaxLength(120).IsRequired();
        builder.Property(x => x.StorageKey).HasMaxLength(500).IsRequired();
        builder.Property(x => x.StorageProvider).HasMaxLength(40).IsRequired();
        builder.Property(x => x.UploadedAtUtc).IsRequired();
    }
}
