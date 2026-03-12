import { recruiterInterviewService } from "@features/recruiter/services/interview.service";
import { rethrowAsRouteError } from "@features/recruiter/loaders/utils";

export const recruiterInterviewsLoader = async () => {
  try {
    const interviews = await recruiterInterviewService.getRecruiterInterviews();
    return { interviews };
  } catch (error) {
    rethrowAsRouteError(error, "Unable to load interviews.");
  }
};
