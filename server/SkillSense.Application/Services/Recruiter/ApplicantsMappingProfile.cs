using AutoMapper;
using System.Text.Json;
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
            .ForMember(dest => dest.ResumeFileName, opt => opt.MapFrom(src => src.ResumeFileName))
            .ForMember(dest => dest.OfferStatus, opt => opt.MapFrom(src => src.OfferStatus))
            .ForMember(dest => dest.OfferSentAtUtc, opt => opt.MapFrom(src => src.OfferSentAtUtc))
            .ForMember(dest => dest.LatestInterviewStatus, opt => opt.MapFrom(src => src.LatestInterviewStatus))
            .ForMember(dest => dest.LatestInterviewScheduledDateTimeUtc, opt => opt.MapFrom(src => src.LatestInterviewScheduledDateTimeUtc))
            .ForMember(dest => dest.Offer, opt => opt.Ignore());

        CreateMap<ApplicantScoreItemResponse, ApplicantDetailResponse>()
            .ForMember(dest => dest.ParsedResumeJson, opt => opt.Ignore())
            .ForMember(dest => dest.CandidateExplanation, opt => opt.Ignore())
            .ForMember(dest => dest.LatestInterview, opt => opt.Ignore());

        CreateMap<CandidateExplanationEntity, CandidateExplanationResponse>()
            .ForMember(dest => dest.Strengths, opt => opt.MapFrom(src => MappingJson.DeserializeStringList(src.StrengthsJson)))
            .ForMember(dest => dest.Gaps, opt => opt.MapFrom(src => MappingJson.DeserializeStringList(src.GapsJson)))
            .ForMember(dest => dest.AreasToValidate, opt => opt.MapFrom(src => CandidateExplanationStructuredMapper.ReadArray(src.StructuredDataJson, "areas_to_validate")))
            .ForMember(dest => dest.RecommendedInterviewFocus, opt => opt.MapFrom(src => CandidateExplanationStructuredMapper.ReadArray(src.StructuredDataJson, "recommended_interview_focus")))
            .ForMember(dest => dest.PotentialRisks, opt => opt.MapFrom(src => CandidateExplanationStructuredMapper.BuildPotentialRisks(src)))
            .ForMember(dest => dest.Risks, opt => opt.MapFrom(src => CandidateExplanationStructuredMapper.BuildPotentialRisks(src)))
            .ForMember(dest => dest.Recommendation, opt => opt.MapFrom(src => CandidateExplanationStructuredMapper.BuildRecommendation(src)));
    }
}

internal static class CandidateExplanationStructuredMapper
{
    public static List<string> ReadArray(string? structuredDataJson, string propertyName)
    {
        var parsed = MappingJson.ParseJsonElement(structuredDataJson);
        if (parsed is null)
        {
            return [];
        }

        var root = parsed.Value;
        if (root.TryGetProperty("explanation", out var explanation)
            && explanation.ValueKind == JsonValueKind.Object
            && explanation.TryGetProperty(propertyName, out var nestedValue))
        {
            return ReadStringArray(nestedValue);
        }

        if (root.TryGetProperty(propertyName, out var directValue))
        {
            return ReadStringArray(directValue);
        }

        return [];
    }

    public static string BuildRecommendation(CandidateExplanationEntity source)
    {
        var focus = ReadArray(source.StructuredDataJson, "recommended_interview_focus");
        if (focus.Count > 0)
        {
            return string.Join(" ", focus);
        }

        return source.Summary ?? source.ExplanationText;
    }

    public static List<string> BuildPotentialRisks(CandidateExplanationEntity source)
    {
        var risks = ReadArray(source.StructuredDataJson, "potential_risks");
        if (risks.Count > 0)
        {
            return risks;
        }

        return MappingJson.DeserializeStringList(source.GapsJson);
    }

    private static List<string> ReadStringArray(JsonElement value)
    {
        if (value.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        return
        [
            .. value.EnumerateArray()
                .Where(item => item.ValueKind == JsonValueKind.String)
                .Select(item => item.GetString())
                .Where(item => !string.IsNullOrWhiteSpace(item))
                .Select(item => item!.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
        ];
    }
}

internal sealed class SubmissionStatusResolver : IValueResolver<ApplicantScoreData, ApplicantScoreItemResponse, string>
{
    // Handles resolve.
    public string Resolve(ApplicantScoreData source, ApplicantScoreItemResponse destination, string destMember, ResolutionContext context)
        => RecruiterApplicantProjection.ResolveSubmissionStatus(source.Status, source.Score);
}
