import { http } from "@shared/api/http";
import type {
  CancelInterviewInput,
  Interview,
  InterviewType,
  RescheduleInterviewInput,
  ScheduleInterviewInput,
  ShortlistedCandidateOption,
} from "@features/recruiter/types/interview.types";

interface RecruiterInterviewDto {
  id: string;
  jobId: string;
  recruiterId: string;
  jobSeekerId: string;
  scheduledDateTimeUtc: string;
  interviewType: InterviewType;
  locationOrMeetingLink: string;
  message?: string | null;
  status: Interview["status"];
  cancelReason?: string | null;
  isArchived?: boolean;
  recruiterName?: string | null;
  recruiterEmail?: string | null;
  companyName?: string | null;
  jobTitle?: string | null;
  jobSeekerName?: string | null;
  warningMessage?: string | null;
}

interface ShortlistedCandidateOptionDto {
  jobSeekerUserId: string;
  resumeSubmissionId: string;
  candidateName: string;
  candidateEmail: string;
}

// Maps recruiter interview payloads into the richer UI model expected by recruiter screens.
const mapInterview = (dto: RecruiterInterviewDto): Interview => {
  const value = dto.locationOrMeetingLink?.trim() ?? "";

  return {
    id: dto.id,
    jobId: dto.jobId,
    recruiterId: dto.recruiterId,
    jobseekerId: dto.jobSeekerId,
    candidateName: dto.jobSeekerName?.trim() || "Candidate",
    jobTitle: dto.jobTitle ?? undefined,
    scheduledDate: dto.scheduledDateTimeUtc,
    interviewType: dto.interviewType,
    meetingLink: dto.interviewType === "Virtual" && value ? value : undefined,
    location: dto.interviewType === "Onsite" && value ? value : undefined,
    message: dto.message ?? undefined,
    status: dto.status,
    cancelReason: dto.cancelReason ?? undefined,
    isArchived: dto.isArchived ?? false,
    recruiterName: dto.recruiterName ?? undefined,
    recruiterEmail: dto.recruiterEmail ?? undefined,
    companyName: dto.companyName ?? undefined,
    warningMessage: dto.warningMessage ?? undefined,
  };
};

// Handles recruiter interview scheduling, retrieval, and archive mutations.
export const recruiterInterviewService = {
  // Use to load the recruiter interview list before rendering calendars, tables, or detail links.
  async getRecruiterInterviews(): Promise<Interview[]> {
    const response = await http.get<RecruiterInterviewDto[]>("/api/recruiter/interviews");
    return response.data.map(mapInterview);
  },

  // Use to fetch a single interview record for the recruiter interview detail route.
  async getRecruiterInterview(interviewId: string): Promise<Interview> {
    const response = await http.get<RecruiterInterviewDto>(`/api/recruiter/interviews/${interviewId}`);
    return mapInterview(response.data);
  },

  // Handles scheduling a new recruiter interview from the interview creation flow.
  async scheduleInterview(
    data: ScheduleInterviewInput,
  ): Promise<Interview> {
    const response = await http.post<RecruiterInterviewDto>("/api/recruiter/interviews", {
      jobId: data.jobId,
      jobSeekerId: data.jobseekerId,
      scheduledDateTimeUtc: data.scheduledDate,
      interviewType: data.interviewType,
      locationOrMeetingLink: data.meetingLink?.trim() || data.location?.trim() || "",
      message: data.message,
    });
    return mapInterview(response.data);
  },

  // Use to fetch shortlisted candidates that can be scheduled for interviews on a specific job.
  async getShortlistedCandidates(jobId: string, department?: string): Promise<ShortlistedCandidateOption[]> {
    const response = await http.get<ShortlistedCandidateOptionDto[]>(`/api/recruiter/jobs/${jobId}/shortlisted-candidates`, {
      params: {
        department: department || undefined,
      },
    });
    return response.data.map((item) => ({
      jobseekerId: item.jobSeekerUserId,
      submissionId: item.resumeSubmissionId,
      candidateName: item.candidateName,
      candidateEmail: item.candidateEmail,
    }));
  },

  // Handles updating the schedule, venue, and message for an existing recruiter interview.
  async rescheduleInterview(
    interviewId: string,
    data: RescheduleInterviewInput,
  ): Promise<Interview> {
    const response = await http.put<RecruiterInterviewDto>(
      `/api/recruiter/interviews/${interviewId}`,
      {
        scheduledDateTimeUtc: data.scheduledDate,
        interviewType: data.interviewType,
        locationOrMeetingLink:
          data.meetingLink?.trim() || data.location?.trim() || "",
        message: data.message,
      },
    );
    return mapInterview(response.data);
  },

  // Handles canceling an interview and storing the recruiter-provided cancellation reason.
  async cancelInterview(interviewId: string, data: CancelInterviewInput): Promise<Interview> {
    const response = await http.post<RecruiterInterviewDto>(
      `/api/recruiter/interviews/${interviewId}/cancel`,
      { reason: data.reason },
    );
    return mapInterview(response.data);
  },

  // Handles marking an interview as completed once the meeting has finished.
  async completeInterview(interviewId: string): Promise<Interview> {
    const response = await http.post<RecruiterInterviewDto>(
      `/api/recruiter/interviews/${interviewId}/complete`,
      {},
    );
    return mapInterview(response.data);
  },

  // Handles archiving a completed or inactive interview out of the recruiter active list.
  async archiveInterview(interviewId: string): Promise<Interview> {
    const response = await http.post<RecruiterInterviewDto>(
      `/api/recruiter/interviews/${interviewId}/archive`,
      {},
    );
    return mapInterview(response.data);
  },
};
