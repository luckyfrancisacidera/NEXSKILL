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
  | "Shortlisted"
  | "Interview"
  | "Offer"
  | "Hire"
  | "Rejected"
  | "Withdrawn";

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
