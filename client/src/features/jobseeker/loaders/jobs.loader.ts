import type { LoaderFunctionArgs } from "react-router-dom";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
import type { JobsLoaderData } from "@features/jobseeker/types";
import {
  getPositiveNumber,
  rethrowAsRouteError,
} from "@features/jobseeker/loaders/loader.utils";

export const jobsLoader = async ({
  request,
}: LoaderFunctionArgs): Promise<JobsLoaderData> => {
  try {
    const url = new URL(request.url);
    const pageNumber = getPositiveNumber(url.searchParams.get("page"), 1);
    const pageSize = getPositiveNumber(url.searchParams.get("pageSize"), 10);
    const search = url.searchParams.get("search") ?? undefined;

    const [jobs, savedJobs] = await Promise.all([
      jobseekerService.getPublicJobs({
        pageNumber,
        pageSize,
        search,
      }),
      jobseekerService.getSavedJobs(),
    ]);

    const savedJobIds = new Set(savedJobs.map((job) => String(job.id)));

    return {
      ...jobs,
      items: jobs.items.map((job) => ({
        ...job,
        is_saved: savedJobIds.has(String(job.id)),
      })),
    } satisfies JobsLoaderData;
  } catch (error) {
    return rethrowAsRouteError(error, "Unable to load jobs.");
  }
};
