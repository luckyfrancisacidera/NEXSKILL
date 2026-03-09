import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { recruiterService } from "@features/recruiter/service/recruiter.service";
import { ApiError } from "@shared/api/http";
import { getApiErrorMessage } from "@features/recruiter/actions/utils";

/**
 * deleteJobAction
 *
 * Removes a recruiter-managed job posting and returns the user
 * to the job posts listing after the mutation completes.
 */
export const deleteJobAction = async ({ params }: ActionFunctionArgs) => {
  if (!params.jobId) {
    return null;
  }

  try {
    await recruiterService.deleteJob(params.jobId);
    return redirect("/recruiter/job-posts");
  } catch (error) {
    console.error("[Recruiter] Delete failed", error);

    if (error instanceof ApiError && error.status === 401) {
      return redirect("/login");
    }

    return {
      error: getApiErrorMessage(
        error,
        "Unable to delete this job right now. Please try again.",
      ),
    };
  }
};
