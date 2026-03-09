using AutoMapper;
using SkillSense.Application.Common.Mapping;
using SkillSense.Application.Common.Text;
using SkillSense.Application.Contracts.Recruiter.Request;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;
using SkillSense.Domain.Entities;

namespace SkillSense.Application.Services.Jobs;

public sealed class JobsMappingProfile : Profile
{
    public JobsMappingProfile()
    {
        CreateMap<JobEntity, JobListItemResponse>()
            .ForMember(dest => dest.WorkSetup, opt => opt.MapFrom(src => src.WorkSetup.ToString()))
            .ForMember(dest => dest.EmploymentType, opt => opt.MapFrom(src => src.EmploymentType.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Responsibilities, opt => opt.MapFrom(src => MappingJson.NormalizeMultiline(src.ResponsibilitiesText)))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => MappingJson.NormalizeMultiline(src.Description)))
            .ForMember(dest => dest.RequiredSkills, opt => opt.MapFrom(src => MappingJson.DeserializeStringList(src.RequiredSkillsJson)))
            .ForMember(dest => dest.PreferredSkills, opt => opt.MapFrom(src => MappingJson.DeserializeStringList(src.PreferredSkillsJson)))
            .ForMember(dest => dest.MinEducation, opt => opt.MapFrom(src => src.Education));

        CreateMap<JobEntity, JobResponse>()
            .ForMember(dest => dest.JobId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<CreateJobRequest, JobEntity>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.RecruiterId, opt => opt.Ignore())
            .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title.Trim()))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description.Trim()))
            .ForMember(dest => dest.ResponsibilitiesText, opt => opt.MapFrom(src => MultilineTextNormalizer.Normalize(src.Responsibilities)))
            .ForMember(dest => dest.RequiredSkillsJson, opt => opt.Ignore())
            .ForMember(dest => dest.PreferredSkillsJson, opt => opt.Ignore())
            .ForMember(dest => dest.JobDescriptionStructuredJson, opt => opt.Ignore())
            .ForMember(dest => dest.DescriptionEmbeddingJson, opt => opt.Ignore())
            .ForMember(dest => dest.Education, opt => opt.MapFrom(src => src.Education ?? src.MinEducation))
            .ForMember(dest => dest.WorkSetup, opt => opt.MapFrom(src => (WorkSetup)(src.WorkSetup ?? 0)))
            .ForMember(dest => dest.EmploymentType, opt => opt.MapFrom(src => (EmploymentType)(src.EmploymentType ?? 0)))
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.PostedDateUtc, opt => opt.Ignore())
            .ForMember(dest => dest.CompanyNameSnapshot, opt => opt.Ignore())
            .ForMember(dest => dest.CompanyEmailSnapshot, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAtUtc, opt => opt.Ignore());

        CreateMap<UpdateJobRequest, JobEntity>()
            .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title.Trim()))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description.Trim()))
            .ForMember(dest => dest.ResponsibilitiesText, opt => opt.MapFrom(src => MultilineTextNormalizer.Normalize(src.Responsibilities)))
            .ForMember(dest => dest.RequiredSkillsJson, opt => opt.Ignore())
            .ForMember(dest => dest.PreferredSkillsJson, opt => opt.Ignore())
            .ForMember(dest => dest.JobDescriptionStructuredJson, opt => opt.Ignore())
            .ForMember(dest => dest.DescriptionEmbeddingJson, opt => opt.Ignore())
            .ForMember(dest => dest.Education, opt => opt.MapFrom(src => src.Education ?? src.MinEducation))
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForAllMembers(opt => opt.Condition((_, _, srcMember) => srcMember is not null));
    }
}
