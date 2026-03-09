import type { ActionFunctionArgs } from "react-router-dom";
import {
  getRecruiterState,
  runAutomations,
  saveRecruiterState,
} from "@features/recruiter/data/storage";
import {
  getApiErrorMessage,
  getString,
} from "@features/recruiter/actions/utils";

/**
 * runOfferAutomationAction
 *
 * Triggers offer-related recruiter automations for the selected
 * candidate and job context.
 */
export const runOfferAutomationAction = async ({
  request,
}: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const state = getRecruiterState();

    runAutomations(state, {
      trigger: "offer.sent",
      candidateId: getString(formData, "candidateId") || undefined,
      jobId: getString(formData, "jobId") || undefined,
    });

    saveRecruiterState(state);
    return null;
  } catch (error) {
    console.error("[Recruiter] Offer automation failed", error);
    return {
      error: getApiErrorMessage(
        error,
        "Unable to run offer automations right now.",
      ),
    };
  }
};
