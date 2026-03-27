export type CandidateStage =
  | 'Applied'
  | 'Recommended'
  | 'Shortlisted'
  | 'Interview'
  | 'Offer'
  | 'Hired'
  | 'Rejected';

export type JobSeekerStage = 'Applied' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';

export type OfferStatus = 'Pending' | 'Accepted' | 'Declined' | 'Expired' | 'Cancelled';

export interface OfferDto {
  id: string;
  application_id: string;
  sent_by_user_id: string;
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
  status: OfferStatus;
  sent_at_utc: string;
  responded_at_utc?: string | null;
  created_at_utc: string;
  updated_at_utc: string;
  can_accept: boolean;
  can_decline: boolean;
  can_mark_hired: boolean;
}

export interface RecruiterCandidate {
  id: string;
  name: string;
  email: string;
  jobId: string;
  stage: CandidateStage;
  score: number;
  notes: string;
  attachments: string[];
  lastActivityAt: string;
}

export interface ApplicantScoreItemDto {
  resume_submission_id: string;
  jobseeker_user_id?: string;
  applicant_name: string;
  applicant_email: string;
  job_id: string;
  job_title: string;
  score: number;
  submission_status: CandidateStage;
  jobseeker_stage: JobSeekerStage;
  created_at_utc: string;
  has_resume: boolean;
  resume_file_name?: string;
  offer?: OfferDto | null;
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

export interface CandidateExplanationDto {
  provider: string;
  model: string;
  summary?: string;
  strengths: string[];
  gaps: string[];
  risks?: string[];
  recommendation?: string;
  explanation_text: string;
  generated_at_utc?: string;
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
  candidate_explanation?: CandidateExplanationDto;
  latest_interview?: {
    id: string;
    scheduled_date_time_utc: string;
    status: import("@features/recruiter/types/interview.types").InterviewStatus;
  } | null;
}

export interface ApplicantResumeDownloadDto {
  download_url: string;
  file_name: string;
}

export interface ApplicantJobFilterOption {
  id: string;
  title: string;
  department: string;
  all_applicants: number;
  recommended: number;
  shortlisted: number;
  interview: number;
  offer: number;
  hired: number;
}

export interface ApplicantStageCounts {
  all_applicants: number;
  recommended: number;
  shortlisted: number;
  interview: number;
  offer: number;
  hired: number;
}

export interface ApplicantRecommendationDto {
  top_percent: number;
}

export interface ApplicantScoresDto {
  items: ApplicantScoreItemDto[];
  page_number: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  jobs: ApplicantJobFilterOption[];
  departments: string[];
  counts: ApplicantStageCounts;
  recommendation: ApplicantRecommendationDto;
}

export interface BulkApplicantStageResultItemDto {
  submission_id: string;
  success: boolean;
  message: string;
  previous_stage?: CandidateStage;
  new_status?: CandidateStage;
  candidate?: ApplicantScoreItemDto;
}

export interface BulkApplicantStageResponseDto {
  action: string;
  requested_count: number;
  processed_count: number;
  success_count: number;
  failure_count: number;
  results: BulkApplicantStageResultItemDto[];
  counts?: ApplicantStageCounts;
}

export interface CandidateFilters {
  search: string;
  stage: string;
  jobId: string;
  department: string;
  recommendedTopPercent: string;
  pageSize: string;
}

export interface CandidatePagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CandidatesLoaderData {
  candidates: ApplicantScoreItemDto[];
  jobs: ApplicantJobFilterOption[];
  departments: string[];
  counts: ApplicantStageCounts;
  recommendation: ApplicantRecommendationDto;
  pagination: CandidatePagination;
  filters: CandidateFilters;
}

export interface EmployeeRecordDto {
  resume_submission_id: string;
  job_id: string;
  jobseeker_user_id?: string;
  hired_by_recruiter_id?: string;
  accepted_offer_id?: string;
  employee_name: string;
  employee_email: string;
  recruiter_name: string;
  recruiter_email?: string | null;
  job_title: string;
  department: string;
  offer_title?: string | null;
  offer_salary_text?: string | null;
  hire_date_utc: string;
}

export interface HiredEmployeesLoaderData {
  employees: EmployeeRecordDto[];
  pagination: CandidatePagination;
  filters: {
    search: string;
    pageSize: string;
  };
}

export interface CandidateBulkAction {
  action: string;
  status?: CandidateStage;
  label: string;
  title: string;
  message: string;
  accent: 'red' | 'green' | 'violet';
  eligibleIds?: string[];
  skippedCount?: number;
  disabled?: boolean;
}

export interface CandidateDetailAction {
  action: string;
  status?: CandidateStage;
  label: string;
  title: string;
  message: (name: string) => string;
  accent: 'red' | 'green' | 'violet';
}
