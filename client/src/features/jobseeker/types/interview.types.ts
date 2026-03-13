export type JobseekerInterviewStatus =
  | "Pending"
  | "Accepted"
  | "Declined"
  | "RescheduleRequested"
  | "Rescheduled"
  | "Cancelled";

export interface JobseekerInterview {
  id: string;
  recruiterId: string;
  jobseekerId: string;
  jobTitle?: string;
  scheduledDate: string;
  meetingLink?: string;
  location?: string;
  message?: string;
  status: JobseekerInterviewStatus;
  cancelReason?: string;
  isArchived?: boolean;
  recruiterName?: string;
  recruiterEmail?: string;
  companyName?: string;
}
