export type JobseekerInterviewStatus =
  | "Pending"
  | "Accepted"
  | "Declined"
  | "RescheduleRequested"
  | "Rescheduled"
  | "Cancelled"
  | "Completed";

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
  archivedAt?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  companyName?: string;
}

export interface JobseekerArchivedInterviewsQueryParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
  status?: string;
}

export interface JobseekerArchivedInterviewsLoaderData {
  items: JobseekerInterview[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
