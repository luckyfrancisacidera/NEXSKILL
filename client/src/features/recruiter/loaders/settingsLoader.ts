import { getRecruiterState } from "@features/recruiter/data/storage";
import { rethrowAsRouteError } from "@features/recruiter/loaders/utils";

/**
 * settingsLoader
 *
 * Loads recruiter settings so the settings route can render the
 * current scheduling and calendar preferences.
 */
export const recruiterSettingsLoader = async () => {
  try {
    const state = getRecruiterState();
    return { settings: state.settings };
  } catch (error) {
    rethrowAsRouteError(error, "Unable to load recruiter settings.");
  }
};
