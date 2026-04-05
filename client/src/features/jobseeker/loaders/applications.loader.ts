import type { LoaderFunctionArgs } from "react-router-dom";
import { jobseekerService } from "@features/jobseeker/services/jobseeker.service";
import type {
  ApplicationsLoaderData,
  JobseekerApplicationsQueryParams,
} from "@features/jobseeker/types";
import {
  getPositiveNumber,
  rethrowAsRouteError,
} from "@features/jobseeker/loaders/loader.utils";

// Use to preload the applications or archived-applications table before the route renders.
export const applicationsLoader = async ({
  request,
}: LoaderFunctionArgs): Promise<ApplicationsLoaderData> => {
  try {
    const url = new URL(request.url);
    const archivedOnly = url.pathname.endsWith("/archived");
    const params: JobseekerApplicationsQueryParams = {
      pageNumber: getPositiveNumber(url.searchParams.get("page"), 1),
      pageSize: getPositiveNumber(url.searchParams.get("pageSize"), 10),
      search: url.searchParams.get("search") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      archivedOnly,
    };

    return await jobseekerService.getMyApplications(params);
  } catch (error) {
    return rethrowAsRouteError(error, "Unable to load applications.");
  }
};
