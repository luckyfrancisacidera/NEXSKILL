import { getRecruiterState } from "@features/recruiter/data/storage";
import { rethrowAsRouteError } from "@features/recruiter/loaders/utils";

/**
 * automationsLoader
 *
 * Loads recruiter automation rules, audit history, and outbox data
 * for automation management screens.
 */
export const recruiterAutomationsLoader = async () => {
  try {
    const state = getRecruiterState();
    return {
      rules: state.automations,
      auditLog: state.auditLog,
      outbox: state.outbox,
      jobs: state.jobs,
    };
  } catch (error) {
    rethrowAsRouteError(error, "Unable to load automations.");
  }
};
