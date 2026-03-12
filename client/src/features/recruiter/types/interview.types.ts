export type InterviewStatus =
  | "Pending"
  | "Accepted"
  | "Declined"
  | "RescheduleRequested"
  | "Rescheduled";

export interface Interview {
  id: string;
  jobId: string;
  recruiterId: string;
  jobseekerId: string;
  candidateName: string;
  jobTitle?: string;
  scheduledDate: string;
  meetingLink?: string;
  location?: string;
  message?: string;
  status: InterviewStatus;
  recruiterName?: string;
  recruiterEmail?: string;
  companyName?: string;
}

export interface ScheduleInterviewInput {
  jobId: string;
  jobseekerId: string;
  scheduledDate: string;
  meetingLink?: string;
  location?: string;
  message?: string;
}

export interface RescheduleInterviewInput {
  scheduledDate: string;
  message?: string;
}
