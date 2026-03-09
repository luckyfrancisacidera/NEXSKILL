using AutoMapper;
using SkillSense.Application.Contracts.Recruiter.Request;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Domain.Entities;

namespace SkillSense.Application.Services.Recruiter;

public sealed class RecruiterMappingProfile : Profile
{
    public RecruiterMappingProfile()
    {
        CreateMap<RecruiterProfileEntity, RecruiterProfileResponse>()
            .ForMember(dest => dest.IsComplete, opt => opt.MapFrom(src =>
                !string.IsNullOrWhiteSpace(src.CompanyName) &&
                !string.IsNullOrWhiteSpace(src.CompanyEmail)));

        CreateMap<RecruiterProfileRequest, RecruiterProfileEntity>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.CompanyName, opt => opt.MapFrom(src => src.CompanyName.Trim()))
            .ForMember(dest => dest.CompanyEmail, opt => opt.MapFrom(src => src.CompanyEmail.Trim()))
            .ForMember(dest => dest.CreatedAtUtc, opt => opt.Ignore());
    }
}
