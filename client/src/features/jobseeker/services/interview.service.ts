import { http } from "@shared/api/http";
import type { JobseekerInterview } from "@features/jobseeker/types/interview.types";

interface JobseekerInterviewDto {
  id: string;
  recruiterId: string;
  jobSeekerId: string;
  scheduledDateTimeUtc: string;
  locationOrMeetingLink: string;
  message?: string | null;
  status: JobseekerInterview["status"];
  recruiterName?: string | null;
  recruiterEmail?: string | null;
  companyName?: string | null;
}

const mapInterview = (dto: JobseekerInterviewDto): JobseekerInterview => {
  const value = dto.locationOrMeetingLink?.trim() ?? "";
  const looksLikeLink = /^https?:\/\//i.test(value);

  return {
    id: dto.id,
    recruiterId: dto.recruiterId,
    jobseekerId: dto.jobSeekerId,
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

export const jobseekerInterviewService = {
  async getJobseekerInterviews(): Promise<JobseekerInterview[]> {
    const response = await http.get<JobseekerInterviewDto[]>("/api/jobseeker/interviews");
    return response.data.map(mapInterview);
  },

  async acceptInterview(interviewId: string): Promise<JobseekerInterview> {
    const response = await http.post<JobseekerInterviewDto>(
      `/api/jobseeker/interviews/${interviewId}/accept`,
      {},
    );
    return mapInterview(response.data);
  },

  async declineInterview(interviewId: string): Promise<JobseekerInterview> {
    const response = await http.post<JobseekerInterviewDto>(
      `/api/jobseeker/interviews/${interviewId}/decline`,
      {},
    );
    return mapInterview(response.data);
  },

  async requestReschedule(
    interviewId: string,
    message: string,
    attachment?: File,
  ): Promise<JobseekerInterview> {
    const formData = new FormData();
    formData.append("message", message);
    if (attachment) {
      formData.append("attachment", attachment);
    }

    const response = await http.post<JobseekerInterviewDto>(
      `/api/jobseeker/interviews/${interviewId}/request-reschedule`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return mapInterview(response.data);
  },
};
