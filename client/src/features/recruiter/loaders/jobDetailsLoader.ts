import type { LoaderFunctionArgs } from "react-router-dom";
import { recruiterService } from "@features/recruiter/service/recruiter.service";
import { rethrowAsRouteError } from "@features/recruiter/loaders/utils";

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
