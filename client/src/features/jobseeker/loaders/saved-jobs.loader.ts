import type { LoaderFunctionArgs } from "react-router-dom";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
import type { SavedJobsLoaderData } from "@features/jobseeker/types";
import { rethrowAsRouteError } from "@features/jobseeker/loaders/loader.utils";

export const savedJobsLoader = async ({
  request,
}: LoaderFunctionArgs): Promise<SavedJobsLoaderData> => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") ?? undefined;

    return await jobseekerService.getSavedJobs(search);
  } catch (error) {
    return rethrowAsRouteError(error, "Unable to load saved jobs.");
  }
};
