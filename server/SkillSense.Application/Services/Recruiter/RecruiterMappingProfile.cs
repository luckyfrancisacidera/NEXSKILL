using AutoMapper;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Domain.Entities;

namespace SkillSense.Application.Services.Recruiter;

public sealed class RecruiterMappingProfile : Profile
{
    public RecruiterMappingProfile()
    {
        CreateMap<RecruiterProfileEntity, RecruiterProfileResponse>()
            .ForMember(dest => dest.ProfileId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.CompanyId, opt => opt.MapFrom(src => src.CompanyId))
            .ForMember(dest => dest.CompanyName, opt => opt.MapFrom(src => src.Company.Name))
            .ForMember(dest => dest.CompanyEmail, opt => opt.MapFrom(src => src.Company.PrimaryEmail))
            .ForMember(dest => dest.IsComplete, opt => opt.MapFrom(src =>
                src.CompanyId != Guid.Empty &&
                src.Company != null &&
                !string.IsNullOrWhiteSpace(src.Company.Name)));
    }
}
