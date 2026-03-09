import { http } from "@shared/api/http";
import type {
  DashboardDto,
  JobDto,
  JobseekerApplicationInput,
  JobseekerApplicationsQueryParams,
  JobseekerApplicationsResponse,
  JobseekerProfileDto,
  JobseekerProfileUpdatePayload,
  PasswordResetPayload,
  PasswordResetPinVerificationPayload,
  PasswordResetRequestPayload,
  Paged,
  PublicJobsQueryParams,
  SavedJobDto,
} from "@features/jobseeker/types";

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
  ): Promise<void> {
    const formData = new FormData();
    Object.entries(input).forEach(([key, value]) => {
      formData.append(key, value);
    });

    await http.post(`/api/jobseeker/jobs/${jobId}/apply`, formData);
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

  async withdrawApplication(id: string): Promise<void> {
    await http.patch(`/api/jobseeker/applications/${id}/withdraw`);
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
    const response = await http.put<JobseekerProfileDto>(
      "/api/jobseeker/profile",
      payload,
    );
    return response.data;
  },

  async requestPasswordReset(
    payload: PasswordResetRequestPayload | string,
  ): Promise<unknown> {
    const body = typeof payload === "string" ? { email: payload } : payload;
    const response = await http.post("/api/auth/request-password-reset", body);
    return response.data;
  },

  async verifyResetPin(
    payload: PasswordResetPinVerificationPayload | string,
    pin?: string,
  ): Promise<unknown> {
    const body =
      typeof payload === "string"
        ? { email: payload, pin: pin ?? "" }
        : payload;
    const response = await http.post("/api/auth/verify-reset-pin", body);
    return response.data;
  },

  async resetPassword(
    payload: PasswordResetPayload | string,
    pin?: string,
    newPassword?: string,
  ): Promise<unknown> {
    const body =
      typeof payload === "string"
        ? { email: payload, pin: pin ?? "", newPassword: newPassword ?? "" }
        : payload;
    const response = await http.post("/api/auth/reset-password", body);
    return response.data;
  },
};
