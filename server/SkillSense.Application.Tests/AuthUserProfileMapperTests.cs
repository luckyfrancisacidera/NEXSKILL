using SkillSense.Application.Services.Auth;
using SkillSense.Domain.Entities;

namespace SkillSense.Application.Tests;

public sealed class AuthUserProfileMapperTests
{
    [Fact]
    public void ToCurrentUserResponse_UsesStoredFirstAndLastName_WhenAvailable()
    {
        var user = CreateUser(
            email: "lucky.a.acidera@gmail.com",
            firstName: "Lucky",
            lastName: "Acidera");

        var response = AuthUserProfileMapper.ToCurrentUserResponse(user, ["JobSeeker"]);

        Assert.True(response.IsAuthenticated);
        Assert.Equal(user.Id.ToString(), response.UserId);
        Assert.Equal("lucky.a.acidera@gmail.com", response.Email);
        Assert.Equal("Lucky", response.FirstName);
        Assert.Equal("Acidera", response.LastName);
        Assert.Equal("Jobseeker", response.Role);
        Assert.Equal(["JobSeeker"], response.Roles);
    }

    [Fact]
    public void ToCurrentUserResponse_UsesJobSeekerFullName_WhenIdentityNameFieldsAreMissing()
    {
        var user = CreateUser(
            email: "lucky.a.acidera@gmail.com",
            profileFullName: "Lucky Acidera");

        var response = AuthUserProfileMapper.ToCurrentUserResponse(user, ["JobSeeker"]);

        Assert.Equal("Lucky", response.FirstName);
        Assert.Equal("Acidera", response.LastName);
    }

    [Fact]
    public void ToCurrentUserResponse_LeavesNamesNull_WhenNoStoredNameExists()
    {
        var user = CreateUser(
            email: "lucky.a.acidera@gmail.com");

        var response = AuthUserProfileMapper.ToCurrentUserResponse(user, ["JobSeeker"]);

        Assert.Null(response.FirstName);
        Assert.Null(response.LastName);
    }

    [Fact]
    public void ToAccountProfileResponse_UsesStoredNamesAndRole()
    {
        var user = CreateUser(
            email: "lucky.a.acidera@gmail.com",
            firstName: "Lucky",
            lastName: "Acidera");

        var response = AuthUserProfileMapper.ToAccountProfileResponse(user, ["JobSeeker"]);

        Assert.Equal("Lucky", response.FirstName);
        Assert.Equal("Acidera", response.LastName);
        Assert.Equal("lucky.a.acidera@gmail.com", response.Email);
        Assert.Equal("Jobseeker", response.Role);
    }

    private static AppUser CreateUser(
        string email,
        string? firstName = null,
        string? lastName = null,
        string? location = null,
        string? profileFullName = null)
        => new()
        {
            Id = Guid.NewGuid(),
            Email = email,
            UserName = email,
            FirstName = firstName,
            LastName = lastName,
            Location = location,
            JobSeekerProfile = profileFullName is null
                ? null
                : new JobSeekerProfileEntity
                {
                    Id = Guid.NewGuid(),
                    UserId = Guid.NewGuid(),
                    FullName = profileFullName,
                }
        };
}
