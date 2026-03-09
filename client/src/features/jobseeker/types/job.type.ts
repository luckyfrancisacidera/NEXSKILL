/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { JobDto, Paged } from "@features/recruiter/types";

export type { JobDto, Paged };

export interface PublicJobsQueryParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
}

export interface JobsLoaderData extends Paged<JobDto> {}

export type JobDetailLoaderData = JobDto;
