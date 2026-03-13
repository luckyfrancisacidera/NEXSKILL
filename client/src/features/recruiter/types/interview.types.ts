export type InterviewStatus =
  | "Pending"
  | "Accepted"
  | "Declined"
  | "RescheduleRequested"
  | "Rescheduled"
  | "Cancelled";

// Interview types stay explicit so the UI can validate the correct field
// and the backend can generate consistent invites and calendar metadata.
export type InterviewType = "Virtual" | "Onsite";

export interface Interview {
  id: string;
  jobId: string;
  recruiterId: string;
  jobseekerId: string;
  candidateName: string;
  jobTitle?: string;
  scheduledDate: string;
  interviewType: InterviewType;
  meetingLink?: string;
  location?: string;
  message?: string;
  status: InterviewStatus;
  cancelReason?: string;
  isArchived?: boolean;
  recruiterName?: string;
  recruiterEmail?: string;
  companyName?: string;
}

export interface ShortlistedCandidateOption {
  jobseekerId: string;
  submissionId: string;
  candidateName: string;
  candidateEmail: string;
}

export interface ScheduleInterviewInput {
  jobId: string;
  jobseekerId: string;
  scheduledDate: string;
  interviewType: InterviewType;
  meetingLink?: string;
  location?: string;
  message?: string;
}

export interface CancelInterviewInput {
  reason?: string;
}

export interface RescheduleInterviewInput {
  scheduledDate: string;
  interviewType: InterviewType;
  meetingLink?: string;
  location?: string;
  message?: string;
}
