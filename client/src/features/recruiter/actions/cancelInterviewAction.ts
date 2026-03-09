import type { ActionFunctionArgs } from "react-router-dom";
import {
  getRecruiterState,
  saveRecruiterState,
} from "@features/recruiter/data/storage";
import {
  getApiErrorMessage,
  getString,
} from "@features/recruiter/actions/utils";

/**
 * cancelInterviewAction
 *
 * Cancels a scheduled interview and stores the recruiter-provided
 * cancellation reason in local recruiter state.
 */
export const cancelInterviewAction = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const reason = getString(formData, "cancelReason");
    const state = getRecruiterState();

    state.interviews = state.interviews.map((item) =>
      item.id === params.interviewId
        ? {
            ...item,
            status: "Canceled",
            cancelReason: reason,
            updatedAt: new Date().toISOString(),
          }
        : item,
    );

    saveRecruiterState(state);
    return null;
  } catch (error) {
    console.error("[Recruiter] Interview cancellation failed", error);
    return {
      error: getApiErrorMessage(
        error,
        "Unable to cancel the interview right now.",
      ),
    };
  }
};
