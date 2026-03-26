import { normalizeApplicationStatusKey } from "@shared/utils/applicationStatus";

export type JobseekerListAction = "view_job" | "withdraw" | "delete_history";
export type JobseekerActionContext = "applications" | "offers";

const applicationActionsByStatus: Record<string, JobseekerListAction[]> = {
  applied: ["view_job", "withdraw"],
  under_review: ["view_job", "withdraw"],
  shortlisted: ["view_job", "withdraw"],
  interview: ["view_job", "withdraw"],
  offer: ["view_job", "withdraw"],
  hire: ["view_job", "delete_history"],
  withdrawn: ["view_job", "delete_history"],
  rejected: ["view_job"],
};

const offerActionsByStatus: Record<string, JobseekerListAction[]> = {
  withdrawn: ["view_job", "delete_history"],
};

export const getJobseekerListActions = (
  status: string | null | undefined,
  context: JobseekerActionContext,
) => {
  const key = normalizeApplicationStatusKey(status);
  const source = context === "offers" ? offerActionsByStatus : applicationActionsByStatus;
  return key === "unknown" ? ["view_job"] satisfies JobseekerListAction[] : source[key] ?? ["view_job"];
};

export const canDeleteJobseekerHistory = (status: string | null | undefined, context: JobseekerActionContext) =>
  getJobseekerListActions(status, context).includes("delete_history");

export const canWithdrawJobseekerApplication = (status: string | null | undefined) =>
  getJobseekerListActions(status, "applications").includes("withdraw");
