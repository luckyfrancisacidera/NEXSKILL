import type { ActionFunctionArgs } from "react-router-dom";
import { jobseekerService } from "@features/jobseeker/services/jobseeker.service";
import { getApiErrorMessage } from "@features/jobseeker/actions/action.utils";

// Handles the jobseeker action for withdrawing an existing application.
export const withdrawApplicationAction = async ({
  params,
}: ActionFunctionArgs): Promise<{ error?: string; ok?: boolean } | null> => {
  if (!params.applicationId) {
    return null;
  }

  try {
    await jobseekerService.withdrawApplication(params.applicationId);
    return { ok: true };
  } catch (error) {
    return {
      error: getApiErrorMessage(
        error,
        "Unable to withdraw application right now.",
      ),
    };
  }
};
