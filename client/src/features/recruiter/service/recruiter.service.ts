export type { JobDto, Paged } from '@features/recruiter/types';
import { http } from '@shared/api/http';
import type {
  ApplicantDetailDto,
  OfferDto,
  ApplicantResumeDownloadDto,
  ApplicantScoreItemDto,
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

export interface SendOfferPayload {
  title: string;
  message: string;
  salary_text: string;
  employment_type: string;
  start_date?: string | null;
  expiration_date?: string | null;
}

export interface DashboardStatsQueryParams {
  startDate?: string;
  endDate?: string;
  department?: string;
  jobRole?: string;
  groupBy?: 'week' | 'month' | 'year' | 'department' | 'job';
}

export interface ShortlistedCandidateOptionDto {
  jobSeekerUserId: string;
  resumeSubmissionId: string;
  candidateName: string;
  candidateEmail: string;
}

export const recruiterService = {
  async getProfile(): Promise<RecruiterProfileDto> {
    const response = await http.get<RecruiterProfileDto>('/api/recruiter/profile');
    return response.data;
  },

  async updateProfile(payload: RecruiterProfileUpdatePayload): Promise<RecruiterProfileDto> {
    const response = await http.put<RecruiterProfileDto>('/api/recruiter/profile', payload);
    return response.data;
  },

  async createJob(payload: RecruiterJobPayload): Promise<JobDto> {
    const response = await http.post<JobDto>('/api/recruiter/jobs', payload);
    return response.data;
  },

  async updateJob(id: string, payload: RecruiterJobPayload): Promise<JobDto> {
    const response = await http.put<JobDto>(`/api/recruiter/jobs/${id}`, payload);
    return response.data;
  },

  async duplicateJob(id: string): Promise<JobDto> {
    const response = await http.post<JobDto>(`/api/jobs/${id}/duplicate`);
    return response.data;
  },

  async updateJobStatus(id: string, status: string): Promise<JobDto> {
    const response = await http.put<JobDto>(`/api/recruiter/jobs/${id}/status`, { status });
    return response.data;
  },

  async getRecruiterJobs(params: RecruiterJobsQueryParams): Promise<Paged<JobDto>> {
    const response = await http.get<Paged<JobDto>>('/api/recruiter/jobs', { params });
    return response.data;
  },

  async getRecruiterJob(id: string): Promise<JobDto> {
    const response = await http.get<JobDto>(`/api/recruiter/jobs/${id}`);
    return response.data;
  },

  async getShortlistedCandidates(jobId: string, department?: string): Promise<ShortlistedCandidateOptionDto[]> {
    const response = await http.get<ShortlistedCandidateOptionDto[]>(`/api/recruiter/jobs/${jobId}/shortlisted-candidates`, {
      params: {
        department: department || undefined,
      },
    });
    return response.data;
  },

  async deleteJob(id: string): Promise<void> {
    await http.delete(`/api/recruiter/jobs/${id}`);
  },

  async publishJob(id: string): Promise<JobDto> {
    return this.updateJobStatus(id, 'Published');
  },

  async closeJob(id: string): Promise<JobDto> {
    return this.updateJobStatus(id, 'Closed');
  },

  async getApplicantScores(params: ApplicantScoresQueryParams): Promise<ApplicantScoresDto> {
    const response = await http.get<ApplicantScoresDto>('/api/recruiter/applicants/scores', {
      params,
    });
    return response.data;
  },

  async getApplicantBySubmissionId(submissionId: string): Promise<ApplicantDetailDto> {
    const response = await http.get<ApplicantDetailDto>(`/api/recruiter/applicants/scores/${submissionId}`);
    return response.data;
  },

  async getApplicantResumeDownload(submissionId: string): Promise<ApplicantResumeDownloadDto> {
    const response = await http.get<ApplicantResumeDownloadDto>(`/api/recruiter/applicants/${submissionId}/resume/download`);
    return response.data;
  },

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

  async getOffer(submissionId: string): Promise<OfferDto | null> {
    const response = await http.get<OfferDto>(`/api/recruiter/applicants/${submissionId}/offer`);
    return response.data;
  },

  async sendOffer(submissionId: string, payload: SendOfferPayload): Promise<ApplicantScoreItemDto> {
    const response = await http.post<ApplicantScoreItemDto>(
      `/api/recruiter/applicants/${submissionId}/offer`,
      payload,
    );
    return response.data;
  },

  async markHired(submissionId: string): Promise<ApplicantScoreItemDto> {
    const response = await http.post<ApplicantScoreItemDto>(
      `/api/recruiter/applicants/${submissionId}/hire`,
    );
    return response.data;
  },

  async getDashboardStats(params: DashboardStatsQueryParams): Promise<DashboardDto> {
    const response = await http.get<DashboardDto>('/api/recruiter/dashboard', { params });
    return response.data;
  },
};
