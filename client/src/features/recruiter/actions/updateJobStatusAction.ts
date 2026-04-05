import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { recruiterService } from "@features/recruiter/services/recruiter.service";
import { ApiError } from "@shared/api/http";
import {
  getApiErrorMessage,
  getString,
} from "@features/recruiter/actions/utils";
import { publishRecruiterJobMutation, toJobListItem } from "@features/recruiter/utils/jobMutationSync";

// Handles quick status changes from recruiter job management screens.
export const updateJobStatusAction = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  if (!params.jobId) {
    return null;
  }

  try {
    const formData = await request.formData();
    const status = getString(formData, "status");

    if (!status) {
      return null;
    }

    const job = await recruiterService.updateJobStatus(params.jobId, status);
    publishRecruiterJobMutation({ type: "status_updated", jobId: job.id, job: toJobListItem(job) });
    return { job };
  } catch (error) {
    console.error("[Recruiter] Status update failed", error);

    if (error instanceof ApiError && error.status === 401) {
      return redirect("/login");
    }

    return {
      error: getApiErrorMessage(
        error,
        "Unable to update the job status right now.",
      ),
    };
  }
};
