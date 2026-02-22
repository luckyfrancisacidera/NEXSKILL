import type { Role } from '@shared/types';

export type AppRouteKey =
  | 'dashboard'
  | 'jobs'
  | 'applications'
  | 'messages'
  | 'saved'
  | 'profile'
  | 'settings'
  | 'recruiterDashboard'
  | 'recruiterJobs'
  | 'adminDashboard'
  | 'adminUsers';

export const routeAccess: Record<AppRouteKey, Role[]> = {
  dashboard: ['jobseeker', 'admin'],
  jobs: ['jobseeker', 'admin'],
  applications: ['jobseeker', 'admin'],
  messages: ['jobseeker', 'admin'],
  saved: ['jobseeker', 'admin'],
  profile: ['jobseeker', 'admin'],
  settings: ['jobseeker', 'recruiter', 'admin'],
  recruiterDashboard: ['recruiter', 'admin'],
  recruiterJobs: ['recruiter', 'admin'],
  adminDashboard: ['admin'],
  adminUsers: ['admin'],
};
