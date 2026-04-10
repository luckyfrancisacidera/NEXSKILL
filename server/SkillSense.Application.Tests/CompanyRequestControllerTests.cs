using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using SkillSense.Api.Controllers;

namespace SkillSense.Application.Tests;

public sealed class CompanyRequestControllerTests
{
    [Theory]
    [InlineData(nameof(CompanyRequestController.GetRequests))]
    [InlineData(nameof(CompanyRequestController.GetDetails))]
    [InlineData(nameof(CompanyRequestController.Review))]
    [InlineData(nameof(CompanyRequestController.StreamDocument))]
    public void SuperAdminReviewEndpoints_AreRestrictedToSuperAdmin(string methodName)
    {
        var method = typeof(CompanyRequestController).GetMethod(methodName);
        Assert.NotNull(method);

        var authorize = Assert.Single(method!.GetCustomAttributes(typeof(AuthorizeAttribute), inherit: true).Cast<AuthorizeAttribute>());
        Assert.Equal("SuperAdmin", authorize.Roles);
    }

    [Fact]
    public void StreamDocument_UsesRequestScopedRoute()
    {
        var method = typeof(CompanyRequestController).GetMethod(nameof(CompanyRequestController.StreamDocument));
        Assert.NotNull(method);

        var route = Assert.Single(method!.GetCustomAttributes(false).OfType<Microsoft.AspNetCore.Mvc.HttpGetAttribute>());
        Assert.Equal("{requestId:guid}/documents/{documentId:guid}/content", route.Template);
    }

    [Theory]
    [InlineData(nameof(CompanyRequestController.GetInvitation), "invitation-view")]
    [InlineData(nameof(CompanyRequestController.AcceptInvitation), "invitation-accept")]
    public void InvitationEndpoints_AreRateLimited(string methodName, string policyName)
    {
        var method = typeof(CompanyRequestController).GetMethod(methodName);
        Assert.NotNull(method);

        var attribute = Assert.Single(method!.GetCustomAttributes(typeof(EnableRateLimitingAttribute), inherit: true).Cast<EnableRateLimitingAttribute>());
        Assert.Equal(policyName, attribute.PolicyName);
    }
}
