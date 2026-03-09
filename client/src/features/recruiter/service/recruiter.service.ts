export type { JobDto, Paged } from '@features/recruiter/types';
import { http } from '@shared/api/http';
import type {
  ApplicantDetailDto,
  ApplicantScoresDto,
  BulkApplicantStageResponseDto,
  DashboardDto,
  JobDto,
  Paged,
  RecruiterProfileDto,
} from '@features/recruiter/types';

export interface RecruiterProfileUpdatePayload {
  company_name: string;
  company_email: string;
}

export interface RecruiterJobPayload {
  [key: string]: unknown;
}

export interface RecruiterJobsQueryParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
  department?: string;
}

export interface ApplicantScoresQueryParams {
  search?: string;
  stage?: string;
  jobId?: string;
  department?: string;
  recommendedTopPercent?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface UpdateApplicantStatusesPayload {
  action?: string;
  status?: string;
}

export interface DashboardStatsQueryParams {
  startDate?: string;
  endDate?: string;
  department?: string;
  jobRole?: string;
  groupBy?: 'week' | 'month' | 'year' | 'department' | 'job';
}

export const recruiterService = {
  /** Fetch the recruiter's profile. */
  async getProfile(): Promise<RecruiterProfileDto> {
    const response = await http.get<RecruiterProfileDto>('/api/recruiter/profile');
    return response.data;
  },

  /** Update the recruiter's profile details. */
  async updateProfile(payload: RecruiterProfileUpdatePayload): Promise<RecruiterProfileDto> {
    const response = await http.put<RecruiterProfileDto>('/api/recruiter/profile', payload);
    return response.data;
  },

  /** Create a recruiter job post. */
  async createJob(payload: RecruiterJobPayload): Promise<JobDto> {
    const response = await http.post<JobDto>('/api/recruiter/jobs', payload);
    return response.data;
  },

  /** Update an existing recruiter job post. */
  async updateJob(id: string, payload: RecruiterJobPayload): Promise<JobDto> {
    const response = await http.put<JobDto>(`/api/recruiter/jobs/${id}`, payload);
    return response.data;
  },

  /** Fetch paginated recruiter jobs. */
  async getRecruiterJobs(params: RecruiterJobsQueryParams): Promise<Paged<JobDto>> {
    const response = await http.get<Paged<JobDto>>('/api/recruiter/jobs', { params });
    return response.data;
  },

  /** Fetch a single recruiter job by id. */
  async getRecruiterJob(id: string): Promise<JobDto> {
    const response = await http.get<JobDto>(`/api/recruiter/jobs/${id}`);
    return response.data;
  },

  /** Delete a recruiter job by id. */
  async deleteJob(id: string): Promise<void> {
    await http.delete(`/api/recruiter/jobs/${id}`);
  },

  /** Publish a recruiter job. */
  async publishJob(id: string): Promise<void> {
    await http.post(`/api/recruiter/jobs/${id}/publish`);
  },

  /** Close a recruiter job. */
  async closeJob(id: string): Promise<void> {
    await http.post(`/api/recruiter/jobs/${id}/close`);
  },

  /** Fetch applicant scoring results and filters. */
  async getApplicantScores(params: ApplicantScoresQueryParams): Promise<ApplicantScoresDto> {
    const response = await http.get<ApplicantScoresDto>('/api/recruiter/applicants/scores', {
      params,
    });
    return response.data;
  },

  /** Fetch a candidate detail payload by resume submission id. */
  async getApplicantBySubmissionId(submissionId: string): Promise<ApplicantDetailDto> {
    const response = await http.get<ApplicantDetailDto>(`/api/recruiter/applicants/scores/${submissionId}`);
    return response.data;
  },

  /** Update one or more candidate statuses. */
  async updateApplicantStatuses(
    submissionIds: string[],
    payload: UpdateApplicantStatusesPayload,
  ): Promise<BulkApplicantStageResponseDto> {
    const response = await http.put<BulkApplicantStageResponseDto>(
      '/api/recruiter/applicants/scores/status',
      {
        submission_ids: submissionIds,
        ...payload,
      },
    );
    return response.data;
  },

  /** Fetch recruiter dashboard metrics and trend data. */
  async getDashboardStats(params: DashboardStatsQueryParams): Promise<DashboardDto> {
    const response = await http.get<DashboardDto>('/api/recruiter/dashboard', { params });
    return response.data;
  },
};

