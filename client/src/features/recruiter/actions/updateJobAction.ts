import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { createJobAction } from "@features/recruiter/actions/createJobAction";
import { recruiterService } from "@features/recruiter/service/recruiter.service";
import { ApiError } from "@shared/api/http";
import {
  getApiErrorMessage,
} from "@features/recruiter/actions/utils";
import { getJobPayload } from "@features/recruiter/actions/jobPayload";

/**
 * updateJobAction
 *
 * Handles recruiter job updates for existing listings.
 * Keeping edit behavior in its own action makes job mutations
 * easier to follow as the recruiter feature grows.
 */
export const updateJobAction = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  if (!params.jobId) {
    return null;
  }

  try {
    const formData = await request.formData();
    const payload = getJobPayload(formData);

    console.info("[Recruiter] Save clicked", {
      mode: "edit",
      payload,
    });

    const job = await recruiterService.updateJob(params.jobId, payload);

    return redirect(`/recruiter/job-posts?toast=updated&updatedJobId=${job.id}`);
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

/**
 * upsertJobAction
 *
 * Preserves the existing route contract for create and edit job routes
 * while delegating to the action specialized for the current workflow.
 */
export const upsertJobAction = async (args: ActionFunctionArgs) =>
  args.params.jobId ? updateJobAction(args) : createJobAction(args);
