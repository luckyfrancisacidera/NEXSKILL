using AutoMapper;
using SkillSense.Application;

namespace SkillSense.Application.Tests;

public sealed class AutoMapperConfigurationTests
{
    [Fact]
    public void ApplicationProfiles_AreValid()
    {
        var configuration = new MapperConfiguration(cfg =>
        {
            cfg.AddMaps(typeof(ApplicationServiceRegistration).Assembly);
        });

        configuration.AssertConfigurationIsValid();
    }
}
