using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Configurations;

internal sealed class CompanyInvitationConfiguration : IEntityTypeConfiguration<CompanyInvitationEntity>
{
    public void Configure(EntityTypeBuilder<CompanyInvitationEntity> builder)
    {
        builder.ToTable("company_invitations");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Email).HasMaxLength(320).IsRequired();
        builder.Property(x => x.Role).HasMaxLength(50).IsRequired();
        builder.Property(x => x.TokenHash).HasMaxLength(200).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.ExpiresAtUtc).IsRequired();

        builder.HasOne(x => x.Company)
            .WithMany()
            .HasForeignKey(x => x.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.TokenHash).IsUnique();
        builder.HasIndex(x => x.Email);
    }
}
