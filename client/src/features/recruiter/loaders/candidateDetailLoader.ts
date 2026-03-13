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
    const resumeSubmissionId = params.candidateId;

    if (!resumeSubmissionId) {
      throw new Response("Candidate not found", { status: 404 });
    }

    // The route stays submission-based for recruiter review.
    // Interview scheduling resolves the linked jobseeker identity from the API payload.
    const candidate = await recruiterService.getApplicantBySubmissionId(
      resumeSubmissionId,
    );

    if (!candidate) {
      throw new Response("Candidate not found", { status: 404 });
    }

    return { candidate };
  } catch (error) {
    rethrowAsRouteError(error, "Unable to load candidate details.");
  }
};
