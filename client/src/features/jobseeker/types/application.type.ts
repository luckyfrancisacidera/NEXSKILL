import type { Paged } from "@features/recruiter/types";

export interface JobseekerApplicationInput {
  full_name: string;
  email: string;
  postal_code: string;
  location: string;
  resume_file: File;
}

export type JobseekerApplicationStage =
  | "Applied"
  | "Under Review"
  | "Shortlisted"
  | "Interview"
  | "Offer"
  | "Hired"
  | "Rejected"
  | "Withdrawn";

export interface ApplyToJobResponse {
  submission_id: string;
  status: string;
  message: string;
}

export type JobseekerOfferStatus =
  | "Pending"
  | "Accepted"
  | "Declined"
  | "Expired"
  | "Cancelled";

export interface JobseekerOfferDto {
  id: string;
  application_id: string;
  sent_by_user_id: string;
  title: string;
  message: string;
  salary_text: string;
  employment_type: string;
  start_date?: string | null;
  expiration_date?: string | null;
  status: JobseekerOfferStatus;
  sent_at_utc: string;
  responded_at_utc?: string | null;
  created_at_utc: string;
  updated_at_utc: string;
  can_accept: boolean;
  can_decline: boolean;
  can_mark_hired: boolean;
}

export interface JobseekerApplicationDto {
  id: string;
  job_id: string;
  job_title: string;
  company: string;
  company_name?: string;
  recruiter_name?: string;
  recruiter_email?: string;
  full_name?: string;
  email?: string;
  status: string;
  current_stage?: JobseekerApplicationStage;
  has_offer?: boolean;
  is_hired?: boolean;
  offered_at_utc?: string | null;
  hired_at_utc?: string | null;
  created_at_utc: string;
  updated_at_utc?: string;
  offer?: JobseekerOfferDto | null;
}

export interface JobseekerApplicationsQueryParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
  status?: string;
}

export type JobseekerApplicationsResponse = Paged<JobseekerApplicationDto>;

export interface ApplyJobActionData {
  error?: string;
}

export interface ApplicationsLoaderData extends JobseekerApplicationsResponse {}
