import { http } from "@shared/api/http";
import type {
  ApplyToJobResponse,
  DashboardDto,
  JobDto,
  JobseekerApplicationInput,
  JobseekerOfferDto,
  JobseekerApplicationsQueryParams,
  JobseekerApplicationsResponse,
  JobseekerProfileDto,
  JobseekerProfileUpdatePayload,
  Paged,
  PublicJobsQueryParams,
  SavedJobDto,
} from "@features/jobseeker/types";
import { sanitizeRichText } from "@shared/utils/richText";

const cache = new Map<string, { expiresAt: number; value: unknown }>();

const getCached = <T>(key: string): T | null => {
  const item = cache.get(key);
  if (!item || item.expiresAt < Date.now()) {
    return null;
  }

  return item.value as T;
};

const setCached = <T>(key: string, value: T, ttlMs: number) => {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
};

export const jobseekerService = {
  async getPublicJobs(params: PublicJobsQueryParams): Promise<Paged<JobDto>> {
    const key = `publicJobs:${JSON.stringify(params)}`;
    const cached = getCached<Paged<JobDto>>(key);
    if (cached) {
      return cached;
    }

    const response = await http.get<Paged<JobDto>>("/api/jobs", { params });
    const data = response.data;
    setCached(key, data, 60_000);
    return data;
  },

  async getJobDetail(id: string): Promise<JobDto> {
    const response = await http.get<JobDto>(`/api/jobs/${id}`);
    return response.data;
  },

  async applyToJob(
    jobId: string,
    input: JobseekerApplicationInput,
  ): Promise<ApplyToJobResponse> {
    const formData = new FormData();
    Object.entries(input).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await http.post<ApplyToJobResponse>(`/api/jobseeker/jobs/${jobId}/apply`, formData);
    return response.data;
  },

  async getDashboard(range: string): Promise<DashboardDto> {
    const response = await http.get<DashboardDto>("/api/jobseeker/dashboard", {
      params: { range },
    });
    return response.data;
  },

  async getMyApplications(
    params: JobseekerApplicationsQueryParams,
  ): Promise<JobseekerApplicationsResponse> {
    const response = await http.get<JobseekerApplicationsResponse>(
      "/api/jobseeker/applications",
      {
        params,
      },
    );
    return response.data;
  },

  async getApplicationDetail(id: string): Promise<unknown> {
    const response = await http.get(`/api/jobseeker/applications/${id}`);
    return response.data;
  },

  async getOffer(id: string): Promise<JobseekerOfferDto> {
    const response = await http.get<JobseekerOfferDto>(`/api/jobseeker/applications/${id}/offer`);
    return response.data;
  },

  async acceptOffer(id: string): Promise<JobseekerOfferDto> {
    const response = await http.post<JobseekerOfferDto>(`/api/jobseeker/applications/${id}/offer/accept`);
    return response.data;
  },

  async declineOffer(id: string): Promise<JobseekerOfferDto> {
    const response = await http.post<JobseekerOfferDto>(`/api/jobseeker/applications/${id}/offer/decline`);
    return response.data;
  },

  async withdrawApplication(id: string): Promise<void> {
    await http.patch(`/api/jobseeker/applications/${id}/withdraw`);
  },

  async deleteApplicationHistory(id: string): Promise<void> {
    await http.delete(`/api/jobseeker/applications/${id}/history`);
  },

  async getSavedJobs(search?: string): Promise<SavedJobDto[]> {
    const response = await http.get<SavedJobDto[]>(
      "/api/jobseeker/saved-jobs",
      {
        params: { search },
      },
    );
    return response.data;
  },

  async saveJob(jobId: string): Promise<void> {
    await http.post(`/api/jobseeker/saved-jobs/${jobId}`);
  },

  async removeSavedJob(jobId: string): Promise<void> {
    await http.delete(`/api/jobseeker/saved-jobs/${jobId}`);
  },

  async getProfile(): Promise<JobseekerProfileDto> {
    const response = await http.get<JobseekerProfileDto>(
      "/api/jobseeker/profile",
    );
    return response.data;
  },

  async updateProfile(
    payload: JobseekerProfileUpdatePayload,
  ): Promise<JobseekerProfileDto> {
    const safePayload: JobseekerProfileUpdatePayload = {
      ...payload,
      bio: sanitizeRichText(payload.bio) || undefined,
      experience_summary: sanitizeRichText(payload.experience_summary) || undefined,
    };
    const response = await http.put<JobseekerProfileDto>(
      "/api/jobseeker/profile",
      safePayload,
    );
    return response.data;
  },
};
