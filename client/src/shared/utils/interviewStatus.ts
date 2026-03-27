export type DisplayInterviewStatus =
  | "Pending"
  | "Accepted"
  | "Declined"
  | "RescheduleRequested"
  | "Rescheduled"
  | "Cancelled"
  | "Completed";

export const interviewStatusChipClassName: Record<DisplayInterviewStatus, string> = {
  Pending:
    "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80 dark:bg-slate-900/40 dark:text-slate-200 dark:ring-slate-800",
  Accepted:
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-900/70",
  Declined:
    "bg-rose-50 text-rose-700 ring-1 ring-rose-200/70 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-900/70",
  RescheduleRequested:
    "bg-amber-50 text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-900/70",
  Rescheduled:
    "bg-amber-50 text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-900/70",
  Cancelled:
    "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200/80 dark:bg-zinc-900/50 dark:text-zinc-300 dark:ring-zinc-800",
  Completed:
    "bg-blue-50 text-blue-700 ring-1 ring-blue-200/70 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-900/70",
};


export const interviewStatusCalendarPillClassName: Record<DisplayInterviewStatus, string> = {
  Pending: "bg-slate-100 text-slate-700",
  Accepted: "bg-emerald-50 text-emerald-700",
  Declined: "bg-rose-50 text-rose-700",
  RescheduleRequested: "bg-amber-50 text-amber-700",
  Rescheduled: "bg-amber-50 text-amber-700",
  Cancelled: "bg-zinc-100 text-zinc-600",
  Completed: "bg-blue-50 text-blue-700",
};

export const isTerminalInterviewStatus = (status: DisplayInterviewStatus) =>
  status === "Declined" || status === "Cancelled" || status === "Completed";
