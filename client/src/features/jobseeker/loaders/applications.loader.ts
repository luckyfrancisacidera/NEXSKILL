import type { LoaderFunctionArgs } from "react-router-dom";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
import type {
  ApplicationsLoaderData,
  JobseekerApplicationsQueryParams,
} from "@features/jobseeker/types";
import {
  getPositiveNumber,
  rethrowAsRouteError,
} from "@features/jobseeker/loaders/loader.utils";

export const applicationsLoader = async ({
  request,
}: LoaderFunctionArgs): Promise<ApplicationsLoaderData> => {
  try {
    const url = new URL(request.url);
    const params: JobseekerApplicationsQueryParams = {
      pageNumber: getPositiveNumber(url.searchParams.get("page"), 1),
      pageSize: getPositiveNumber(url.searchParams.get("pageSize"), 10),
      search: url.searchParams.get("search") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
    };

    return await jobseekerService.getMyApplications(params);
  } catch (error) {
    return rethrowAsRouteError(error, "Unable to load applications.");
  }
};
