import type { ActionFunctionArgs } from "react-router-dom";
import {
  getApiErrorMessage,
  getString,
} from "@features/recruiter/actions/utils";
import { recruiterService } from "@features/recruiter/service/recruiter.service";

/**
 * updateCandidateAction
 *
 * Updates recruiter candidate stages for both single-candidate
 * and bulk selection workflows.
 */
export const updateCandidateAction = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const intent = getString(formData, "intent");
    const status = getString(formData, "status");
    const action = getString(formData, "action");
    const payload = {
      action: action || undefined,
      status: status || undefined,
    };

    const resumeSubmissionId = params.candidateId;

    if (intent === "stage" && resumeSubmissionId) {
      const result = await recruiterService.updateApplicantStatuses(
        [resumeSubmissionId],
        payload,
      );
      return { result };
    }

    if (intent === "bulk-stage") {
      const selectedIds = getString(formData, "selectedIds")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (selectedIds.length > 0) {
        const result = await recruiterService.updateApplicantStatuses(
          selectedIds,
          payload,
        );
        return { result };
      }
    }

    return null;
  } catch (error) {
    console.error("[Recruiter] Candidate stage update failed", error);
    return {
      error: getApiErrorMessage(
        error,
        "Unable to update candidate stage right now.",
      ),
    };
  }
};
