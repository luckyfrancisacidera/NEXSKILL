import { CalendarDays, Eye, Loader2, Mail, Sparkles, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import type { JobseekerApplicationStage, JobseekerOfferDto } from "@features/jobseeker/types";
import { getJobseekerListActions } from "@features/jobseeker/utils/applicationActionRules";
import { ActionButton } from "@shared/components/actions/ActionButton";
import { Badge } from "@shared/components/data-display/Badge";
import { Button } from "@shared/components/actions/Button";
import { Card } from "@shared/components/data-display/Card";
import { StatusBadge } from "@shared/components/data-display/StatusBadge";
import { cn } from "@shared/utils/cn";

import { OfferStageTimeline } from "./OfferStageTimeline";

export interface OfferPipelineCardData {
  id: string;
  jobId?: string;
  jobTitle: string;
  companyName: string;
  recruiterName: string;
  recruiterEmail?: string;
  createdAtUtc: string;
  currentStage: JobseekerApplicationStage | string;
  hasOffer: boolean;
  isHired: boolean;
  offeredAtUtc?: string | null;
  hiredAtUtc?: string | null;
  legacyHint?: string | null;
  offer?: JobseekerOfferDto | null;
  updatedAtUtc?: string;
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const resolveStatusMessage = (item: OfferPipelineCardData) => {
  if (item.isHired) {
    return item.hiredAtUtc
      ? `Hired on ${formatDate(item.hiredAtUtc)}`
      : "You have been marked as hired for this role.";
  }

  if (item.hasOffer) {
    return item.offer?.status === "Pending"
      ? "Your offer is ready for review."
      : `Offer status: ${item.offer?.status ?? "Updated"}.`;
  }

  return `Current stage: ${item.currentStage}`;
};

const CompactDetailChip = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <span className="inline-flex min-w-0 items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium leading-4 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 sm:px-2.5 sm:py-1 sm:text-[11px]">
    <span className="text-zinc-400 dark:text-zinc-500">{label}</span>
    <span className="truncate text-zinc-700 dark:text-zinc-200">{value}</span>
  </span>
);

const buildTimelineDates = (item: OfferPipelineCardData) => ({
  Applied: item.createdAtUtc,
  Offer: item.offeredAtUtc ?? undefined,
  Hired: item.hiredAtUtc ?? undefined,
});

const resolveNextAction = (item: OfferPipelineCardData) => {
  switch (item.currentStage) {
    case "Applied":
      return "Your application has been received and is waiting for review.";
    case "Under Review":
      return "Recruiters are reviewing your resume and fit for the role.";
    case "Shortlisted":
      return "You are shortlisted. Watch for interview scheduling updates.";
    case "Interview":
      return "Prepare for the interview and keep an eye on your inbox.";
    case "Offer":
      return "Open the offer to review the full package and response options.";
    case "Hired":
      return "Hiring is complete for this application.";
    case "Rejected":
      return "This application is closed.";
    case "Withdrawn":
      return "You withdrew this application.";
    default:
      return "We will keep this timeline updated as the process moves.";
  }
};

const resolveOfferStatusBadgeLabel = (status?: string | null) => {
  if (!status) {
    return "Offer";
  }

  return `Offer ${status}`;
};

export const OfferPipelineCard = ({
  item,
  onDeleteHistory,
  onViewOffer,
  isActing,
  isDeletingHistory,
}: {
  item: OfferPipelineCardData;
  onDeleteHistory: (applicationId: string) => void;
  onViewOffer: (item: OfferPipelineCardData) => void;
  isActing?: boolean;
  isDeletingHistory?: boolean;
}) => {
  const actions = getJobseekerListActions(item.currentStage, "offers");
  const jobDetailsButtonClassName =
    "inline-flex min-h-[2.125rem] items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:min-h-9 sm:px-3.5 sm:py-2 sm:text-sm";

  return (
    <Card className="rounded-[20px] border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-4">
      <div className="space-y-3 sm:space-y-3.5">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2
                className="max-w-full truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100 sm:text-base md:text-lg"
                title={item.jobTitle}
              >
                {item.jobTitle}
              </h2>
              <StatusBadge status={item.currentStage} />
              {item.offer ? <StatusBadge status={item.offer.status} label={resolveOfferStatusBadgeLabel(item.offer.status)} /> : null}
            </div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
              <span className="max-w-full truncate font-medium text-zinc-700 dark:text-zinc-300" title={item.companyName}>
                {item.companyName}
              </span>
              <span className="hidden text-zinc-300 dark:text-zinc-700 md:inline">•</span>
              <span className="truncate">Recruiter: {item.recruiterName}</span>
              <span className="hidden text-zinc-300 dark:text-zinc-700 md:inline">•</span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Applied {formatDate(item.createdAtUtc)}
              </span>
            </div>
          </div>
          <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-1.5 sm:gap-2 lg:max-w-[42%] lg:justify-end">
            {item.hasOffer ? <Badge>Offer flow</Badge> : null}
            {item.updatedAtUtc ? (
              <CompactDetailChip label="Updated" value={formatDate(item.updatedAtUtc) ?? "Recently"} />
            ) : null}
            {item.recruiterEmail ? (
              <CompactDetailChip label="Contact" value={item.recruiterEmail} />
            ) : null}
          </div>
        </div>

        <div className="w-full rounded-[18px] border border-zinc-200 bg-zinc-50 px-2.5 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/70 sm:px-3 sm:py-3">
          <OfferStageTimeline activeStage={item.currentStage} stageDates={buildTimelineDates(item)} />
        </div>

        {item.legacyHint ? (
          <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 sm:text-xs">
            <p className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> Legacy fallback in use
            </p>
            <p className="mt-1 leading-5">{item.legacyHint}</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:items-end">
          <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{resolveStatusMessage(item)}</p>
            <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-300 sm:text-sm">{resolveNextAction(item)}</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-2">
            <div className="flex w-full gap-2 sm:w-auto sm:flex-nowrap">
              {item.offer ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isActing}
                  className="h-9 flex-1 px-3 text-sm sm:flex-none"
                  onClick={() => onViewOffer(item)}
                >
                  View Offer
                </Button>
              ) : null}
              {item.jobId ? (
                <Link
                  to={`/jobs/${item.jobId}`}
                  title="View job"
                  aria-label="View job"
                  className={cn(jobDetailsButtonClassName, "h-9 flex-1 px-3 sm:flex-none")}
                >
                  <Eye className="h-4 w-4" />
                  <span>View Job Details</span>
                </Link>
              ) : null}
            </div>
            {item.recruiterEmail ? (
              <a
                href={`mailto:${item.recruiterEmail}`}
                className={cn(jobDetailsButtonClassName, "h-9 w-full px-3 sm:w-auto")}
              >
                <Mail className="h-4 w-4" />
                <span>Contact Recruiter</span>
              </a>
            ) : null}
            {actions.includes("delete_history") ? (
              <>
                <ActionButton
                  icon={isDeletingHistory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  label="Delete history"
                  destructive
                  className="hidden sm:inline-flex"
                  iconOnly
                  disabled={isDeletingHistory || isActing}
                  onClick={() => onDeleteHistory(item.id)}
                />
                <ActionButton
                  icon={isDeletingHistory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  label="Delete history"
                  destructive
                  fullWidth
                  className="sm:hidden"
                  disabled={isDeletingHistory || isActing}
                  onClick={() => onDeleteHistory(item.id)}
                >
                  Delete history
                </ActionButton>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
};
