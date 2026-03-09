import { getRecruiterState } from "@features/recruiter/data/storage";
import { rethrowAsRouteError } from "@features/recruiter/loaders/utils";

/**
 * interviewsLoader
 *
 * Loads recruiter interview scheduling data and shared interviewer
 * metadata used by interview list and creation routes.
 */
const interviewers = [
  "Jordan Kim",
  "Morgan Diaz",
  "Sam Rivera",
  "Priya Nair",
];

export const recruiterInterviewsLoader = async () => {
  try {
    const state = getRecruiterState();
    return {
      interviews: state.interviews,
      candidates: state.candidates,
      jobs: state.jobs,
      settings: state.settings,
      interviewers,
    };
  } catch (error) {
    rethrowAsRouteError(error, "Unable to load interviews.");
  }
};
