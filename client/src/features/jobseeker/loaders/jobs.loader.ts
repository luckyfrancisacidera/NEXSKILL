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

    return await jobseekerService.getPublicJobs({
      pageNumber,
      pageSize,
      search,
    });
  } catch (error) {
    return rethrowAsRouteError(error, "Unable to load jobs.");
  }
};
