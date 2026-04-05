import type { LoaderFunctionArgs } from "react-router-dom";
import { recruiterInterviewService } from "@features/recruiter/services/interview.service";
import { rethrowAsRouteError } from "@features/recruiter/loaders/utils";

// Use to preload a single recruiter interview detail view from the route param.
export const recruiterInterviewDetailLoader = async ({
  params,
}: LoaderFunctionArgs) => {
  try {
    if (!params.interviewId) {
      throw new Response("Interview not found", { status: 404 });
    }

    const interview = await recruiterInterviewService.getRecruiterInterview(
      params.interviewId,
    );

    return {
      interviews: [interview],
    };
  } catch (error) {
    rethrowAsRouteError(error, "Unable to load interview details.");
  }
};
