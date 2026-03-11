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

            builder.Property(x => x.CompanyId).IsRequired();
            builder.Property(x => x.RecruiterId).IsRequired();

            builder.Property(x => x.Title)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Description).IsRequired();
            builder.Property(x => x.DescriptionEmbeddingJson)
                .HasColumnType("jsonb")
                .IsRequired()
                .HasDefaultValueSql("'{}'::jsonb");

            builder.Property(x => x.ResponsibilitiesText)
                .HasColumnType("text")
                .IsRequired()
                .HasDefaultValue(string.Empty);

            builder.Property(x => x.RequiredSkillsJson)
                .HasColumnType("jsonb")
                .IsRequired()
                .HasDefaultValueSql("'[]'::jsonb");

            builder.Property(x => x.PreferredSkillsJson)
                .HasColumnType("jsonb")
                .IsRequired()
                .HasDefaultValueSql("'[]'::jsonb");

            builder.Property(x => x.ExperienceLevel)
                .HasColumnType("text");

            builder.Property(x => x.Education)
                .HasColumnType("text");

            builder.Property(x => x.Department).HasMaxLength(120);

            builder.Property(x => x.Benefits).HasColumnType("text");

            builder.Property(x => x.SalaryMinPerAnnum).HasPrecision(18, 2);

            builder.Property(x => x.SalaryMaxPerAnnum).HasPrecision(18, 2);

            builder.Property(x => x.Currency).HasMaxLength(8).HasDefaultValue("PHP");

            builder.Property(x => x.Location).HasMaxLength(200).IsRequired();

            builder.Property(x => x.Schedule).HasMaxLength(80);

            builder.Property(x => x.WorkSetup).HasConversion<int>();

            builder.Property(x => x.EmploymentType).HasConversion<int>();

            builder.Property(x => x.Status).HasConversion<int>();

            builder.Property(x => x.CompanyNameSnapshot).HasMaxLength(200);

            builder.Property(x => x.CompanyEmailSnapshot).HasMaxLength(320);

            builder.Property(x => x.JobDescriptionStructuredJson)
                .HasColumnType("jsonb")
                .IsRequired()
                .HasDefaultValueSql("'{}'::jsonb");

            builder.Property(x => x.NumberOfVacancies)
              .IsRequired()
              .HasDefaultValue(1);

            builder.HasIndex(x => x.Status);
            builder.HasIndex(x => x.CreatedAtUtc);
            builder.HasIndex(x => x.RecruiterId);
            builder.HasIndex(x => x.CompanyId);
        }
    }
}