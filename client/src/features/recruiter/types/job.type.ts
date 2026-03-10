export type JobStatus = 'Draft' | 'Published' | 'Closed';

export type EmploymentType =
  | 'Full-Time'
  | 'Part-Time'
  | 'Contract'
  | 'Internship';

export interface JobDescriptionSections {
  overview: string[];
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

export interface RecruiterJob {
  id: string;
  title: string;
  department: string;
  location: string;
  type: EmploymentType;
  status: JobStatus;
  salaryMin?: number;
  salaryMax?: number;
  tags: string[];
  description: JobDescriptionSections;
  updatedAt: string;
  createdAt: string;
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

export interface RecruiterProfileDto {
  company_name?: string;
  company_email?: string;
  is_complete: boolean;
}

export interface JobListItem {
  id: string;
  title: string;
  department?: string;
  location: string;
  employment_type: string;
  status: string;
}

export interface JobListFilters {
  search: string;
  department?: string;
}

export interface JobListOptions {
  departments: string[];
}

export interface RecruiterJobsLoaderData {
  jobs: JobListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: JobListFilters;
  candidates: [];
  options: JobListOptions & {
    locations: string[];
    types: string[];
  };
}

export interface JobApplicantListItem {
  id: string;
  name: string;
  stage: string;
}

export interface JobTrendPoint {
  day: string;
  applications: number;
}

export interface RecruiterJobDetailLoaderData {
  job: JobDto;
  applicants: JobApplicantListItem[];
  trend: JobTrendPoint[];
}
