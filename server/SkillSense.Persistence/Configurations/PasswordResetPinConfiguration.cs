using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Configurations;

internal sealed class PasswordResetPinConfiguration : IEntityTypeConfiguration<PasswordResetPinEntity>
{
    public void Configure(EntityTypeBuilder<PasswordResetPinEntity> builder)
    {
        builder.ToTable("password_reset_pins");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.PinHash).HasMaxLength(128).IsRequired();
        builder.Property(x => x.PinSalt).HasMaxLength(128).IsRequired();
        builder.Property(x => x.PendingEmail).HasMaxLength(320);
        builder.Property(x => x.Purpose).IsRequired();
        builder.Property(x => x.ExpiresAtUtc).IsRequired();
        builder.Property(x => x.Used).IsRequired();
        builder.Property(x => x.VerifiedAtUtc);
        builder.Property(x => x.CreatedAtUtc).IsRequired();

        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => new { x.UserId, x.PendingEmail, x.Purpose, x.Used });

        builder.HasOne(x => x.User)
            .WithMany(x => x.PasswordResetPins)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
