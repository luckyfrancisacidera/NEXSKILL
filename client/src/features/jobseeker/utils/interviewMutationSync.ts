import type { JobseekerInterview } from "@features/jobseeker/types";

const INTERVIEW_MUTATION_EVENT_NAME = "jobseeker:interviews:mutation";
const INTERVIEW_MUTATION_STORAGE_KEY = "jobseeker.interviews.latestMutation";
const INTERVIEW_MUTATION_TTL_MS = 5 * 60 * 1000;

export type JobseekerInterviewMutationType = "archived" | "unarchived";

export interface JobseekerInterviewMutationPayload {
  mutationId: string;
  type: JobseekerInterviewMutationType;
  occurredAt: number;
  interviewId: string;
  interview: JobseekerInterview;
}

const isBrowser = () => typeof window !== "undefined" && typeof sessionStorage !== "undefined";

// Publishes interview archive changes so separate jobseeker routes can refresh without a full reload.
export const publishJobseekerInterviewMutation = (
  payload: Omit<JobseekerInterviewMutationPayload, "mutationId" | "occurredAt" | "interviewId"> & {
    interview: JobseekerInterview;
  },
) => {
  if (!isBrowser()) {
    return;
  }

  const mutation: JobseekerInterviewMutationPayload = {
    ...payload,
    interviewId: payload.interview.id,
    mutationId: `${payload.type}:${payload.interview.id}:${Date.now()}`,
    occurredAt: Date.now(),
  };

  sessionStorage.setItem(INTERVIEW_MUTATION_STORAGE_KEY, JSON.stringify(mutation));
  window.dispatchEvent(new CustomEvent<JobseekerInterviewMutationPayload>(INTERVIEW_MUTATION_EVENT_NAME, { detail: mutation }));
};

// Use to recover the latest interview mutation after navigation within the TTL window.
export const readLatestJobseekerInterviewMutation = (): JobseekerInterviewMutationPayload | null => {
  if (!isBrowser()) {
    return null;
  }

  const raw = sessionStorage.getItem(INTERVIEW_MUTATION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const mutation = JSON.parse(raw) as JobseekerInterviewMutationPayload;
    if (!mutation?.mutationId || Date.now() - mutation.occurredAt > INTERVIEW_MUTATION_TTL_MS) {
      return null;
    }

    return mutation;
  } catch {
    return null;
  }
};

// Use to react to cross-screen interview archive mutations while the user stays in the app shell.
export const subscribeJobseekerInterviewMutations = (
  handler: (payload: JobseekerInterviewMutationPayload) => void,
) => {
  if (!isBrowser()) {
    return () => undefined;
  }

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<JobseekerInterviewMutationPayload>;
    handler(customEvent.detail);
  };

  window.addEventListener(INTERVIEW_MUTATION_EVENT_NAME, listener);
  return () => window.removeEventListener(INTERVIEW_MUTATION_EVENT_NAME, listener);
};
