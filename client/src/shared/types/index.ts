export type Role = 'jobseeker' | 'recruiter' | 'admin' | 'companyAdmin' | 'superAdmin';

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Remote';

export interface Job {
  id: string;
  title: string;
  company: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  location: string;
  type: JobType;
  snippet: string;
}

export interface ApplicationRecord {
  jobId: string;
  appliedAt: string;
  status: 'Applied' | 'Interview' | 'Offer';
}

export interface User {
  name: string;
  avatarUrl?: string;
  location: string;
}

export interface RouteMeta {
  label: string;
  path: string;
  roles: Role[];
  icon?: string;
}

export interface DashboardAnalyticsPoint {
  day: string;
  applications: number;
}
