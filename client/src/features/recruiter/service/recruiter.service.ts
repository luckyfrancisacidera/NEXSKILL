import { http } from "@shared/api/http";

export interface RecruiterProfileDto {
  company_name?: string;
  company_email?: string;
  is_complete: boolean;
}
export interface JobDto {
  id: string;
  title: string;
  department?: string;
  benefits?: string;
  salary_min_per_annum?: number;
  salary_max_per_annum?: number;
  currency: string;
  location: string;
  schedule?: string;
  work_setup: string;
  employment_type: string;
  status: string;
  company_name?: string;
  company_email?: string;
  description: string;
  responsibilities: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_level?: string;
  min_years?: number;
  education?: string;
  min_education?: string;
  number_of_vacancies?: number;
  remaining_vacancies?: number;
}
export interface Paged<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ApplicantScoreItemDto {
  resume_submission_id: string;
  applicant_name: string;
  applicant_email: string;
  job_id: string;
  job_title: string;
  score: number;
  submission_status:
    | "Applied"
    | "Recommended"
    | "Shortlisted"
    | "Interview"
    | "Offer"
    | "Hire"
    | "Rejected";  
  jobseeker_stage: "Applied" | "Interview" | "Offer" | "Rejected";
  created_at_utc: string;
}

export interface ParsedResumeProjectDto {
  name?: string;
  bullets?: string[];
  description?: string;
  technologies?: string[];
}

export interface ParsedResumeWorkExperienceDto {
  job_title?: string;
  company?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  bullets?: string[];
  technologies?: string[];
  duration_months?: number;
}

export interface ParsedResumeEducationDto {
  degree?: string;
  institution?: string;
  start_date?: string;
  end_date?: string;
  education_level?: string;
  field_of_study?: string;
}

export interface ParsedResumeCertificationDto {
  name?: string;
  issuer?: string;
  issue_date?: string;
}

export interface ParsedResumeJsonDto {
  personal_info?: {
    full_name?: string;
    email?: string;
    phone?: string;
    location?: string;
    job_target?: string;
  };
  summary?: string[];
  skills?: string[];
  projects?: ParsedResumeProjectDto[];
  work_experience?: ParsedResumeWorkExperienceDto[];
  education?: ParsedResumeEducationDto[];
  certifications?: ParsedResumeCertificationDto[];
  derived?: {
    latest_job_title?: string;
    total_experience_months?: number;
    education_max_level?: string;
    normalized_skills?: string[];
  };
}

export interface ApplicantDetailDto extends ApplicantScoreItemDto {
  parsed_resume_json?: ParsedResumeJsonDto;
}

export interface ApplicantScoresDto {
  items: ApplicantScoreItemDto[];
  page_number: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  jobs: Array<{
    id: string;
    title: string;
    department: string;
    all_applicants: number;
    recommended: number;
    shortlisted: number;
    interview: number;
    offer: number;
    hire: number;
  }>;
  departments: string[];
  counts: {
    all_applicants: number;
    recommended: number;
    shortlisted: number;
    interview: number;
    offer: number;
    hire: number;
  };
  recommendation: {
    top_percent: number;
  };
}

export interface BulkApplicantStageResultItemDto {
  submission_id: string;
  success: boolean;
  message: string;
  new_status?: string;
}

export interface BulkApplicantStageResponseDto {
  action: string;
  requested_count: number;
  processed_count: number;
  success_count: number;
  failure_count: number;
  results: BulkApplicantStageResultItemDto[];
}

export interface DashboardDto {
  filters: { departments: string[]; job_roles: string[]; job_roles_by_department: Record<string, string[]> };
  summary: {
    total_applicants: { value: number; previous_value: number; comparison_percent: number };
    total_shortlisted: { value: number; previous_value: number; comparison_percent: number };
    total_interview: { value: number; previous_value: number; comparison_percent: number };
    total_offer: { value: number; previous_value: number; comparison_percent: number };
    total_hired: { value: number; previous_value: number; comparison_percent: number };
  };
  trends: {
    labels: string[];
    datasets: Array<{ key: string; label: string; data: number[]; border_color: string; background_color: string }>;
  };
}

export const recruiterService = {
  getProfile: async () =>
    (await http.get<RecruiterProfileDto>("/api/recruiter/profile")).data,
  
  updateProfile: async (payload: {
    company_name: string;
    company_email: string;
  }) =>
    (await http.put<RecruiterProfileDto>("/api/recruiter/profile", payload))
      .data,

  createJob: async (payload: Record<string, unknown>) =>
    (await http.post<JobDto>("/api/recruiter/jobs", payload)).data,

  updateJob: async (id: string, payload: Record<string, unknown>) =>
    (await http.put<JobDto>(`/api/recruiter/jobs/${id}`, payload)).data,

  getRecruiterJobs: async (params: {
    pageNumber: number;
    pageSize: number;
    search?: string;
    department?: string;
  }) => (await http.get<Paged<JobDto>>("/api/recruiter/jobs", { params })).data,

  getRecruiterJob: async (id: string) =>
    (await http.get<JobDto>(`/api/recruiter/jobs/${id}`)).data,

  deleteJob: async (id: string) => {
    await http.delete(`/api/recruiter/jobs/${id}`);
  },

  publishJob: async (id: string) => {
    await http.post(`/api/recruiter/jobs/${id}/publish`);
  },

  closeJob: async (id: string) => {
    await http.post(`/api/recruiter/jobs/${id}/close`);
  },

  getApplicantScores: async (params: {
    search?: string;
    stage?: string;
    jobId?: string;
    department?: string;
    recommendedTopPercent?: number;
    pageNumber?: number;
    pageSize?: number;
  }) =>
    (
      await http.get<ApplicantScoresDto>("/api/recruiter/applicants/scores", {
        params,
      })
    ).data,
  
  getApplicantBySubmissionId: async (submissionId: string) =>
    (await http.get<ApplicantScoreItemDto>(`/api/recruiter/applicants/scores/${submissionId}`)).data,

  updateApplicantStatuses: async (
      submissionIds: string[],
      payload: { action?: string; status?: string },
   ) =>
      (await http.put<BulkApplicantStageResponseDto>(`/api/recruiter/applicants/scores/status`, {
        submission_ids: submissionIds,
        ...payload,
      })).data,

 getDashboardStats: async (params: {
    startDate?: string;
    endDate?: string;
    department?: string;
    jobRole?: string;
    groupBy?: 'week' | 'month' | 'year' | 'department' | 'job';
  }) =>
    (await http.get<DashboardDto>("/api/recruiter/dashboard", { params })).data,
};
