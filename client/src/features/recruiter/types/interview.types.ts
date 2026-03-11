export type InterviewStatus = "Pending" | "Accepted" | "Declined" | "RescheduleRequested";

export interface Interview {
  id: string;
  recruiterId: string;
  jobseekerId: string;
  candidateName: string;
  scheduledDate: string;
  meetingLink?: string;
  location?: string;
  message?: string;
  status: InterviewStatus;
}

export interface ScheduleInterviewInput {
  recruiterId: string;
  jobseekerId: string;
  candidateName: string;
  scheduledDate: string;
  meetingLink?: string;
  location?: string;
  message?: string;
}

export interface RescheduleInterviewInput {
  scheduledDate: string;
  message?: string;
}

