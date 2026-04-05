import type { LoaderFunctionArgs } from "react-router-dom";
import { jobseekerInterviewService } from "@features/jobseeker/services/interview.service";
import type { JobseekerArchivedInterviewsLoaderData } from "@features/jobseeker/types";
import {
  getPositiveNumber,
  rethrowAsRouteError,
} from "@features/jobseeker/loaders/loader.utils";

// Use to preload the archived interviews page with the current route filters.
export const archivedInterviewsLoader = async ({
  request,
}: LoaderFunctionArgs): Promise<JobseekerArchivedInterviewsLoaderData> => {
  try {
    const url = new URL(request.url);

    return await jobseekerInterviewService.getArchivedJobseekerInterviewsPage({
      pageNumber: getPositiveNumber(url.searchParams.get("page"), 1),
      pageSize: getPositiveNumber(url.searchParams.get("pageSize"), 10),
      search: url.searchParams.get("search") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
    });
  } catch (error) {
    return rethrowAsRouteError(error, "Unable to load archived interviews.");
  }
};
