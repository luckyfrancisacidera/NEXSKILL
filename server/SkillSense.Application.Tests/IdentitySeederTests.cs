using SkillSense.Domain.Entities;
using SkillSense.Persistence.Seed;

namespace SkillSense.Application.Tests;

public sealed class IdentitySeederTests
{
    [Fact]
    public void IsLegacySeedUser_ReturnsTrue_ForKnownLegacySeedUser()
    {
        var legacyUser = new AppUser
        {
            Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            Email = "superadmin@nexskill.local",
        };

        Assert.True(IdentitySeeder.IsLegacySeedUser(legacyUser));
    }

    [Fact]
    public void IsLegacySeedUser_ReturnsFalse_ForNonSeedBootstrapUser()
    {
        var bootstrapUser = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = "admin@nexskill.local",
        };

        Assert.False(IdentitySeeder.IsLegacySeedUser(bootstrapUser));
    }
}
