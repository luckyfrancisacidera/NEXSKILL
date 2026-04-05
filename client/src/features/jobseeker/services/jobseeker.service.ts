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

// Handles job discovery, applications, saved jobs, offers, and profile API calls for jobseekers.
export const jobseekerService = {
  // Use to load one paginated slice of public jobs and cache repeated filter requests briefly.
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

  // Use to gather every public job across pages when screens need a complete in-memory list.
  async getAllPublicJobs(): Promise<JobDto[]> {
    const key = "publicJobs:all";
    const cached = getCached<JobDto[]>(key);
    if (cached) {
      return cached;
    }

    const pageSize = 100;
    const firstPage = await this.getPublicJobs({
      pageNumber: 1,
      pageSize,
    });

    if (firstPage.totalPages <= 1) {
      setCached(key, firstPage.items, 60_000);
      return firstPage.items;
    }

    const remainingPages = await Promise.all(
      Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
        this.getPublicJobs({
          pageNumber: index + 2,
          pageSize,
        }),
      ),
    );

    const allItems = [
      ...firstPage.items,
      ...remainingPages.flatMap((page) => page.items),
    ];

    setCached(key, allItems, 60_000);
    return allItems;
  },

  // Use to fetch a single public job record before showing the job detail page.
  async getJobDetail(id: string): Promise<JobDto> {
    const response = await http.get<JobDto>(`/api/jobs/${id}`);
    return response.data;
  },

  // Handles multipart application submission when a jobseeker applies with form data and a resume file.
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

  // Use to fetch the jobseeker dashboard summary and analytics for the selected range.
  async getDashboard(range: string): Promise<DashboardDto> {
    const response = await http.get<DashboardDto>("/api/jobseeker/dashboard", {
      params: { range },
    });
    return response.data;
  },

  // Use to load the active or archived applications table with the current filters.
  async getMyApplications(
    params: JobseekerApplicationsQueryParams,
  ): Promise<JobseekerApplicationsResponse> {
    const endpoint = params.archivedOnly
      ? "/api/jobseeker/applications/archived"
      : "/api/jobseeker/applications";
    const response = await http.get<JobseekerApplicationsResponse>(
      endpoint,
      {
        params: {
          pageNumber: params.pageNumber,
          pageSize: params.pageSize,
          search: params.search,
          status: params.status,
        },
      },
    );
    return response.data;
  },

  // Use to fetch one application payload when a detail view needs the full record.
  async getApplicationDetail(id: string): Promise<unknown> {
    const response = await http.get(`/api/jobseeker/applications/${id}`);
    return response.data;
  },

  // Use to load the current offer attached to a job application.
  async getOffer(id: string): Promise<JobseekerOfferDto> {
    const response = await http.get<JobseekerOfferDto>(`/api/jobseeker/applications/${id}/offer`);
    return response.data;
  },

  // Handles the jobseeker action for accepting an offer from the offers workflow.
  async acceptOffer(id: string): Promise<JobseekerOfferDto> {
    const response = await http.post<JobseekerOfferDto>(`/api/jobseeker/applications/${id}/offer/accept`);
    return response.data;
  },

  // Handles the jobseeker action for declining an offer from the offers workflow.
  async declineOffer(id: string): Promise<JobseekerOfferDto> {
    const response = await http.post<JobseekerOfferDto>(`/api/jobseeker/applications/${id}/offer/decline`);
    return response.data;
  },

  // Handles withdrawing an application while keeping the rest of the application history intact.
  async withdrawApplication(id: string): Promise<void> {
    await http.patch(`/api/jobseeker/applications/${id}/withdraw`);
  },

  // Use to move a finished application history item into the archived list.
  async archiveApplicationHistory(id: string): Promise<void> {
    await http.post(`/api/jobseeker/applications/${id}/history/archive`);
  },

  // Use to restore an archived application history item back into the main list.
  async unarchiveApplicationHistory(id: string): Promise<void> {
    await http.post(`/api/jobseeker/applications/${id}/history/unarchive`);
  },

  // Use to permanently remove an application history item once the user confirms deletion.
  async deleteApplicationHistory(id: string): Promise<void> {
    await http.delete(`/api/jobseeker/applications/${id}/history`);
  },

  // Use to load saved jobs, optionally filtered by the current search text.
  async getSavedJobs(search?: string): Promise<SavedJobDto[]> {
    const response = await http.get<SavedJobDto[]>(
      "/api/jobseeker/saved-jobs",
      {
        params: { search },
      },
    );
    return response.data;
  },

  // Handles saving a public job so it appears in the jobseeker saved-jobs list.
  async saveJob(jobId: string): Promise<void> {
    await http.post(`/api/jobseeker/saved-jobs/${jobId}`);
  },

  // Handles removing a previously saved job from the saved-jobs list.
  async removeSavedJob(jobId: string): Promise<void> {
    await http.delete(`/api/jobseeker/saved-jobs/${jobId}`);
  },

  // Use to fetch the current jobseeker profile before rendering the profile form.
  async getProfile(): Promise<JobseekerProfileDto> {
    const response = await http.get<JobseekerProfileDto>(
      "/api/jobseeker/profile",
    );
    return response.data;
  },

  // Handles profile updates and sanitizes rich-text fields before they are sent to the API.
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
