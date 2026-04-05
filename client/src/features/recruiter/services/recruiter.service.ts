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
  EmployeeRecordDto,
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
  benefits?: string | null;
  salary_text: string;
  salary_amount: number;
  salary_type: string;
  currency: string;
  employment_type: string;
  work_setup: string;
  start_date?: string | null;
  end_date?: string | null;
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

// Handles recruiter-side API calls for profile, jobs, candidates, offers, dashboard data, and hiring records.
export const recruiterService = {
  // Use to fetch the active recruiter profile before rendering recruiter settings or identity UI.
  async getProfile(): Promise<RecruiterProfileDto> {
    const response = await http.get<RecruiterProfileDto>('/api/recruiter/profile');
    return response.data;
  },

  // Handles recruiter profile updates from the recruiter settings experience.
  async updateProfile(payload: RecruiterProfileUpdatePayload): Promise<RecruiterProfileDto> {
    const response = await http.put<RecruiterProfileDto>('/api/recruiter/profile', payload);
    return response.data;
  },

  // Handles creating a new recruiter-managed job posting.
  async createJob(payload: RecruiterJobPayload): Promise<JobDto> {
    const response = await http.post<JobDto>('/api/recruiter/jobs', payload);
    return response.data;
  },

  // Handles editing an existing recruiter job posting.
  async updateJob(id: string, payload: RecruiterJobPayload): Promise<JobDto> {
    const response = await http.put<JobDto>(`/api/recruiter/jobs/${id}`, payload);
    return response.data;
  },

  // Handles duplicating an existing job so recruiters can reuse a previous posting as a starting point.
  async duplicateJob(id: string): Promise<JobDto> {
    const response = await http.post<JobDto>(`/api/jobs/${id}/duplicate`);
    return response.data;
  },

  // Handles changing a job status without editing the rest of the job payload.
  async updateJobStatus(id: string, status: string): Promise<JobDto> {
    const response = await http.put<JobDto>(`/api/recruiter/jobs/${id}/status`, { status });
    return response.data;
  },

  // Use to load the paginated recruiter jobs table with its current filters.
  async getRecruiterJobs(params: RecruiterJobsQueryParams): Promise<Paged<JobDto>> {
    const response = await http.get<Paged<JobDto>>('/api/recruiter/jobs', { params });
    return response.data;
  },

  // Use to fetch one recruiter-managed job before showing the job detail or edit screen.
  async getRecruiterJob(id: string): Promise<JobDto> {
    const response = await http.get<JobDto>(`/api/recruiter/jobs/${id}`);
    return response.data;
  },

  // Use to load shortlistable candidates for interview or offer workflows on a specific job.
  async getShortlistedCandidates(jobId: string, department?: string): Promise<ShortlistedCandidateOptionDto[]> {
    const response = await http.get<ShortlistedCandidateOptionDto[]>(`/api/recruiter/jobs/${jobId}/shortlisted-candidates`, {
      params: {
        department: department || undefined,
      },
    });
    return response.data;
  },

  // Handles permanently deleting a recruiter-managed job posting.
  async deleteJob(id: string): Promise<void> {
    await http.delete(`/api/recruiter/jobs/${id}`);
  },

  // Handles publishing a draft or paused job by delegating to the shared status endpoint.
  async publishJob(id: string): Promise<JobDto> {
    return this.updateJobStatus(id, 'Published');
  },

  // Handles closing a live job by delegating to the shared status endpoint.
  async closeJob(id: string): Promise<JobDto> {
    return this.updateJobStatus(id, 'Closed');
  },

  // Use to load the recruiter candidate pipeline, counts, and recommendation data with active filters.
  async getApplicantScores(params: ApplicantScoresQueryParams): Promise<ApplicantScoresDto> {
    const response = await http.get<ApplicantScoresDto>('/api/recruiter/applicants/scores', {
      params,
    });
    return response.data;
  },

  // Use to fetch one candidate application detail by resume submission id.
  async getApplicantBySubmissionId(submissionId: string): Promise<ApplicantDetailDto> {
    const response = await http.get<ApplicantDetailDto>(`/api/recruiter/applicants/scores/${submissionId}`);
    return response.data;
  },

  // Use to request resume download metadata for a candidate under recruiter review.
  async getApplicantResumeDownload(submissionId: string): Promise<ApplicantResumeDownloadDto> {
    const response = await http.get<ApplicantResumeDownloadDto>(`/api/recruiter/applicants/${submissionId}/resume/download`);
    return response.data;
  },

  // Handles bulk candidate stage updates from recruiter candidate management actions.
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

  // Use to fetch the current offer attached to a recruiter-managed candidate submission.
  async getOffer(submissionId: string): Promise<OfferDto | null> {
    const response = await http.get<OfferDto>(`/api/recruiter/applicants/${submissionId}/offer`);
    return response.data;
  },

  // Handles sending an offer package to a shortlisted or interviewed candidate.
  async sendOffer(submissionId: string, payload: SendOfferPayload): Promise<ApplicantScoreItemDto> {
    const response = await http.post<ApplicantScoreItemDto>(
      `/api/recruiter/applicants/${submissionId}/offer`,
      payload,
    );
    return response.data;
  },

  // Handles marking a candidate as hired once the offer workflow is complete.
  async markHired(submissionId: string): Promise<ApplicantScoreItemDto> {
    const response = await http.post<ApplicantScoreItemDto>(
      `/api/recruiter/applicants/${submissionId}/hire`,
    );
    return response.data;
  },

  // Use to load recruiter dashboard filters, KPIs, and trend data for the selected reporting range.
  async getDashboardStats(params: DashboardStatsQueryParams): Promise<DashboardDto> {
    const response = await http.get<DashboardDto>('/api/recruiter/dashboard', { params });
    return response.data;
  },

  // Use to load the paginated hired employees list for the recruiter hiring records screen.
  async getHiredEmployees(params: { page: number; pageSize: number; search?: string }): Promise<Paged<EmployeeRecordDto>> {
    const response = await http.get<Paged<EmployeeRecordDto>>('/api/recruiter/employees', {
      params,
    });
    return response.data;
  },
};
