using System.Reflection;
using SkillSense.Application.Services.Recruiter;
using SkillSense.Domain.Entities;

namespace SkillSense.Application.Tests;

public sealed class RecruiterStageTransitionTests
{
    private static readonly MethodInfo ResolveNextStatusMethod = typeof(RecruiterService)
        .GetMethod("ResolveNextStatus", BindingFlags.NonPublic | BindingFlags.Static)
        ?? throw new InvalidOperationException("ResolveNextStatus method not found.");

    [Theory]
    [InlineData(ResumeSubmissionStatus.Completed, "reject", ResumeSubmissionStatus.Rejected)]
    [InlineData(ResumeSubmissionStatus.Shortlisted, "reject", ResumeSubmissionStatus.Rejected)]
    [InlineData(ResumeSubmissionStatus.Interview, "reject", ResumeSubmissionStatus.Rejected)]
    [InlineData(ResumeSubmissionStatus.Offer, "reject", ResumeSubmissionStatus.Rejected)]
    public void Reject_FromAnyActiveStage_IsAllowed(ResumeSubmissionStatus current, string action, ResumeSubmissionStatus expected)
    {
        var next = InvokeResolveNextStatus(current, action);
        Assert.Equal(expected, next);
    }

    [Fact]
    public void Reject_FromHired_IsRejected()
    {
        Assert.Throws<TargetInvocationException>(() => InvokeResolveNextStatus(ResumeSubmissionStatus.Hired, "reject"));
    }

    [Fact]
    public void Shortlist_FromInterview_IsAllowed()
    {
        var next = InvokeResolveNextStatus(ResumeSubmissionStatus.Interview, "shortlist");
        Assert.Equal(ResumeSubmissionStatus.Shortlisted, next);
    }

    [Fact]
    public void RemoveShortlist_FromShortlisted_GoesBackToCompleted()
    {
        var next = InvokeResolveNextStatus(ResumeSubmissionStatus.Shortlisted, "remove-shortlist");
        Assert.Equal(ResumeSubmissionStatus.Completed, next);
    }

    [Fact]
    public void RemoveShortlist_DoesNotReject()
    {
        var next = InvokeResolveNextStatus(ResumeSubmissionStatus.Shortlisted, "remove-shortlist");
        Assert.NotEqual(ResumeSubmissionStatus.Rejected, next);
    }

    private static ResumeSubmissionStatus InvokeResolveNextStatus(ResumeSubmissionStatus current, string action)
    {
        return (ResumeSubmissionStatus)ResolveNextStatusMethod.Invoke(null, [current, action])!;
    }
}
