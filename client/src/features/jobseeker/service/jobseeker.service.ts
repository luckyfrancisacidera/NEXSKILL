import { http } from '@shared/api/http';
import type { JobDto, Paged } from '@features/recruiter/service/recruiter.service';

const cache = new Map<string, { expiresAt: number; value: unknown }>();
const getCached = <T,>(key: string): T | null => {
  const item = cache.get(key);
  if (!item || item.expiresAt < Date.now()) return null;
  return item.value as T;
};
const setCached = <T,>(key: string, value: T, ttlMs: number) => { cache.set(key, { value, expiresAt: Date.now() + ttlMs }); };

export const jobseekerService = {
  getPublicJobs: async (params: { pageNumber: number; pageSize: number; search?: string }) => {
    const key = `publicJobs:${JSON.stringify(params)}`;
    const cached = getCached<Paged<JobDto>>(key);
    if (cached) return cached;
    const data = (await http.get<Paged<JobDto>>('/api/jobs', { params })).data;
    setCached(key, data, 60_000);
    return data;
  },
  getJobDetail: async (id: string) => {
    const key = `jobDetail:${id}`;
    const cached = getCached<JobDto>(key);
    if (cached) return cached;
    const data = (await http.get<JobDto>(`/api/jobs/${id}`)).data;
    setCached(key, data, 120_000);
    return data;
  },
  applyToJob: async (jobId: string, input: { full_name: string; email: string; postal_code: string; location: string; resume_file: File }) => {
    const formData = new FormData();
    formData.append('full_name', input.full_name);
    formData.append('email', input.email);
    formData.append('postal_code', input.postal_code);
    formData.append('location', input.location);
    formData.append('resume_file', input.resume_file);
    return (await http.post(`/api/jobseeker/jobs/${jobId}/apply`, formData)).data;
  },
  getMyApplications: async (params: { pageNumber: number; pageSize: number }) => (await http.get<Paged<Record<string, unknown>>>('/api/jobseeker/applications', { params })).data,
};
