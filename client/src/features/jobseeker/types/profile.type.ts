import type { SavedJobDto } from "@features/jobseeker/types/dashboard.type";

export interface JobseekerProfileDto {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  professional_title?: string;
  skills?: string;
  bio?: string;
  experience_summary?: string;
  resume_url?: string;
  avatar_url?: string;
}

export interface JobseekerProfileUpdatePayload {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  professional_title?: string;
  skills?: string;
  bio?: string;
  experience_summary?: string;
  resume_url?: string;
  avatar_url?: string;
}

export type ProfileLoaderData = JobseekerProfileDto;
export type SavedJobsLoaderData = SavedJobDto[];
