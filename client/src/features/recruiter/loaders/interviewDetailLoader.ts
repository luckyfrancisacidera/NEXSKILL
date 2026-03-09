import type { LoaderFunctionArgs } from "react-router-dom";
import { getRecruiterState } from "@features/recruiter/data/storage";
import { rethrowAsRouteError } from "@features/recruiter/loaders/utils";

/**
 * interviewDetailLoader
 *
 * Loads a single interview record together with the surrounding
 * recruiter scheduling context required by the edit route.
 */
const interviewers = [
  "Jordan Kim",
  "Morgan Diaz",
  "Sam Rivera",
  "Priya Nair",
];

export const recruiterInterviewDetailLoader = async ({
  params,
}: LoaderFunctionArgs) => {
  try {
    const state = getRecruiterState();
    const interview = state.interviews.find(
      (item) => item.id === params.interviewId,
    );

    if (!interview) {
      throw new Response("Interview not found", { status: 404 });
    }

    return {
      interview,
      candidates: state.candidates,
      jobs: state.jobs,
      settings: state.settings,
      interviewers,
    };
  } catch (error) {
    rethrowAsRouteError(error, "Unable to load interview details.");
  }
};
