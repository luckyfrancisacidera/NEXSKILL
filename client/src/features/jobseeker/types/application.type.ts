import type { Paged } from "@features/recruiter/types";

export interface JobseekerApplicationInput {
  full_name: string;
  email: string;
  postal_code: string;
  location: string;
  resume_file: File;
}

export interface JobseekerApplicationDto {
  id: string;
  job_title: string;
  company: string;
  status: string;
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
