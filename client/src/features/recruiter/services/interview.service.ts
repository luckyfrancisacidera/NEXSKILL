import { http } from "@shared/api/http";
import type {
  Interview,
  RescheduleInterviewInput,
  ScheduleInterviewInput,
} from "@features/recruiter/types/interview.types";

interface RecruiterInterviewDto {
  id: string;
  jobId: string;
  recruiterId: string;
  jobSeekerId: string;
  scheduledDateTimeUtc: string;
  locationOrMeetingLink: string;
  message?: string | null;
  status: Interview["status"];
  recruiterName?: string | null;
  recruiterEmail?: string | null;
  companyName?: string | null;
  jobTitle?: string | null;
  jobSeekerName?: string | null;
}

const mapInterview = (dto: RecruiterInterviewDto): Interview => {
  const value = dto.locationOrMeetingLink?.trim() ?? "";
  const looksLikeLink = /^https?:\/\//i.test(value);

  return {
    id: dto.id,
    jobId: dto.jobId,
    recruiterId: dto.recruiterId,
    jobseekerId: dto.jobSeekerId,
    candidateName: dto.jobSeekerName?.trim() || "Candidate",
    jobTitle: dto.jobTitle ?? undefined,
    scheduledDate: dto.scheduledDateTimeUtc,
    meetingLink: looksLikeLink ? value : undefined,
    location: !looksLikeLink && value ? value : undefined,
    message: dto.message ?? undefined,
    status: dto.status,
    recruiterName: dto.recruiterName ?? undefined,
    recruiterEmail: dto.recruiterEmail ?? undefined,
    companyName: dto.companyName ?? undefined,
  };
};

export const recruiterInterviewService = {
  async getRecruiterInterviews(): Promise<Interview[]> {
    const response = await http.get<RecruiterInterviewDto[]>("/api/recruiter/interviews");
    return response.data.map(mapInterview);
  },

  async getRecruiterInterview(interviewId: string): Promise<Interview> {
    const response = await http.get<RecruiterInterviewDto>(`/api/recruiter/interviews/${interviewId}`);
    return mapInterview(response.data);
  },

  async scheduleInterview(
    data: ScheduleInterviewInput,
  ): Promise<Interview> {
    const response = await http.post<RecruiterInterviewDto>("/api/recruiter/interviews", {
      jobId: data.jobId,
      jobSeekerId: data.jobseekerId,
      scheduledDateTimeUtc: data.scheduledDate,
      locationOrMeetingLink: data.meetingLink?.trim() || data.location?.trim() || "",
      message: data.message,
    });
    return mapInterview(response.data);
  },

  async rescheduleInterview(
    interviewId: string,
    data: RescheduleInterviewInput,
  ): Promise<Interview> {
    const response = await http.put<RecruiterInterviewDto>(
      `/api/recruiter/interviews/${interviewId}`,
      {
        scheduledDateTimeUtc: data.scheduledDate,
        message: data.message,
      },
    );
    return mapInterview(response.data);
  },
};
