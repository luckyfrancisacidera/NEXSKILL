import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { recruiterService } from "@features/recruiter/service/recruiter.service";
import { ApiError } from "@shared/api/http";
import {
  getApiErrorMessage,
} from "@features/recruiter/actions/utils";
import { getJobPayload } from "@features/recruiter/actions/jobPayload";
import { publishRecruiterJobMutation, toJobListItem } from "@features/recruiter/utils/jobMutationSync";

/**
 * createJobAction
 *
 * Handles recruiter job creation submissions.
 * The action maps form data into the existing job payload shape
 * and redirects to the newly created job on success.
 */
export const createJobAction = async ({
  request,
}: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const payload = getJobPayload(formData);

    console.info("[Recruiter] Save clicked", {
      mode: "create",
      payload,
    });

    const job = await recruiterService.createJob(payload);
    publishRecruiterJobMutation({ type: "created", jobId: job.id, job: toJobListItem(job) });

    return redirect(`/recruiter/job-posts/${job.id}?toast=created`);
  } catch (error) {
    console.error("[Recruiter] Save failed", error);

    if (error instanceof ApiError && error.status === 401) {
      return redirect("/login");
    }

    return {
      error: getApiErrorMessage(
        error,
        "Unable to save job right now. Please try again.",
      ),
    };
  }
};
