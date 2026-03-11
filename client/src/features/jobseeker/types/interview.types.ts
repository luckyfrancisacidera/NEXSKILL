export type JobseekerInterviewStatus =
  | "Pending"
  | "Accepted"
  | "Declined"
  | "RescheduleRequested"
  | "Rescheduled";

export interface JobseekerInterview {
  id: string;
  recruiterId: string;
  jobseekerId: string;
  scheduledDate: string;
  meetingLink?: string;
  location?: string;
  message?: string;
  status: JobseekerInterviewStatus;
  recruiterName?: string;
  recruiterEmail?: string;
  companyName?: string;
}
