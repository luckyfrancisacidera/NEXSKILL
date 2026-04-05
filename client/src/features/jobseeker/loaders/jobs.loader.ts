import { jobseekerService } from "@features/jobseeker/services/jobseeker.service";
import type { JobsLoaderData } from "@features/jobseeker/types";
import {
  rethrowAsRouteError,
} from "@features/jobseeker/loaders/loader.utils";

// Use to preload the public jobs feed and mark which listings are already saved for the viewer.
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
