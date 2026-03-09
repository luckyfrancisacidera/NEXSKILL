export type DashboardRange =
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_year"
  | "last_year";

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

export interface DashboardLoaderData extends DashboardDto {}
