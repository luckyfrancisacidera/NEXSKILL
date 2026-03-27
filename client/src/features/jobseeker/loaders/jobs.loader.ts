import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
import type { JobsLoaderData } from "@features/jobseeker/types";
import {
  rethrowAsRouteError,
} from "@features/jobseeker/loaders/loader.utils";

export const jobsLoader = async (): Promise<JobsLoaderData> => {
  try {
    const [jobs, savedJobs] = await Promise.all([
      jobseekerService.getAllPublicJobs(),
      jobseekerService.getSavedJobs(),
    ]);

    const savedJobIds = new Set(savedJobs.map((job) => String(job.id)));

    return {
      pageNumber: 1,
      pageSize: jobs.length,
      totalCount: jobs.length,
      totalPages: jobs.length > 0 ? 1 : 0,
      items: jobs.map((job) => ({
        ...job,
        is_saved: savedJobIds.has(String(job.id)),
      })),
    } satisfies JobsLoaderData;
  } catch (error) {
    return rethrowAsRouteError(error, "Unable to load jobs.");
  }
};
