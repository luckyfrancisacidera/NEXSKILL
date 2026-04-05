import type { ActionFunctionArgs } from "react-router-dom";
import { jobseekerService } from "@features/jobseeker/services/jobseeker.service";
import {
  getApiErrorMessage,
  getString,
} from "@features/jobseeker/actions/action.utils";

// Handles save and unsave actions from job cards and job detail views.
export const saveJobAction = async ({
  request,
  params,
}: ActionFunctionArgs): Promise<{ error?: string; ok?: boolean } | null> => {
  if (!params.jobId) {
    return null;
  }

  try {
    const formData = await request.formData();
    const intent = getString(formData, "intent");

    if (intent === "remove-saved-job") {
      await jobseekerService.removeSavedJob(params.jobId);
    } else {
      await jobseekerService.saveJob(params.jobId);
    }

    return { ok: true };
  } catch (error) {
    return {
      error: getApiErrorMessage(
        error,
        "Unable to update saved jobs right now.",
      ),
    };
  }
};
