import type { LoaderFunctionArgs } from "react-router-dom";
import { recruiterService } from "@features/recruiter/service/recruiter.service";
import { rethrowAsRouteError } from "@features/recruiter/loaders/utils";

/**
 * jobDetailsLoader
 *
 * Loads a single recruiter-managed job and prepares the
 * detail data required by job detail and edit routes.
 */
export const recruiterJobDetailLoader = async ({
  params,
}: LoaderFunctionArgs) => {
  try {
    if (!params.jobId) {
      throw new Response("Job not found", { status: 404 });
    }

    const job = await recruiterService.getRecruiterJob(params.jobId);
    return { job, applicants: [], trend: [] };
  } catch (error) {
    rethrowAsRouteError(error, "Unable to load job details.");
  }
};
