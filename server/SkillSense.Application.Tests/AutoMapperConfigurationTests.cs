using AutoMapper;
using Microsoft.Extensions.Logging.Abstractions;
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
        }, NullLoggerFactory.Instance);

        configuration.AssertConfigurationIsValid();
    }
}
