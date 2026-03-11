namespace SkillSense.Application.Interfaces;

public interface IInterviewCalendarService
{
    string BuildCalendarContent(SkillSense.Domain.Entities.InterviewEntity interview, TimeSpan? duration = null);
}
