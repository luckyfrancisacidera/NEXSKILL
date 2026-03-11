import { http } from "@shared/api/http";
import type {
  Interview,
  RescheduleInterviewInput,
  ScheduleInterviewInput,
} from "@features/recruiter/types/interview.types";

export const recruiterInterviewService = {
  async getRecruiterInterviews(): Promise<Interview[]> {
    const response = await http.get<Interview[]>("/api/recruiter/interviews");
    return response.data;
  },

  async scheduleInterview(
    data: ScheduleInterviewInput,
  ): Promise<Interview> {
    const response = await http.post<Interview>("/api/recruiter/interviews", data);
    return response.data;
  },

  async rescheduleInterview(
    interviewId: string,
    data: RescheduleInterviewInput,
  ): Promise<Interview> {
    const response = await http.put<Interview>(
      `/api/recruiter/interviews/${interviewId}`,
      data,
    );
    return response.data;
  },
};

