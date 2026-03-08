import { http } from '@shared/api/http';
import type { JobDto, Paged } from '@features/recruiter/service/recruiter.service';

const cache = new Map<string, { expiresAt: number; value: unknown }>();
const getCached = <T,>(key: string): T | null => {
  const item = cache.get(key);
  if (!item || item.expiresAt < Date.now()) return null;
  return item.value as T;
};
const setCached = <T,>(key: string, value: T, ttlMs: number) => { cache.set(key, { value, expiresAt: Date.now() + ttlMs }); };

export interface DashboardDto {
  status: { applied: number; interview: number; offer: number };
  saved_jobs: Array<Record<string, unknown>>;
  recent_applications: Array<Record<string, unknown>>;
  analytics: { labels: string[]; counts: number[]; total: number; range: string };
}

export const jobseekerService = {
  getPublicJobs: async (params: { pageNumber: number; pageSize: number; search?: string }) => {
    const key = `publicJobs:${JSON.stringify(params)}`;
    const cached = getCached<Paged<JobDto>>(key);
    if (cached) return cached;
    const data = (await http.get<Paged<JobDto>>('/api/jobs', { params })).data;
    setCached(key, data, 60_000);
    return data;
  },
  getJobDetail: async (id: string) => (await http.get<JobDto>(`/api/jobs/${id}`)).data,
  applyToJob: async (jobId: string, input: { full_name: string; email: string; postal_code: string; location: string; resume_file: File }) => {
    const formData = new FormData();
    Object.entries(input).forEach(([key, value]) => formData.append(key, value));
    return (await http.post(`/api/jobseeker/jobs/${jobId}/apply`, formData)).data;
  },
  getDashboard: async (range: string) => (await http.get<DashboardDto>('/api/jobseeker/dashboard', { params: { range } })).data,
  getMyApplications: async (params: Record<string, string | number | undefined>) => (await http.get<Paged<Record<string, unknown>>>('/api/jobseeker/applications', { params })).data,
  getApplicationDetail: async (id: string) => (await http.get(`/api/jobseeker/applications/${id}`)).data,
  withdrawApplication: async (id: string) => (await http.patch(`/api/jobseeker/applications/${id}/withdraw`)).data,
  getSavedJobs: async (search?: string) => (await http.get<Array<Record<string, unknown>>>('/api/jobseeker/saved-jobs', { params: { search } })).data,
  saveJob: async (jobId: string) => (await http.post(`/api/jobseeker/saved-jobs/${jobId}`)).data,
  removeSavedJob: async (jobId: string) => (await http.delete(`/api/jobseeker/saved-jobs/${jobId}`)).data,
  getProfile: async () => (await http.get('/api/jobseeker/profile')).data,
  updateProfile: async (payload: Record<string, string>) => (await http.put('/api/jobseeker/profile', payload)).data,
  requestPasswordReset: async (email: string) => (await http.post('/api/auth/request-password-reset', { email })).data,
  verifyResetPin: async (email: string, pin: string) => (await http.post('/api/auth/verify-reset-pin', { email, pin })).data,
  resetPassword: async (email: string, pin: string, newPassword: string) => (await http.post('/api/auth/reset-password', { email, pin, newPassword })).data,
};
