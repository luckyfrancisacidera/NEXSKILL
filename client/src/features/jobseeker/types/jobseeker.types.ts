/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { JobDto, Paged } from '@features/recruiter/types';

export type { JobDto, Paged };

export type DashboardRange =
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_year';

export interface PublicJobsQueryParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
}

export interface JobseekerApplicationInput {
  full_name: string;
  email: string;
  postal_code: string;
  location: string;
  resume_file: File;
}

export interface JobseekerStatusSummary {
  applied: number;
  interview: number;
  offer: number;
}

export interface SavedJobDto {
  [key: string]: unknown;
  id: string;
  title: string;
  company: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  job_type?: string;
}

export interface RecentApplicationDto {
  id: string;
  job_title: string;
  company: string;
  applied_at: string;
  status: string;
}

export interface DashboardAnalyticsDto {
  labels: string[];
  counts: number[];
  total: number;
  range: DashboardRange | string;
}

export interface DashboardDto {
  status: JobseekerStatusSummary;
  saved_jobs: SavedJobDto[];
  recent_applications: RecentApplicationDto[];
  analytics: DashboardAnalyticsDto;
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

export interface JobseekerProfileDto {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  professional_title?: string;
  skills?: string;
  bio?: string;
  experience_summary?: string;
  resume_url?: string;
  avatar_url?: string;
}

export interface JobseekerProfileUpdatePayload {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  professional_title?: string;
  skills?: string;
  bio?: string;
  experience_summary?: string;
  resume_url?: string;
  avatar_url?: string;
}

export interface PasswordResetRequestPayload {
  email: string;
}

export interface PasswordResetPinVerificationPayload {
  email: string;
  pin: string;
}

export interface PasswordResetPayload {
  email: string;
  pin: string;
  newPassword: string;
}

export interface ApiMessageResponse {
  message?: string;
  errors?: string[];
}

export interface ApplyJobActionData {
  error?: string;
}

export interface JobsLoaderData extends Paged<JobDto> {}

export type JobDetailLoaderData = JobDto;

export interface DashboardLoaderData extends DashboardDto {}

export interface ApplicationsLoaderData extends JobseekerApplicationsResponse {}
