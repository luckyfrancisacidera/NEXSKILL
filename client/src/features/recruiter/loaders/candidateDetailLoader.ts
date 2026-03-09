import type { LoaderFunctionArgs } from "react-router-dom";
import { recruiterService } from "@features/recruiter/service/recruiter.service";
import { rethrowAsRouteError } from "@features/recruiter/loaders/utils";

/**
 * candidateDetailLoader
 *
 * Loads a single candidate submission record for recruiter review.
 */
export const recruiterCandidateDetailLoader = async ({
  params,
}: LoaderFunctionArgs) => {
  try {
    if (!params.candidateId) {
      throw new Response("Candidate not found", { status: 404 });
    }

    const candidate = await recruiterService.getApplicantBySubmissionId(
      params.candidateId,
    );

    if (!candidate) {
      throw new Response("Candidate not found", { status: 404 });
    }

    return { candidate };
  } catch (error) {
    rethrowAsRouteError(error, "Unable to load candidate details.");
  }
};
