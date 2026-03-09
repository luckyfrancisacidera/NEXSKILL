import type { ActionFunctionArgs } from "react-router-dom";
import {
  getRecruiterState,
  saveRecruiterState,
} from "@features/recruiter/data/storage";
import type { DayHours } from "@features/recruiter/types";
import {
  getApiErrorMessage,
  getString,
} from "@features/recruiter/actions/utils";

/**
 * updateRecruiterSettingsAction
 *
 * Persists recruiter scheduling preferences and calendar connection
 * settings used by interview workflows.
 */
export const updateRecruiterSettingsAction = async ({
  request,
}: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const state = getRecruiterState();
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    state.settings = {
      timezone: getString(formData, "timezone"),
      defaultInterviewDuration:
        Number(getString(formData, "defaultInterviewDuration")) || 60,
      bufferBefore: Number(getString(formData, "bufferBefore")) || 15,
      bufferAfter: Number(getString(formData, "bufferAfter")) || 15,
      calendarConnections: {
        google: formData.get("google") === "on",
        outlook: formData.get("outlook") === "on",
      },
      hoursByDay: days.reduce<Record<string, DayHours>>((acc, day) => {
        acc[day] = {
          enabled: formData.get(`${day}-enabled`) === "on",
          start: getString(formData, `${day}-start`) || "09:00",
          end: getString(formData, `${day}-end`) || "17:00",
        };
        return acc;
      }, {}),
    };

    saveRecruiterState(state);
    return null;
  } catch (error) {
    console.error("[Recruiter] Settings update failed", error);
    return {
      error: getApiErrorMessage(
        error,
        "Unable to update recruiter settings right now.",
      ),
    };
  }
};
