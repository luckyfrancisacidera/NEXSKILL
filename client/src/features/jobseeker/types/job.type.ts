import type { JobDto, Paged } from "@features/recruiter/types";

export type { JobDto, Paged };

export interface JobListItemDto extends JobDto {
  is_saved?: boolean;
}

export interface PublicJobsQueryParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
}

export interface JobsLoaderData extends Omit<Paged<JobDto>, "items"> {
  items: JobListItemDto[];
}

export type JobDetailLoaderData = JobDto;
