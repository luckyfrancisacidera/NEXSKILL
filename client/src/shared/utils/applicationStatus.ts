export type ApplicationStatusKey =
  | "applied"
  | "under_review"
  | "recommended"
  | "shortlisted"
  | "interview"
  | "offer"
  | "hire"
  | "rejected"
  | "withdrawn"
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "scheduled"
  | "completed"
  | "cancelled"
  | "unknown";

type ApplicationStatusAppearance = {
  label: string;
  badgeClassName: string;
  accentClassName: string;
};

const applicationStatusConfig: Record<
  Exclude<ApplicationStatusKey, "unknown">,
  ApplicationStatusAppearance
> = {
  applied: {
    label: "Applied",
    badgeClassName:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300",
    accentClassName:
      "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  },
  under_review: {
    label: "Under Review",
    badgeClassName:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300",
    accentClassName:
      "bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300",
  },
  recommended: {
    label: "Recommended",
    badgeClassName:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/30 dark:text-indigo-300",
    accentClassName:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  },
  shortlisted: {
    label: "Shortlisted",
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
    accentClassName:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  interview: {
    label: "Interview",
    badgeClassName:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-300",
    accentClassName:
      "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  },
  offer: {
    label: "Offer",
    badgeClassName:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
    accentClassName:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  },
  hire: {
    label: "Hired",
    badgeClassName:
      "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-300",
    accentClassName:
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300",
  },
  rejected: {
    label: "Rejected",
    badgeClassName:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300",
    accentClassName:
      "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  },
  withdrawn: {
    label: "Withdrawn",
    badgeClassName:
      "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    accentClassName:
      "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
  pending: {
    label: "Pending",
    badgeClassName:
      "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300",
    accentClassName:
      "bg-slate-200 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300",
  },
  accepted: {
    label: "Accepted",
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
    accentClassName:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  declined: {
    label: "Declined",
    badgeClassName:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300",
    accentClassName:
      "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  },
  expired: {
    label: "Expired",
    badgeClassName:
      "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    accentClassName:
      "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
  scheduled: {
    label: "Scheduled",
    badgeClassName:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300",
    accentClassName:
      "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  },
  completed: {
    label: "Completed",
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
    accentClassName:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    badgeClassName:
      "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    accentClassName:
      "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
};

const fallbackStatusAppearance: ApplicationStatusAppearance = {
  label: "Unknown",
  badgeClassName:
    "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  accentClassName:
    "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

const statusAliases: Record<string, ApplicationStatusKey> = {
  applied: "applied",
  "under review": "under_review",
  underreview: "under_review",
  review: "under_review",
  recommended: "recommended",
  shortlisted: "shortlisted",
  interview: "interview",
  offer: "offer",
  hire: "hire",
  hired: "hire",
  rejected: "rejected",
  withdrawn: "withdrawn",
  failed: "withdrawn",
  pending: "pending",
  accepted: "accepted",
  declined: "declined",
  expired: "expired",
  processing: "pending",
  scheduled: "scheduled",
  completed: "completed",
  cancelled: "cancelled",
  canceled: "cancelled",
};

const normalizeStatusToken = (status?: string | null) =>
  status?.trim().toLowerCase().replace(/[\s_-]+/g, " ") ?? "";

export const normalizeApplicationStatusKey = (
  status?: string | null,
): ApplicationStatusKey => {
  const normalized = normalizeStatusToken(status);

  if (!normalized) {
    return "unknown";
  }

  if (normalized in statusAliases) {
    return statusAliases[normalized];
  }

  return "unknown";
};

export const getApplicationStatusAppearance = (status?: string | null) => {
  const key = normalizeApplicationStatusKey(status);
  const appearance =
    key === "unknown" ? fallbackStatusAppearance : applicationStatusConfig[key];

  return {
    key,
    label: key === "unknown" ? status?.trim() || fallbackStatusAppearance.label : appearance.label,
    badgeClassName: appearance.badgeClassName,
    accentClassName: appearance.accentClassName,
  };
};
