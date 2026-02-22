using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Configurations
{
    internal class JobConfiguration : IEntityTypeConfiguration<JobEntity>
    {
        public void Configure(EntityTypeBuilder<JobEntity> builder)
        {
            builder.ToTable("jobs");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Title)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Description).IsRequired();
            builder.Property(x => x.DescriptionEmbeddingJson)
                .HasColumnType("jsonb")
                .IsRequired()
                .HasDefaultValueSql("'{}'::jsonb");
        }
    }
}
