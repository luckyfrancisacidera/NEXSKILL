import { redirect, type ActionFunctionArgs } from "react-router-dom";
import {
  createId,
  getRecruiterState,
  runAutomations,
  saveRecruiterState,
} from "@features/recruiter/data/storage";
import type { InterviewStatus } from "@features/recruiter/types";
import {
  getApiErrorMessage,
  getString,
} from "@features/recruiter/actions/utils";

/**
 * upsertInterviewAction
 *
 * Creates and updates recruiter interview schedules while enforcing
 * the existing overlap checks and automation triggers.
 */
export const upsertInterviewAction = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const state = getRecruiterState();
    const interviewId = params.interviewId ?? createId("int");
    const existing = state.interviews.find((item) => item.id === interviewId);
    const interviewer = getString(formData, "interviewer");
    const candidateId = getString(formData, "candidateId");
    const jobId = getString(formData, "jobId");
    const startsAt = new Date(getString(formData, "startsAt")).toISOString();
    const durationMinutes =
      Number(getString(formData, "durationMinutes")) ||
      state.settings.defaultInterviewDuration;
    const location = getString(formData, "location");
    const status = getString(formData, "status") as InterviewStatus;
    const startMs = new Date(startsAt).getTime();
    const endMs = startMs + durationMinutes * 60 * 1000;

    const overlap = state.interviews.some((item) => {
      if (
        item.interviewer !== interviewer ||
        item.status === "Canceled" ||
        item.id === interviewId
      ) {
        return false;
      }

      const itemStart = new Date(item.startsAt).getTime();
      const itemEnd = itemStart + item.durationMinutes * 60 * 1000;
      return startMs < itemEnd && itemStart < endMs;
    });

    if (overlap) {
      return {
        error: "Scheduling conflict: interviewer already has overlapping interview.",
      };
    }

    const payload = {
      id: interviewId,
      interviewer,
      candidateId,
      jobId,
      startsAt,
      durationMinutes,
      location,
      status,
      cancelReason: getString(formData, "cancelReason") || undefined,
      updatedAt: new Date().toISOString(),
    };

    state.interviews = existing
      ? state.interviews.map((item) => (item.id === interviewId ? payload : item))
      : [payload, ...state.interviews];

    if (!existing && status === "Scheduled") {
      runAutomations(state, {
        trigger: "interview.scheduled",
        candidateId,
        jobId,
        interviewDate: new Date(startsAt).toLocaleString(),
      });
    }

    if (existing && status === "Scheduled") {
      runAutomations(state, {
        trigger: "interview.rescheduled",
        candidateId,
        jobId,
        interviewDate: new Date(startsAt).toLocaleString(),
      });
    }

    saveRecruiterState(state);
    return redirect("/recruiter/interviews");
  } catch (error) {
    console.error("[Recruiter] Interview upsert failed", error);
    return {
      error: getApiErrorMessage(
        error,
        "Unable to save the interview right now.",
      ),
    };
  }
};
