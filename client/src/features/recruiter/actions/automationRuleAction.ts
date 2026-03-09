import type { ActionFunctionArgs } from "react-router-dom";
import {
  createId,
  getRecruiterState,
  saveRecruiterState,
} from "@features/recruiter/data/storage";
import type { CandidateStage } from "@features/recruiter/types";
import {
  getApiErrorMessage,
  getString,
} from "@features/recruiter/actions/utils";

/**
 * automationRuleAction
 *
 * Manages recruiter automation rules, including create, update,
 * toggle, and delete operations.
 */
export const automationRuleAction = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const state = getRecruiterState();
    const intent = getString(formData, "intent");

    if (intent === "delete") {
      state.automations = state.automations.filter(
        (item) => item.id !== params.ruleId,
      );
    } else if (intent === "toggle") {
      state.automations = state.automations.map((item) =>
        item.id === params.ruleId
          ? { ...item, enabled: formData.get("enabled") === "true" }
          : item,
      );
    } else {
      const ruleId = params.ruleId ?? createId("rule");
      const existing = state.automations.find((item) => item.id === ruleId);
      const next = {
        id: ruleId,
        name: getString(formData, "name"),
        enabled: formData.get("enabled") === "true",
        trigger: getString(formData, "trigger") as
          | "candidate.stage_changed"
          | "interview.scheduled"
          | "interview.rescheduled"
          | "offer.sent",
        jobId: getString(formData, "jobId") || undefined,
        fromStage: getString(formData, "fromStage") as CandidateStage,
        toStage: getString(formData, "toStage") as CandidateStage,
        subject: getString(formData, "subject"),
        body: getString(formData, "body"),
        lastRunAt: existing?.lastRunAt,
      };

      state.automations = existing
        ? state.automations.map((item) => (item.id === ruleId ? next : item))
        : [next, ...state.automations];
    }

    saveRecruiterState(state);
    return null;
  } catch (error) {
    console.error("[Recruiter] Automation rule update failed", error);
    return {
      error: getApiErrorMessage(
        error,
        "Unable to update the automation rule right now.",
      ),
    };
  }
};
