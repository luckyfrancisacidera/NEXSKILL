using AutoMapper;
using SkillSense.Application.Common.Mapping;
using SkillSense.Application.Common.Recruiter;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Models;

namespace SkillSense.Application.Services.Recruiter;

public sealed class ApplicantsMappingProfile : Profile
{
    public ApplicantsMappingProfile()
    {
        CreateMap<ApplicantScoreData, ApplicantScoreItemResponse>()
            .ForMember(dest => dest.JobSeekerUserId, opt => opt.MapFrom(src => src.JobSeekerUserId))
            .ForMember(dest => dest.Score, opt => opt.MapFrom(src => (int)Math.Round(src.Score)))
            .ForMember(dest => dest.SubmissionStatus, opt => opt.MapFrom<SubmissionStatusResolver>())
            .ForMember(dest => dest.JobseekerStage, opt => opt.MapFrom(src => RecruiterApplicantProjection.ResolveJobseekerStage(src.Status)))
            .ForMember(dest => dest.HasResume, opt => opt.MapFrom(src => src.HasResume))
            .ForMember(dest => dest.ResumeFileName, opt => opt.MapFrom(src => src.ResumeFileName));

        CreateMap<ApplicantScoreItemResponse, ApplicantDetailResponse>();

        CreateMap<CandidateExplanationEntity, CandidateExplanationResponse>()
            .ForMember(dest => dest.Strengths, opt => opt.MapFrom(src => MappingJson.DeserializeStringList(src.StrengthsJson)))
            .ForMember(dest => dest.Gaps, opt => opt.MapFrom(src => MappingJson.DeserializeStringList(src.GapsJson)));
    }
}

internal sealed class SubmissionStatusResolver : IValueResolver<ApplicantScoreData, ApplicantScoreItemResponse, string>
{
    public string Resolve(ApplicantScoreData source, ApplicantScoreItemResponse destination, string destMember, ResolutionContext context)
    {
        var recommendedIds = context.Items.TryGetValue("recommendedIds", out var value) && value is IReadOnlySet<Guid> ids
            ? ids
            : null;

        return RecruiterApplicantProjection.ResolveSubmissionStatus(source.Status, recommendedIds?.Contains(source.ResumeSubmissionId) == true);
    }
}
