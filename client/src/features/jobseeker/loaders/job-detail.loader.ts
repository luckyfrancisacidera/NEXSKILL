import type { LoaderFunctionArgs } from "react-router-dom";
import { jobseekerService } from "@features/jobseeker/services/jobseeker.service";
import type { JobDetailLoaderData } from "@features/jobseeker/types";
import { rethrowAsRouteError } from "@features/jobseeker/loaders/loader.utils";

// Use to preload a public job detail route once the job id is known from navigation.
export const jobDetailLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<JobDetailLoaderData> => {
  try {
    if (!params.jobId) {
      throw new Response("Not found", { status: 404 });
    }

    return await jobseekerService.getJobDetail(params.jobId);
  } catch (error) {
    return rethrowAsRouteError(error, "Unable to load job details.");
  }
};
